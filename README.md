# FoodStore

## 👥 Integrantes
- Tomas Mastropietro
- Cristian Krahulik
- Juan Segura
- Lautaro Castillo

## 🎥 Presentaciones y Demos
- **Video parcial 1:** [Ver en YouTube](https://youtu.be/X3pORulwOEM)
- **Video parcial 2:** [Ver en YouTube](https://youtu.be/BY-iPu9SmIM)
- **Video Final:** [Ver en YouTube](https://www.youtube.com/watch?v=zrqhsjaqY-o)

## 🌟 Video Final (Presentación Completa)
Aquí puedes ver la demostración final y completa de nuestro proyecto funcionando:
▶️ **[Ver Video Final en YouTube](https://www.youtube.com/watch?v=zrqhsjaqY-o)**

---

## 🚀 Guía de Ejecución

A continuación se detallan los pasos para configurar, ejecutar y evaluar el proyecto. El código está dividido en dos carpetas principales ubicadas en la raíz del repositorio: `backend` y `frontend`.

### ⚙️ Configuración de Variables de Entorno (.env)

Dado que las credenciales y configuraciones sensibles no se versionan en Git, debes crear los archivos `.env` basándote en los ejemplos provistos:

1. **En el Backend:**
   Copia el archivo `.env.example` y renombralo a `.env`:
   ```bash
   cp backend/.env.example backend/.env
   ```
   *Nota: El archivo `.env` del backend contiene la configuración para la conexión a la base de datos PostgreSQL de Docker, la clave secreta para JWT, las credenciales de Cloudinary y las llaves de prueba de Mercado Pago.*

2. **En el Frontend:**
   Copia el archivo `.env.example` y renombralo a `.env`:
   ```bash
   cp frontend/.env.example frontend/.env
   ```

---

### 1. Inicializar el Backend
El entorno del backend está preparado y orquestado con Docker, que incluye la aplicación FastAPI y una base de datos PostgreSQL. 

**La base de datos, las tablas y la carga de datos iniciales (seeds) se crean y cargan automáticamente al iniciar el backend.**

Para levantarlo, abre una terminal en la raíz del proyecto y ejecuta:
```bash
# Ingresar a la carpeta del backend
cd backend/

# Construir y levantar los contenedores en Docker
docker compose up --build
```
El servidor backend estará disponible en `http://localhost:8000` y la documentación interactiva de la API (Swagger UI) en `http://localhost:8000/docs`.

### 2. Inicializar el Frontend
El frontend requiere Node.js instalado. En una **nueva terminal** (manteniendo el backend corriendo), ubícate en la raíz del proyecto y ejecuta:

```bash
# Ingresar a la carpeta del frontend
cd frontend/

# Instalar las dependencias necesarias
npm install

# Levantar el servidor de desarrollo local (Vite)
npm run dev
```
La aplicación estará disponible en `http://localhost:5173`.

---

## 👥 Credenciales de Prueba (Seeded Users)
La base de datos se poblará automáticamente con los siguientes usuarios de prueba para evaluar los diferentes roles del sistema. La contraseña para todos es **`admin123`**:

| Rol | Email | Contraseña | Descripción / Permisos |
|---|---|---|---|
| **Administrador** | `admin@foodstore.com` | `admin123` | Control total del sistema, configuración, reportes e ingredientes. |
| **Stock Manager** | `stock@foodstore.com` | `admin123` | Gestión del inventario e insumos. |
| **Pedidos Manager** | `pedidos@foodstore.com` | `admin123` | Control y cambio de estados de los pedidos de clientes. |
| **Cliente** | `client@foodstore.com` | `admin123` | Perfil de usuario cliente para realizar compras y ver historial. |

---

## 💳 Pruebas de Pago (Mercado Pago)
En el archivo `backend/.env` se encuentran documentadas tarjetas de prueba (Visa, Mastercard, American Express) de Mercado Pago Sandbox, así como usuarios de prueba (comprador y vendedor) para realizar transacciones de test completas en el flujo de checkout.

