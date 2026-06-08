# Flujo y Arquitectura de WebSockets

Este documento describe de forma convencional y sencilla cómo está estructurado y cómo funciona el sistema de WebSockets en tiempo real para el sistema de pedidos.

---

## 1. Estructuras de Datos del `ConnectionManager`

La clase `ConnectionManager` (definida en `app/Core/websocket_manager.py`) utiliza tres estructuras principales en memoria para rastrear las conexiones de los clientes y agruparlas en salas (rooms):

*   **`active_connections: list[WebSocket]`**
    *   Una lista lineal que contiene todas las conexiones WebSocket actualmente abiertas y activas en el servidor.
*   **`rooms: dict[str, set[WebSocket]]`**
    *   Un diccionario donde la clave es el nombre de la sala (por ejemplo, `"role:admin"`, `"role:pedidos"`) y el valor es un conjunto (`set`) de WebSockets suscritos a esa sala.
*   **`socket_rooms: dict[WebSocket, set[str]]`**
    *   Un diccionario inverso donde la clave es la conexión `WebSocket` y el valor es un conjunto (`set`) con los nombres de las salas a las que pertenece dicha conexión. Sirve para acelerar la limpieza cuando un usuario se desconecta.

---

## 2. Flujo de Conexión

1. **Handshake**: El cliente del frontend inicia la conexión WebSocket enviando su token JWT en los parámetros de consulta:
   `ws://localhost:8000/ws?token=JWT`
2. **Validación**: En `wsRouter.py`, el endpoint `/ws` valida el token decodificándolo. Si es inválido, cierra el socket de inmediato con código `4001`.
3. **Registro y Clasificación**: Si el token es válido:
    * Se extrae el rol del usuario (por ejemplo, `"ADMIN"`, `"PEDIDOS"`, etc.).
    * Se llama a `manager.connect(websocket, role=role)`.
    * El manager acepta la conexión formalmente, la guarda en `active_connections` y lo une automáticamente a la sala correspondiente mapeando el rol a minúsculas: `"role:admin"`, `"role:pedidos"`, etc.

---

## 3. Flujo de Desconexión

Cuando un cliente se desconecta (por cerrar la pestaña, recargar o perder señal):

1. Se dispara una excepción `WebSocketDisconnect` en `wsRouter.py`.
2. Se llama a `manager.disconnect(websocket)`.
3. El manager realiza las siguientes acciones de limpieza:
    * Remueve la conexión de `active_connections`.
    * Busca el socket en `socket_rooms` para obtener todas las salas en las que estaba suscrito.
    * Entra a cada una de esas salas en `rooms` y quita el socket de sus conjuntos (`set`).
    * **Prevención de Fugas**: Si tras remover el socket una sala se queda vacía (sin conexiones activas), la sala se elimina por completo del diccionario `rooms` para evitar acumulación innecesaria en memoria.

---

## 4. Flujo de Broadcast (Emisión de Mensajes)

El backend puede emitir eventos en tiempo real mediante dos métodos asíncronos del manager:

### A. Broadcast Global
Envía el evento a absolutamente todos los clientes conectados.
*   **Ejemplo**: Cambios de precios globales o actualizaciones generales de stock (`stock.actualizado`).
*   **Funcionamiento**: Recorre `active_connections` y envía el mensaje a cada socket. Si algún envío falla, marca la conexión como caída para desconectarla después.

### B. Broadcast por Sala (Room)
Envía el evento únicamente a los clientes que pertenecen a una sala específica.
*   **Ejemplo**: Las notificaciones de nuevos pedidos (`pedido.nuevo`) solo se envían a la sala `"role:admin"` y `"role:pedidos"`.
*   **Funcionamiento**: Busca las conexiones asociadas en `rooms[room]` y transmite el mensaje solo a ellas. Al igual que en el global, si falla el envío a algún socket de la sala, se procede con su desconexión y limpieza.

## 5. Relación entre Broadcast Asíncrono y Síncrono (ws_broadcast.py)

Para evitar duplicaciones y mantener una única fuente de verdad en el envío real de mensajes, el sistema separa la emisión asíncrona de bajo nivel del puente de comunicación que utilizan los servicios:

*   **`ConnectionManager.broadcast` y `ConnectionManager.broadcast_room` (Asíncronos)**:
    *   Definidos en [websocket_manager.py](file:///c:/Users/tomim/Desktop/GUlianoParcial/Parcial1-Prog-4/backend/app/Core/websocket_manager.py).
    *   Son los responsables físicos de serializar el mensaje y enviarlo por la red a través del socket (`await connection.send_json(...)`).
*   **`broadcast_sync(event, data, room=None)` (Síncrono)**:
    *   Definido en [ws_broadcast.py](file:///c:/Users/tomim/Desktop/GUlianoParcial/Parcial1-Prog-4/backend/app/Core/ws_broadcast.py).
    *   **Propósito (Puente / Adaptador)**: La lógica de negocio del backend (como en [PedidoService](file:///c:/Users/tomim/Desktop/GUlianoParcial/Parcial1-Prog-4/backend/app/Modules/Pedidos/pedidoService.py)) se ejecuta en un contexto puramente síncrono (`def` tradicional). Debido a esto, no es posible llamar directamente a métodos asíncronos mediante `await`.
    *   **Mecanismo**: Este helper intercepta el llamado síncrono, obtiene el loop de ejecución asíncrono de FastAPI (`_loop`) que fue inicializado al levantar la aplicación, y le planifica la tarea asíncrona correspondiente del manager usando `asyncio.run_coroutine_threadsafe()`. Esto permite gatillar notificaciones asíncronas desde cualquier parte síncrona del sistema sin bloquear el hilo de ejecución principal.
