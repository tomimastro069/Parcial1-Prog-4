# 🎙️ Guion Oficial del Video (Backend)

*Este documento contiene los textos exactos que cada integrante va a leer, sincronizados con los tiempos de la grabación de pantalla.*

---

## 📌 Parte 1: Arquitectura y Estructura
**⏱️ Marca de tiempo:** `[00:00 - 00:55]` *(Duración: 55 seg)*
**💻 En pantalla:** Árbol de directorios, mostrando el orden de las carpetas, la estructura modular y la arquitectura del proyecto.
**🗣️ Locutor:** `Tomas`

> **Guion:**
> Buenas tardes. Presentamos el proyecto integrador del primer parcial. El sistema backend está desarrollado utilizando FastAPI y estructurado mediante una Arquitectura Modular. Como se observa en el árbol de directorios, el código se divide en Core y Modules. El directorio Core contiene la configuración fundamental de acceso a datos, incluyendo el patrón Unit of Work y repositorios. El directorio Modules agrupa las entidades del dominio: Categoría, Ingrediente y Producto. Dentro de cada módulo, se respeta la separación de responsabilidades, dividiendo la implementación en Modelos de base de datos, Esquemas para transferencia de datos, Servicios para la lógica de negocio y Routers para la definición de endpoints.

---

## 📌 Parte 2: Configuración y Conexión (database.py)
**⏱️ Marca de tiempo:** `[00:55 - 01:10]` *(Duración: 15 seg)*
**💻 En pantalla:** Archivo `database.py`.
**🗣️ Locutor:** `Tomas`

> **Guion:**
> El archivo database.py gestiona la conexión con PostgreSQL. Define el motor de base de datos y la función generadora de sesiones, la cual provee el contexto de ejecución principal para las transacciones.

---

## 📌 Parte 3: Unit of Work
**⏱️ Marca de tiempo:** `[01:10 - 01:40]` *(Duración: 30 seg)*
**💻 En pantalla:** Archivo del Unit of Work (`uow`).
**🗣️ Locutor:** `Tomas`

> **Guion:**
> Para garantizar la atomicidad de las operaciones, implementamos el patrón Unit of Work. Este contexto administrador maneja la sesión de la base de datos y provee acceso centralizado a los repositorios. Asegura que múltiples operaciones en base de datos se confirmen en conjunto, o se reviertan mediante un rollback en caso de error, manteniendo siempre la consistencia de la información.

---

## 📌 Parte 4: Repository Pattern
**⏱️ Marca de tiempo:** `[01:40 - 01:55]` *(Duración: 15 seg)*
**💻 En pantalla:** Archivo del Repositorio (`repository.py`).
**🗣️ Locutor:** `Tomas`

> **Guion:**
> El acceso a datos se abstrae mediante repositorios genéricos. Estos aíslan las consultas directas a SQLModel de la capa de servicios, facilitando operaciones CRUD estandarizadas y mejorando la mantenibilidad del código.

---

## 📌 Parte 5: Modelo Producto
**⏱️ Marca de tiempo:** `[01:55 - 02:25]` *(Duración: 30 seg)*
**💻 En pantalla:** Archivo `producto.py`.
**🗣️ Locutor:** `Cristian`

> **Guion:**
> El archivo producto.py define el modelo de base de datos utilizando SQLModel. Las propiedades de la clase definen las columnas de la tabla. Aquí se establecen restricciones a nivel de base de datos y se declaran las relaciones utilizando la función Relationship, especificando back_populates para el mapeo bidireccional y la política de eliminación en cascada.

---

## 📌 Parte 6: Relaciones N:N
**⏱️ Marca de tiempo:** `[02:25 - 02:55]` *(Duración: 30 seg)*
**💻 En pantalla:** Archivos `productoCategoria.py` y `productoIngrediente.py`.
**🗣️ Locutor:** `Cristian`

> **Guion:**
> Las relaciones de muchos a muchos entre productos, categorías e ingredientes se implementan mediante tablas intermedias. Los modelos productoCategoria.py y productoIngrediente.py actúan como entidades de unión, definiendo claves foráneas que referencian los identificadores primarios de las tablas correspondientes, asegurando así la integridad referencial.

---

## 📌 Parte 7: Capa de Servicios
**⏱️ Marca de tiempo:** `[02:55 - 03:55]` *(Duración: 60 seg)*
**💻 En pantalla:** Archivo `producto_service.py`.
**🗣️ Locutor:** `Cristian`

> **Guion:**
> La lógica de negocio reside en los servicios. Los endpoints delegan la responsabilidad aquí. El servicio recibe el Unit of Work, asegurando transaccionalidad. En la creación de un producto, el servicio valida la existencia previa de la categoría y los ingredientes especificados. Si los identificadores provistos son válidos, se instancian las relaciones intermedias, asociando el nuevo producto con sus componentes y su categoría. Todas las validaciones y escrituras ocurren dentro de una misma transacción. Cualquier inconsistencia en los datos lanza una excepción, previniendo estados inválidos en la persistencia.

---

## 📌 Parte 8: Router y Validaciones
**⏱️ Marca de tiempo:** `[03:55 - 04:40]` *(Duración: 45 seg)*
**💻 En pantalla:** Archivo router de Producto.
**🗣️ Locutor:** `Juan`

