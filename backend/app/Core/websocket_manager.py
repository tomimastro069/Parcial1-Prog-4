import logging
from typing import Any
from fastapi import WebSocket

# Configuración del logger para el módulo
logger = logging.getLogger(__name__)

# =============================================================================
# CONNECTION MANAGER (ENTERPRISE WEBSOCKET ORCHESTRATOR)
# =============================================================================
#
# Este módulo provee el `ConnectionManager`, un gestor centralizado de conexiones
# WebSocket de grado empresarial y alto rendimiento. Su función principal es
# abstraer y administrar el ciclo de vida de los sockets abiertos, controlando
# las suscripciones a salas (rooms), la segmentación por roles y el envío de
# mensajes bidireccionales en tiempo real de forma segura y con tolerancia a fallos.
#
# ESTRUCTURAS DE DATOS PRINCIPALES:
#
#   1. active_connections: list[WebSocket]
#      Mantiene un registro de todas las conexiones activas en el servidor.
#      Sirve principalmente para iterar y emitir eventos a nivel global (broadcast).
#
#   2. rooms: dict[str, set[WebSocket]]
#      Mapa de canales/salas. Asocia el identificador de una sala (e.g., "role:admin",
#      "pedido:123") con el conjunto (set) de WebSockets suscritos a ella. El uso
#      de sets garantiza búsquedas y eliminaciones eficientes O(1) y evita duplicados.
#
#   3. socket_rooms: dict[WebSocket, set[str]]
#      Mapa inverso de suscripciones. Asocia una conexión WebSocket específica con el
#      conjunto de nombres de salas a las que pertenece actualmente. Esto optimiza el
#      proceso de desconexión, permitiendo dar de baja al cliente de todas sus salas
#      en O(N) respecto a las salas en las que está, en lugar de recorrer todas las
#      salas del sistema (O(M)).
#
# FLUJOS PRINCIPALES:
#
#   - FLUJO DE CONEXIÓN:
#     1. El cliente inicia el handshake WebSocket (wsRouter.py).
#     2. Se decodifica y valida el token JWT, obteniendo los datos del usuario.
#     3. Se invoca `await manager.connect(websocket, role)`.
#     4. Se acepta formalmente la conexión (`await websocket.accept()`).
#     5. Se añade el socket a `active_connections`.
#     6. Si se especifica un rol, se llama internamente a `join_room(websocket, f"role:{role}")`
#        para registrar al usuario automáticamente en su canal temático.
#
#   - FLUJO DE DESCONEXIÓN:
#     1. Se detecta el cierre del socket o una desconexión abrupta (WebSocketDisconnect).
#     2. Se invoca `manager.disconnect(websocket)`.
#     3. Se remueve el socket de `active_connections`.
#     4. Se consultan las salas del socket usando `socket_rooms.get(websocket)`.
#     5. Por cada sala, se remueve el socket de `rooms[room]`.
#     6. Si una sala queda vacía tras la remoción, se elimina del diccionario `rooms`
#        para evitar la fuga/acumulación de memoria (Memory Leaks).
#     7. Se remueve la entrada del socket de `socket_rooms`.
#
#   - FLUJO DE BROADCAST GLOBAL:
#     1. Se invoca `await manager.broadcast(event, data)`.
#     2. Se serializa el payload.
#     3. Se recorren todas las conexiones de `active_connections`.
#     4. Se intenta enviar el mensaje usando `connection.send_json`.
#     5. Si ocurre un fallo de E/S, se añade la conexión a una lista de conexiones caídas.
#     6. Se remueven de manera diferida todas las conexiones caídas invocando `disconnect()`.
#
#   - FLUJO DE BROADCAST POR ROOM (O ROL):
#     1. Se invoca `await manager.broadcast_room(room, event, data)`.
#     2. Se buscan las conexiones suscritas a la sala en `rooms`.
#     3. Se recorre y envía el JSON a cada una de ellas.
#     4. Ante fallos de envío, se registran los sockets caídos y se limpian al finalizar.
#
#   - MANEJO DE CONEXIONES CAÍDAS (CLEANUP AUTOMÁTICO):
#     Para evitar almacenar sockets "huérfanos" (que fallaron pero no dispararon un
#     evento de desconexión controlado por la librería), los métodos de envío
#     interceptan cualquier excepción durante la escritura. Si una conexión falla, se
#     marca como inactiva y se desconecta de manera segura al terminar la iteración de envío.
#
# =============================================================================
class ConnectionManager:
    def __init__(self) -> None:
        """
        Inicializa las estructuras de datos para el seguimiento de sockets y salas.
        """
        self.active_connections: list[WebSocket] = []
        self.rooms: dict[str, set[WebSocket]] = {}
        self.socket_rooms: dict[WebSocket, set[str]] = {}

    async def connect(self, websocket: WebSocket, role: str | None = None) -> None:
        """
        Acepta una nueva conexión WebSocket y la registra en el manager.
        Si se proporciona un rol, se asocia automáticamente a la sala correspondiente.
        """
        await websocket.accept()
        self.active_connections.append(websocket)
        logger.info(f"Conexión WebSocket establecida. Conexiones activas: {len(self.active_connections)}")

        if role:
            # Normalizamos el nombre del rol a minúsculas
            role_room = f"role:{role.lower()}"
            self.join_room(websocket, role_room)
            logger.info(f"Conexión asociada al rol/room: {role_room}")

    def disconnect(self, websocket: WebSocket) -> None:
        """
        Elimina la conexión de la lista global y de todas las salas a las que pertenece,
        removiendo estructuras vacías para optimizar el uso de memoria.
        """
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
            logger.info(f"Conexión WebSocket desconectada. Conexiones activas: {len(self.active_connections)}")

        # Limpiar de todas las salas
        if websocket in self.socket_rooms:
            rooms_to_leave = list(self.socket_rooms[websocket])
            for room in rooms_to_leave:
                if room in self.rooms:
                    self.rooms[room].discard(websocket)
                    if not self.rooms[room]:
                        del self.rooms[room]
                        logger.debug(f"Room '{room}' eliminada por inactividad (sin conexiones).")
            del self.socket_rooms[websocket]
            logger.info("Conexión limpiada de todas las salas exitosamente.")

    def join_room(self, websocket: WebSocket, room: str) -> None:
        """
        Suscibe una conexión WebSocket activa a una sala específica.
        """
        if room not in self.rooms:
            self.rooms[room] = set()
        self.rooms[room].add(websocket)

        if websocket not in self.socket_rooms:
            self.socket_rooms[websocket] = set()
        self.socket_rooms[websocket].add(room)

        logger.debug(f"Conexión unida a la sala '{room}'. Total en sala: {len(self.rooms[room])}")

    def leave_room(self, websocket: WebSocket, room: str) -> None:
        """
        Desvincula una conexión WebSocket de una sala específica.
        """
        if room in self.rooms:
            self.rooms[room].discard(websocket)
            if not self.rooms[room]:
                del self.rooms[room]
                logger.debug(f"Room '{room}' eliminada por inactividad (sin conexiones).")

        if websocket in self.socket_rooms:
            self.socket_rooms[websocket].discard(room)
            if not self.socket_rooms[websocket]:
                del self.socket_rooms[websocket]

        logger.debug(f"Conexión removida de la sala '{room}'.")

    async def broadcast(self, event: str, data: dict[str, Any] | None = None) -> None:
        """
        Emite un evento en formato JSON a todas las conexiones registradas.
        Limpia automáticamente cualquier conexión que resulte fallida durante el envío.
        """
        if data is None:
            data = {}

        message = {"event": event, "data": data}
        logger.info(f"Iniciando broadcast global del evento '{event}' a {len(self.active_connections)} conexiones.")

        dead_connections: list[WebSocket] = []
        for connection in self.active_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error al enviar broadcast global. Conexión marcada para limpieza. Detalle: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    async def broadcast_room(self, room: str, event: str, data: dict[str, Any] | None = None) -> None:
        """
        Emite un evento en formato JSON únicamente a las conexiones suscritas a una sala (room) específica.
        Limpia automáticamente cualquier conexión que resulte fallida durante el envío.
        """
        if data is None:
            data = {}

        message = {"event": event, "data": data}
        target_connections = self.rooms.get(room, set())
        logger.info(f"Iniciando broadcast del evento '{event}' en la sala '{room}' a {len(target_connections)} conexiones.")

        dead_connections: list[WebSocket] = []
        for connection in target_connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error al enviar broadcast en room '{room}'. Conexión marcada para limpieza. Detalle: {e}")
                dead_connections.append(connection)

        for dead in dead_connections:
            self.disconnect(dead)

    def get_active_connections_count(self) -> int:
        """
        Retorna la cantidad actual de conexiones WebSocket activas en el manager.
        """
        return len(self.active_connections)


# Instancia única (Singleton) global para toda la aplicación
manager = ConnectionManager()
