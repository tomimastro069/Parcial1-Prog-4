# 📝 Requisitos del Parcial 1 - Programación 4

## Estructura del Proyecto
El proyecto consiste en una aplicación Fullstack integrada (**FastAPI + React**) que debe persistir datos en **PostgreSQL**.

### 🛠️ Backend (FastAPI + SQLModel)
- **Módulos:** Categoría, Producto, Ingrediente y ProductoIngrediente.
- **Modelado de Datos:**
    - Relación **1:N** (Categoría ↔ Producto) usando `Relationship` y `back_populates`.
    - Relación **N:N** (Producto ↔ Ingrediente) usando la tabla intermedia `ProductoIngrediente`.
- **Lógica y Endpoints:**
    - Uso de `Annotated`, `Query` y `Path` para validaciones y parámetros.
    - Manejo de excepciones (`HTTPException`) y códigos de estado (201, 204, 404).
    - Implementación de `response_model` para seguridad de datos.
- **Arquitectura:** Código organizado por módulos (routers, schemas, services, models, uow).

### 🎨 Frontend (React + TypeScript + Tailwind)
- **Tecnologías:** Vite, TypeScript, Tailwind CSS 4.
- **Componentes:** Funcionales con Props debidamente tipadas.
- **Navegación:** `react-router-dom` con al menos una ruta dinámica (ej: `/detalle/:id`).
- **Estado y Server State:**
    - `useQuery` para listados y detalles.
    - `useMutation` para altas y ediciones.
    - Uso de `invalidateQueries` para refrescar la UI.
    - Manejo de estados de "Cargando..." y "Error".

---

## 📺 Estructura de la Presentación (Video Máx 15 min)
1. **Backend (4-5 min):** Mostrar modelos, relaciones, endpoints y persistencia en la DB.
2. **Frontend (4-5 min):** Mostrar estructura de componentes, tipado, TanStack Query y navegación.
3. **Demo en Vivo (5 min):**
    - CRUD completo (Crear, leer, editar, eliminar).
    - Validaciones de errores (probar datos inválidos).
    - Mostrar relaciones en la UI (ej: "Este producto tiene estos ingredientes").

---

## 📋 Checklist de Entrega
- [ ] Entorno: `.venv` y `requirements.txt` configurados.
- [ ] Modelado: Tablas creadas con SQLModel y relaciones correctas.
- [ ] CRUD: Endpoints funcionales contra PostgreSQL.
- [ ] Integración: El frontend consume datos reales de la API.
- [ ] Diseño: Interfaz limpia y responsive con Tailwind CSS.
- [ ] Código: Repositorio en GitHub/GitLab con `README.md`.
- [ ] Video: Link a YouTube (oculto) o Drive con permisos de acceso.
