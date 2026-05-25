# 🎬 Guión Backend — Parcial 2

**Duración objetivo:** 4–5 minutos  
**Personas:** 2 (Persona A y Persona B)  
**Formato:** Clips cortos de ~1 min cada uno, luego se juntan  

> **Regla de oro:** No leer código línea por línea. Abrís el archivo, señalás lo importante y explicás el CONCEPTO.

---

## 🎤 Persona A — Arquitectura y Modelos (~2:30 min)

### Clip 1 — Estructura del proyecto y arranque (≈1 min)

**Qué mostrar en pantalla:**
1. El árbol de carpetas en el editor (sidebar): `app/Core/`, `app/Modules/`, `main.py`, `seed.py`
2. Abrir [main.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/main.py)

**Qué decir:**
> "Nuestro backend está hecho con FastAPI y Python. La estructura está dividida en dos grandes bloques: `Core`, que tiene la infraestructura transversal — base de datos, seguridad, Unit of Work — y `Modules`, donde vive cada dominio del negocio: Categorías, Productos, Pedidos, Auth, etc."
>
> "En `main.py` registramos todos los routers con sus prefijos bajo `/api/v1/`. También configuramos el CORS para que solo nuestro frontend en el puerto 5173 pueda consumir la API, y en el `lifespan` se crean las tablas y se ejecuta el seed automáticamente al levantar."

**Archivos en pantalla:** sidebar del proyecto → [main.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/main.py) (líneas 49–74 aprox, donde están los routers y el CORS)

---

### Clip 2 — Modelado de datos y relaciones (≈1:30 min)

**Qué mostrar en pantalla:**
1. [categoria.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Categoria/categoria.py) — relación jerárquica
2. [pedido.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Pedidos/Model/pedido.py) — modelo con relaciones
3. [detallePedido.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Pedidos/Model/detallePedido.py) — snapshot pattern
4. [historialEstadoPedido.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Pedidos/Model/historialEstadoPedido.py) — audit trail
5. [usuario.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Usuarios/usuario.py) — modelo con enum de roles

**Qué decir:**

> "Todos nuestros modelos usan SQLModel. Arrancamos con `Categoria`: acá ven la autorreferencia con `parent_id` que apunta a la misma tabla, y usamos `Relationship` con `back_populates` para armar la jerarquía padre-hijos."
>
> *(Cambiar a pedido.py)*
>
> "El modelo `Pedido` es el más complejo. Tiene relaciones con `EstadoPedido`, `FormaPago`, una lista de `DetallePedido` y una lista de `HistorialEstadoPedido`. Fíjense en el `deleted_at` — es nuestro soft delete, nunca borramos físicamente un pedido."
>
> *(Cambiar a detallePedido.py)*
>
> "En `DetallePedido` aplicamos el **Snapshot Pattern**: guardamos `nombre_snapshot` y `precio_snapshot` al momento de crear el pedido. Si mañana el producto cambia de precio, el pedido histórico mantiene el precio original. Eso es inmutabilidad del dato."
>
> *(Cambiar a historialEstadoPedido.py)*
>
> "Y el `HistorialEstadoPedido` es nuestro **Audit Trail append-only**: solo hace INSERTs, jamás UPDATE ni DELETE. Cada cambio de estado queda registrado con `estado_desde`, `estado_hacia`, quién lo hizo y cuándo."

---

## 🎤 Persona B — Patrones, Endpoints y Seed (~2:30 min)

### Clip 3 — Unit of Work + Repository Pattern (≈1 min)

**Qué mostrar en pantalla:**
1. [unit_of_work.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Core/UnitOfWork/unit_of_work.py)
2. [BaseRepository.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Core/UnitOfWork/BaseRepository.py) (mostrar las primeras 50 líneas, no hace falta todo)

**Qué decir:**

> "Para la capa de datos usamos dos patrones: **Unit of Work** y **Repository**."
>
> "El Unit of Work coordina la transacción: recibe la sesión de SQLModel y expone todos los repositorios. Funciona como context manager — si algo falla, hace `rollback` automático; si todo sale bien, `commit`. El Service NUNCA hace `session.commit()` directamente."
>
> *(Cambiar a BaseRepository.py)*
>
> "El `BaseRepository` es genérico con `Generic[T]`: tiene el CRUD base — `add`, `update`, `delete`, `get`, `get_list` — y un método `search` que soporta paginación, filtros exactos y búsqueda parcial con ILIKE. Cada módulo hereda de este base y agrega sus queries propias."

---

### Clip 4 — Auth, Seguridad y RBAC (≈1 min)

**Qué mostrar en pantalla:**
1. [deps.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Core/Security/deps.py) — flujo de autenticación
2. [authRouter.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Auth/authRouter.py) — endpoint de login con cookie

**Qué decir:**

> "La seguridad tiene un flujo claro que pueden ver en el docstring: el request llega, se extrae el JWT de la cookie HttpOnly — no del header Authorization, eso es a propósito para mitigar XSS —, se decodifica, se busca el usuario y se valida que esté activo."
>
> "Para el RBAC usamos `require_role`, que es una factory de dependencias: le pasás los roles permitidos y te devuelve un `Depends()` que valida automáticamente. Si el rol no coincide, tira 403."
>
> *(Cambiar a authRouter.py)*
>
> "En el login, fíjense en la línea del `set_cookie`: el token se manda como cookie `httponly=True` y `samesite=lax`. También tenemos rate limiting — máximo 5 intentos por minuto — y un endpoint `/me` para obtener los datos del usuario autenticado."

---

### Clip 5 — Endpoint con Annotated + Query, y Seed (≈30 seg)

**Qué mostrar en pantalla:**
1. [categoriaRouter.py](file:///home/cristian/repos_utn/Parcial1-Prog-4/backend/app/Modules/Categoria/categoriaRouter.py) — endpoint GET con `Annotated` y `Query`
2. Terminal ejecutando el seed (o los logs del seed en la terminal de Docker)

**Qué decir:**

> "Acá en categorías ven el uso de `Annotated` con `Query` para los parámetros de paginación y filtros. El `page` tiene validación `ge=1`, el `size` acepta hasta 1000, y `search` e `is_active` son opcionales."
>
> *(Cambiar a terminal / logs de docker)*
>
> "El seed se ejecuta automáticamente al levantar el servidor. Carga: el usuario admin, las unidades de medida, categorías, ingredientes, productos con sus relaciones, los 6 estados de pedido — PENDIENTE, CONFIRMADO, EN_PREP, EN_CAMINO, ENTREGADO, CANCELADO — y las formas de pago."

---

## 📋 Checklist antes de grabar

| ✅ | Qué preparar |
|---|---|
| ☐ | Docker levantado y funcionando (`docker compose up --build`) |
| ☐ | Editor con el proyecto abierto y sidebar visible |
| ☐ | Fuente del editor legible (tamaño 16+ para la grabación) |
| ☐ | Terminal visible con los logs del seed |
| ☐ | Tener pgAdmin o DBeaver abierto con las tablas (opcional pero suma) |
| ☐ | Swagger UI abierto en `/docs` como backup visual |

## 🗂️ Resumen de archivos por clip

| Clip | Persona | Archivos |
|---|---|---|
| 1 | A | Sidebar, `main.py` |
| 2 | A | `categoria.py`, `pedido.py`, `detallePedido.py`, `historialEstadoPedido.py`, `usuario.py` |
| 3 | B | `unit_of_work.py`, `BaseRepository.py` |
| 4 | B | `deps.py`, `authRouter.py` |
| 5 | B | `categoriaRouter.py`, terminal/logs |
