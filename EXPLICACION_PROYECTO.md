# 📄 Explicación Detallada del Proyecto (Guía por Archivos)

Este documento proporciona una visión técnica detallada de la estructura y el funcionamiento de cada componente del proyecto, tanto en el **Backend** como en el **Frontend**.

---

## 🏗️ Arquitectura General

El proyecto sigue una **Arquitectura Modular** y limpia, diseñada para ser escalable y mantenible. Se separa la lógica de negocio, el acceso a datos y la interfaz de usuario de manera clara.

---

## 🔙 Backend (FastAPI + SQLModel)

El backend está organizado en dos grandes bloques dentro de la carpeta `app`: **Core** (infraestructura compartida) y **Modules** (lógica de dominio).

### 🛠️ Carpeta: `app/Core`
Contiene la configuración fundamental y patrones de diseño para el acceso a datos.

*   **`database.py`**: Gestiona la conexión con PostgreSQL utilizando **SQLModel**. Define el `engine` (motor de base de datos) y la función `get_session`, que provee sesiones de base de datos de forma segura para cada petición.
*   **`repository.py`**: Implementa el **Patrón Repositorio** genérico. Abstrae las operaciones CRUD (Crear, Leer, Actualizar, Borrar) base para que no sea necesario repetir código SQL/ORM en cada módulo.
*   **`unit_of_work.py`**: Implementa el patrón **Unit of Work (UoW)**. Actúa como un administrador que coordina los repositorios y asegura la **atomicidad** de las transacciones (si algo falla en una operación múltiple, se hace rollback de todo).

### 📦 Carpeta: `app/Modules`
Cada carpeta dentro de `Modules` represent una entidad del negocio (Categoría, Ingrediente, Producto). Todas siguen la misma estructura interna:

1.  **`Model/`**:
    *   `entidad.py`: Define la tabla en la base de datos usando SQLModel. Aquí se declaran las columnas, tipos de datos, claves foráneas y relaciones (ej: un Producto tiene muchos Ingredientes).
2.  **`Schema/`**:
    *   `entidad_schema.py`: Define los **DTOs (Data Transfer Objects)** usando Pydantic. Sirven para validar los datos que entran y salen de la API (ej: validar que el precio sea positivo).
3.  **`Service/`**:
    *   `entidad_service.py`: Contiene la **Lógica de Negocio**. Aquí se decide *qué* hacer con los datos antes de guardarlos o después de leerlos.
4.  **`Router/`**:
    *   `entidad_router.py`: Define los **Endpoints** (puntos de entrada URL). Recibe las peticiones HTTP y delega la ejecución al Servicio correspondiente.

### 🚀 Archivos de Raíz del Backend
*   **`main.py`**: El punto de entrada de la aplicación. Configura FastAPI, los middlewares (CORS), incluye todas las rutas de los módulos y define el ciclo de vida (lifespan) para crear las tablas al iniciar.
*   **`docker-compose.yml`**: Orquestador para levantar el contenedor del Backend y la base de datos PostgreSQL de forma automática y aislada.

---

## 🎨 Frontend (React + Vite + TS)

El frontend está desarrollado con React, utilizando TypeScript para mayor robustez y una estructura moderna de carpetas en `src`.

### 📂 Estructura en `src/`
*   **`main.tsx`**: Punto de entrada de React. Monta la aplicación en el DOM del navegador.
*   **`App.tsx`**: Componente raíz. Configura los proveedores globales como **React Query** (para manejo de estado de API), **React Router** (navegación) y el sistema de notificaciones.
*   **`routes/AppRoutes.tsx`**: Define todas las rutas de la aplicación (ej: `/productos`, `/categorias`).
*   **`api/`**: Contiene las funciones que realizan las peticiones `fetch` o `axios` al Backend.
*   **`hooks/`**: Custom hooks para encapsular lógica reutilizable (ej: `useProductos` para traer la lista de la API).
*   **`components/`**: Componentes de interfaz reutilizables (Botones, Formularios, Modales).
*   **`pages/`**: Vistas completas de la aplicación (ej: `Home.tsx`, `ProductoDetalle.tsx`).
*   **`types/`**: Definiciones de interfaces TypeScript que coinciden con los modelos del Backend.

---

## 🔄 Flujo de Trabajo (Ejemplo: Crear Producto)

1.  **Frontend**: El usuario llena un formulario en una `Page` y hace clic en "Guardar".
2.  **API**: Se dispara una petición POST desde la carpeta `api/` hacia el Backend.
3.  **Router**: El `producto_router.py` recibe la petición y valida el esquema de entrada (`producto_schema.py`).
4.  **Service**: El `producto_service.py` recibe los datos, inicia una transacción a través del `Unit of Work`, valida que los ingredientes existan y guarda el producto.
5.  **Repository/UoW**: El repositorio ejecuta la inserción en PostgreSQL y el UoW confirma (`commit`) la transacción.
6.  **Respuesta**: El backend devuelve el producto creado, y el frontend actualiza la interfaz usando **React Query**.

---

## 🛠️ Herramientas y Entorno
*   **Docker**: Para asegurar que el proyecto funcione igual en cualquier computadora.
*   **Swagger UI**: Disponible en `/docs` del backend para probar los endpoints interactivamente.
*   **SQLModel**: Combina el poder de SQLAlchemy (ORM) y Pydantic (Validación).
