# 🎬 Guión Demo en Vivo — Parcial 2 (Sin Audio)

**Duración objetivo:** ~5 minutos  
**Estilo:** Solo grabación de pantalla interactuando con la app. Es CRUCIAL hacer movimientos de mouse claros para señalar cosas, ya que no habrá voz que lo explique.

> **Preparación antes de grabar:**
> - Abrir el navegador en el Frontend (`http://localhost:5173`).
> - Abrir la consola de **DevTools (F12) en la pestaña "Network" (Red)** o tener la terminal del backend visible a un costado de la pantalla para que se vean las peticiones al hacer clics.

---

### Escena 1: Validaciones de Frontend y Pydantic (1 minuto)

**Objetivo:** Demostrar que no se pueden meter datos basura y que saltan errores.

**Pasos en pantalla:**
1. Loguearse como administrador (`admin@foodstore.com` / `admin123`).
2. Ir a la sección de administración de **Productos** (o Categorías).
3. Hacer clic en "Crear Producto".
4. Dejar el formulario completamente vacío o poner un precio negativo.
5. Hacer clic en "Guardar/Crear".
6. Mover el mouse en círculos alrededor del **mensaje de error** rojo que aparece en pantalla (las validaciones saltando).
7. Mover el mouse hacia la consola del navegador o la terminal para mostrar el error 400/422 que devolvió el servidor.

---

### Escena 2: Relaciones en la UI (1 minuto)

**Objetivo:** Mostrar cómo un producto está atado a otras entidades (Categorías, Ingredientes).

**Pasos en pantalla:**
1. En la vista de administración, abrir para editar un producto que ya exista (ej. "Burger Clásica").
2. Mover el mouse lentamente señalando cómo ese producto tiene seleccionada la **Categoría** ("Hamburguesas").
3. Señalar la sección donde se ven los **Ingredientes** asociados (Carne, Lechuga, Tomate, etc).
4. Volver a la vista principal de la tienda (Store) como cliente.
5. Hacer clic en la "Burger Clásica" para ver el detalle.
6. Seleccionar (resaltar con el mouse) la descripción, la categoría y la lista de ingredientes que se le muestra al cliente final, demostrando que toda esa data cruzada se muestra bien.

---

### Escena 3: CRUD Completo Integrador (2 minutos)

**Objetivo:** Demostrar que Crear, Editar y Eliminar funciona de principio a fin, impactando la base de datos real.

**Pasos en pantalla:**
1. Estando en el panel Admin de **Categorías**.
2. **CREATE:** Crear una nueva categoría llamada "Postres Temporada". Completar el nombre y darle a Guardar. Mostrar cómo aparece inmediatamente en la tabla.
3. **READ/RELATION:** Ir a crear un nuevo **Producto** ("Helado"). Ponerle precio, y al elegir la categoría, desplegar el menú y hacer una pausa para que se vea que "Postres Temporada" ya sale en la lista. Elegirla y guardar.
4. **UPDATE:** Hacer clic en editar ese "Helado". Cambiarle el precio y el nombre a "Helado de Chocolate". Guardar. Mostrar en la tabla que se actualizó.
5. **DELETE:** Hacer clic en el botón de eliminar del Helado. Aceptar el modal de confirmación. Mostrar cómo desaparece de la tabla.
6. Si es posible, pasar el mouse por la terminal del backend de fondo para que el profesor vea que cayeron los logs de `POST`, `PATCH` y `DELETE`.

---

### Escena 4: Máquina de Estados del Pedido (1 minuto)

**Objetivo:** Demostrar la regla de negocio más importante del parcial (El ciclo de vida de un pedido).

**Pasos en pantalla:**
1. Como Cliente (o incógnito), agregar 2 cosas al carrito y darle a confirmar (Checkout).
2. Cambiar rápido a la pantalla del **Gestor de Pedidos** (Admin/Empleado).
3. Señalar el nuevo pedido que acaba de entrar en estado **PENDIENTE**.
4. Hacer clic en el botón para avanzar el estado: **Aprobar** (Pasa a CONFIRMADO).
5. Hacer clic en el botón **Iniciar Prep** (Pasa a EN_PREP).
6. Seguir haciendo clic lentamente hasta que el pedido quede como **ENTREGADO**.
7. *Opcional:* Entrar con un cliente, crear otro pedido, e intentar Cancelarlo directamente desde el perfil del cliente para demostrar que esa función existe.