> **Guion:**
> El archivo router expone los endpoints de la API. Utiliza dependencias inyectadas para acceder al Unit of Work y a la capa de servicios. Define explícitamente el modelo de respuesta mediante el parámetro response_model. Esto asegura que la serialización de salida retorne únicamente los campos autorizados, evitando exponer información interna o estructuras de base de datos. Además, implementa el manejo de excepciones HTTP para devolver códigos de estado precisos según el resultado de la operación.

---

## 📌 Parte 9: Entorno Docker
**⏱️ Marca de tiempo:** `[04:40 - 05:10]` *(Duración: 30 seg)*
**💻 En pantalla:** Terminal levantando el entorno Docker.
**🗣️ Locutor:** `Juan`

> **Guion:**
> El despliegue local se gestiona mediante contenedores. Ejecutamos Docker Compose para instanciar tanto el servidor de PostgreSQL como la aplicación FastAPI en un entorno aislado. Esto estandariza la infraestructura de desarrollo y garantiza que las dependencias, como la versión del motor de base de datos, sean idénticas y replicables.

---

## 📌 Parte 10: Producto Schema (DTOs y Validaciones)
**⏱️ Marca de tiempo:** `[05:10 - 05:55]` *(Duración: 45 seg)*
**💻 En pantalla:** Archivo `producto_schema.py`.
**🗣️ Locutor:** `Juan`

> **Guion:**
> El archivo producto_schema.py define los Data Transfer Objects utilizando Pydantic. Se separan estructuralmente los esquemas de creación, actualización y respuesta. Para garantizar la calidad de los datos de entrada, aplicamos validaciones estrictas. Utilizamos la función Field para establecer valores mínimos de longitud en cadenas y valores mayores a cero en los tipos numéricos. El esquema de respuesta modela exactamente la estructura jerárquica esperada por el cliente.

---

## 📌 Parte 11: Swagger - Crear Producto (POST)
**⏱️ Marca de tiempo:** `[05:55 - 06:55]` *(Duración: 60 seg)*
**💻 En pantalla:** Swagger UI. Endpoint POST.
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> Demostraremos la funcionalidad mediante Swagger UI. Ejecutamos el endpoint POST para crear un producto. Proveemos un payload JSON con datos válidos, incluyendo arreglos de identificadores para categoría e ingredientes. Ejecutamos la petición. El sistema procesa la lógica transaccional y retorna un código de estado 201 Created. El cuerpo de la respuesta demuestra cómo SQLModel y Pydantic serializan la respuesta, devolviendo el objeto producto con sus entidades relacionadas debidamente integradas.

---

## 📌 Parte 12: Swagger - Listar Productos (GET)
**⏱️ Marca de tiempo:** `[06:55 - 07:35]` *(Duración: 40 seg)*
**💻 En pantalla:** Swagger UI. Endpoint GET (todos).
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> A continuación, probamos el endpoint GET para obtener la lista de productos. La ejecución retorna una matriz de elementos con el código 200 OK. La respuesta incluye el producto recién creado, confirmando que la transacción del Unit of Work persistió correctamente la entidad principal y sus dependencias en las tablas intermedias dentro de PostgreSQL.

---

## 📌 Parte 13: Swagger - Eliminar Producto (DELETE)
**⏱️ Marca de tiempo:** `[07:35 - 07:55]` *(Duración: 20 seg)*
**💻 En pantalla:** Swagger UI. Endpoint DELETE.
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> Procedemos a eliminar la entidad. Ejecutamos el endpoint DELETE proporcionando el identificador del producto en los parámetros de ruta. El sistema retorna un código 204 No Content, indicando que la operación de eliminación en cascada fue exitosa.

---

## 📌 Parte 14: Swagger - Listar Nuevamente (GET)
**⏱️ Marca de tiempo:** `[07:55 - 08:05]` *(Duración: 10 seg)*
**💻 En pantalla:** Swagger UI. Endpoint GET (todos).
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> Ejecutamos nuevamente el listado completo de productos. Observamos que el conjunto de datos retornado por la API ya no incluye el registro que acaba de ser eliminado.

---

## 📌 Parte 15: Swagger - Búsqueda Inexistente (404)
**⏱️ Marca de tiempo:** `[08:05 - 08:45]` *(Duración: 40 seg)*
**💻 En pantalla:** Swagger UI. Endpoint GET por ID.
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> Validamos el manejo de recursos inexistentes. Consultamos directamente el endpoint GET por identificador utilizando el ID del producto eliminado. La API responde con el código de error 404 Not Found, demostrando que la capa de servicios intercepta la falta de registros devolviendo la excepción HTTP correspondiente.

---

## 📌 Parte 16: Swagger - Validación Unprocessable Entity (422)
**⏱️ Marca de tiempo:** `[08:45 - 09:30]` *(Duración: 45 seg)*
**💻 En pantalla:** Swagger UI. Endpoint POST con error.
**🗣️ Locutor:** `Lautaro`

> **Guion:**
> Finalmente, comprobamos las restricciones de esquema. Intentamos crear un nuevo producto enviando un valor negativo en el campo precio, violando la regla de validación en el esquema de Pydantic. Al ejecutar la petición, FastAPI intercepta la falla de validación antes de alcanzar la capa de servicios, retornando un código 422 Unprocessable Entity con la especificación exacta del error, protegiendo así la integridad de la base de datos.
