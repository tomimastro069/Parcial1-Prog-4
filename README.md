# Título del Proyecto

## 👥 Integrantes
- Tomas Mastropietro
- Cristian Krahulik
- Juan Segura
- Lautaro Castillo

## 🎥 Presentaciones y Demos
- **Video parcial 1:** [Ver en YouTube](https://youtu.be/X3pORulwOEM)
- **Video parcial 2:** [Ver en YouTube](https://youtu.be/BY-iPu9SmIM)
- **Video Final:** [Ver en YouTube](https://www.youtube.com/watch?v=zrqhsjaqY-o)

---

## 🚀 Guía de Ejecución

A continuación se detallan los pasos para ejecutar y evaluar el proyecto. El código está dividido en dos carpetas principales ubicadas en la raíz del repositorio: `backend` y `frontend`. 

Para ver todo el sistema funcionando, es necesario levantar ambos entornos por separado.

### 1. Inicializar el Backend
El entorno del backend está preparado y orquestado con Docker. Para levantarlo, abre una terminal en la raíz del proyecto y ejecuta los siguientes comandos:

```bash
# Ingresar a la carpeta del backend
cd backend/

# Construir y levantar los contenedores
docker compose up --build
```

### 2. Inicializar el Frontend
El frontend requiere la instalación previa de las dependencias de Node. En una **nueva terminal** (manteniendo el backend corriendo), ubícate nuevamente en la raíz del proyecto y ejecuta:

```bash
# Ingresar a la carpeta del frontend
cd frontend/

# Instalar las dependencias necesarias
npm install
```

Una vez finalizada la instalación, puedes levantar el servidor de desarrollo local:

```bash
npm run dev
```

*(Nota: Si se desea compilar la aplicación para producción, se puede utilizar el comando `npm run build` en su lugar).*
