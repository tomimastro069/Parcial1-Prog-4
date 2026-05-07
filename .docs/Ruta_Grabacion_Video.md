# 🎬 Hoja de Ruta de Grabación Visual (Backend)

**Objetivo:** Grabar la pantalla de forma fluida, pausada y clara para que luego 4 personas puedan montar sus audios por encima. El orden respeta estrictamente la rúbrica solicitada por el profesor.
**Duración Total de Grabación:** ~12 a 13 minutos (dejar silencios/pausas visuales es clave para que los audios encajen).

---

## 📍 Sección 1: Configuración y Conexión (Aprox 2:00 min)
*Esta sección establece la base. La Persona 1 habla de cómo el sistema se conecta a PostgreSQL.*

- **0:00 - 0:45 | Pantalla:** Imagen a pantalla completa del **Diagrama ER / Mapa Conceptual**.
  - **Acción:** Mover el cursor lentamente señalando la arquitectura general.
- **0:45 - 2:00 | Pantalla:** VS Code - Archivo de conexión a BD (ej. `database.py` o `unit_of_work.py`).
  - **Acción:** Expandir el árbol de directorios a la izquierda para mostrar la estructura modular.
  - **Acción:** Abrir el archivo donde se configura el `engine` de SQLAlchemy/SQLModel y la creación de la sesión (`SessionLocal`).
  - **Acción:** Sombrear con el mouse la cadena de conexión o la función que levanta la base de datos para destacar cómo se conectan a PostgreSQL.

---

## 📍 Sección 2: Modelos y Relaciones (Aprox 2:30 min)
*Acá entra la Persona 2 a hablar de SQLModel y cómo mapearon las tablas.*

- **2:00 - 3:00 | Pantalla:** VS Code - Archivo `producto.py` (Modelo).
  - **Acción:** Abrir el archivo. Hacer scroll lento.
  - **Acción:** Seleccionar (sombrear con el mouse) las líneas de la relación 1:N (Categoría) donde dice `Relationship` y `back_populates`. Mantener la selección unos 15 segundos.
- **3:00 - 4:30 | Pantalla:** VS Code - Archivo tabla intermedia (ej. `productoIngrediente.py`).
  - **Acción:** Abrir este archivo. Sombrear las `ForeignKeys` que conectan Producto con Ingrediente. Dar tiempo para que el audio explique el N:N.

---

## 📍 Sección 3: Capa de Servicios (Aprox 2:00 min)
*Acá entra la Persona 3 para explicar dónde vive la lógica de negocio y cómo se manipulan los datos antes de persistir.*

- **4:30 - 6:30 | Pantalla:** VS Code - Archivo de Service (ej. `producto_service.py` o su equivalente en `Core`).
  - **Acción:** Abrir el archivo del servicio.
  - **Acción:** Hacer scroll hasta una función importante (ej. `crear_producto` o la asignación de ingredientes).
  - **Acción:** Sombrear el bloque donde se hace el `session.add()` y `session.commit()` para demostrar que la lógica transaccional está aislada acá.

---

## 📍 Sección 4: Routers, Validaciones y DTOs (Aprox 2:30 min)
*Acá entra la Persona 4 (o la 1 de nuevo). Foco total en que NO devuelven información innecesaria.*

- **6:30 - 7:30 | Pantalla:** VS Code - Archivo de Schema/DTO (ej. `producto_schema.py`).
  - **Acción:** Abrir el schema correspondiente. 
  - **Acción:** Sombrear donde se usa `Field(gt=0)` o validaciones con `Annotated`. 
  - **Acción:** Sombrear el Schema de "Salida" (Response DTO) para destacar que se omiten datos sensibles (cumpliendo la regla del profe).
- **7:30 - 9:00 | Pantalla:** VS Code - Archivo de Router de Producto.
  - **Acción:** Cambiar al router. 
  - **Acción:** Sombrear explícitamente en el decorador la parte de `response_model=ProductoResponseDTO`. 
  - **Acción:** Sombrear el bloque `try/except` o el `raise HTTPException`.

---

## 📍 Sección 5: Persistencia - Demo en Vivo (Aprox 4:00 min)
*La demostración final. Todo se graba en el Navegador web.*

- **9:00 - 9:30 | Pantalla:** Navegador en `http://localhost:8000/docs` (Swagger).
  - **Acción:** Hacer un poco de scroll para mostrar los endpoints.
- **9:30 - 10:30 | Pantalla:** Swagger - POST Categoría y POST Ingrediente.
  - **Acción:** Abrir el endpoint, poner datos, click en "Execute". Sombrear el código **201**.
- **10:30 - 11:30 | Pantalla:** Swagger - POST Producto (Relaciones y DTOs en acción).
  - **Acción:** Crear un producto asociándole categoría e ingredientes. "Execute". 
  - **Acción:** Sombrear el **cuerpo de respuesta**, demostrando que devuelve el formato limpio del DTO y trae los datos anidados.
- **11:30 - 13:00 | Pantalla:** Swagger - Validaciones y GET Final.
  - **Acción:** Forzar un error (precio negativo). "Execute". Sombrear el error **422 Unprocessable Entity**.
  - **Acción:** Hacer un GET general para demostrar la persistencia final de los datos en la base.

---

### ⚠️ Tips de Edición para Sincronizar Audios:
1. **Pausas de 3 a 5 segundos:** Cada vez que cambies de archivo o toques "Execute" en Swagger, dejá el mouse quieto varios segundos. Al editor de video le va a ser súper útil para "congelar" ese frame si el locutor necesita más tiempo.
2. **Movimientos suaves:** Nada de sacudir el cursor. Sombrear el texto lentamente sirve como "puntero láser" para guiar el ojo del profe.
3. **El Profe quiere DTOs:** Cuando sombrees el `response_model`, asegurate de que sea súper visible, es lo que pidió textualmente.
