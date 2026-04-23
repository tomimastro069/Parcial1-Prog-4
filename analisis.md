# 🔍 Análisis Backend — Parcial 1 Programación 4

## Resumen del Parcial

El parcial pide un proyecto integrador **FastAPI + SQLModel + PostgreSQL** (backend) y **React + TypeScript + TanStack Query + Tailwind** (frontend). Se entrega como video de 15 min + repo en GitHub.

### Módulos requeridos por el PDF

1. **Categoría** — CRUD completo
2. **Producto** — CRUD completo
3. **Ingrediente** — CRUD completo
4. **ProductoCategoria** — Tabla intermedia N:N (Producto ↔ Categoría)
5. **ProductoIngrediente** — Tabla intermedia N:N (Producto ↔ Ingrediente)

### Relaciones requeridas

- **1:N** → Categoría ↔ Producto (un producto pertenece a UNA categoría)
- **N:N** → Producto ↔ Ingrediente (a través de `ProductoIngrediente`)

> [!IMPORTANT]
> El PDF menciona "ProductoCategoria" como módulo pero TAMBIÉN dice relación 1:N para Categoría ↔ Producto. Esto es **contradictorio**: si es 1:N no necesitás tabla intermedia. Tu código actual tiene AMBAS cosas (FK directa `categoria_id` en Producto Y tabla `ProductoCategoria`). Hay que decidir cuál usar. Ver sección de problemas.

---

## Estado Actual del Backend

### Estructura de carpetas

```
backend/
├── main.py                          ✅ Existe
├── requirements.txt                 ✅ Existe
├── docker-compose.yml               ✅ Existe
├── dockerfile                       ✅ Existe
├── .env                             ✅ Existe
├── app/
│   ├── Core/
│   │   ├── config.py                ⚠️ VACÍO
│   │   ├── database.py              ✅ Funcional
│   │   ├── repository.py            ⚠️ Existe pero NO SE USA
│   │   └── unit_of_work.py          ⚠️ Parcial (ver problemas)
│   └── Modules/
│       ├── Categoria/               ✅ Más completo
│       ├── Ingrediente/             ✅ Funcional básico
│       └── Producto/                ⚠️ Parcial (ver problemas)
```

---

## Análisis por Módulo

### 1. Categoría ✅ (el más completo)

| Capa    | Archivo                      | Estado | Observaciones                                            |
| ------- | ---------------------------- | ------ | -------------------------------------------------------- |
| Model   | `categoria.py`               | ✅     | `Relationship` 1:N con Producto, validaciones `Field`    |
| Schema  | `categoriaSchema.py`         | ⚠️     | Funcional pero sin validaciones `Annotated`              |
| Schema  | `Schemas/categoriaSchema.py` | ❌     | **DUPLICADO** — carpeta `Schemas/` y `Schema/` coexisten |
| Service | `categoriaService.py`        | ✅     | CRUD completo, chequeo de duplicados en `create`         |
| Router  | `categoriaRouter.py`         | ✅     | Usa `Annotated`, `Query`, `response_model`, status codes |

### 2. Ingrediente ✅ (funcional básico)

| Capa    | Archivo                 | Estado | Observaciones                                              |
| ------- | ----------------------- | ------ | ---------------------------------------------------------- |
| Model   | `ingrediente.py`        | ✅     | `Relationship` N:N con ProductoIngrediente                 |
| Schema  | `ingredienteSchema.py`  | ⚠️     | Sin validaciones en schemas (sin `Annotated`, sin `Field`) |
| Service | `ingredienteService.py` | ✅     | CRUD completo, usa UoW                                     |
| Router  | `ingredienteRouter.py`  | ✅     | Usa `Annotated`, `Query`, `response_model`                 |

### 3. Producto ⚠️ (parcialmente implementado)

| Capa    | Archivo                  | Estado | Observaciones                                                                                           |
| ------- | ------------------------ | ------ | ------------------------------------------------------------------------------------------------------- |
| Model   | `producto.py`            | ⚠️     | Tiene FK 1:N a Categoría Y relación N:N a Ingrediente, pero **no tiene relación con ProductoCategoria** |
| Model   | `productoCategoria.py`   | ⚠️     | Tabla existe pero **NO está conectada por Relationship a ningún modelo**                                |
| Model   | `productoIngrediente.py` | ✅     | Tabla intermedia con `Relationship` bidireccional y campo `cantidad`                                    |
| Schema  | `productoSchema.py`      | ⚠️     | Incluye `categoria` anidada en Read, pero **NO incluye ingredientes**                                   |
| Service | `productoService.py`     | ⚠️     | CRUD básico, **NO maneja relaciones N:N** (no crea ProductoIngrediente)                                 |
| Router  | `productoRouter.py`      | ✅     | Estructura correcta, usa `Annotated`, `Query`                                                           |

---

## 🚨 Problemas Detectados

### P1: Contradicción en la relación Categoría ↔ Producto

```
Producto tiene:
  - categoria_id (FK directa) → Relación 1:N ✅
  - ProductoCategoria (tabla intermedia) → Relación N:N ❓
```

El PDF dice **1:N para Categoría ↔ Producto** y **N:N para Producto ↔ Ingrediente**. Pero también lista "ProductoCategoria" como módulo.

**Decisión a tomar:** ¿Un producto puede tener MUCHAS categorías (N:N) o UNA sola (1:N)?

- Si es 1:N → borrar `ProductoCategoria`, dejar la FK directa
- Si es N:N → borrar la FK directa, conectar `ProductoCategoria` con `Relationship`

> [!WARNING]
> Ahora mismo `ProductoCategoria` existe como modelo pero **NO tiene ningún `Relationship`** definido. Es una tabla huérfana que no se usa en ningún lado.

### P2: El `BaseRepository` genérico NO SE USA

El archivo `repository.py` tiene un `BaseRepository[T]` bien armado, pero **ningún service lo usa**. Todos los services hacen queries directas con `session.exec(select(...))`. El UoW instancia repositorios pero los services no los llaman.

### P3: El UoW se usa como "commit helper"

```python
# En cada service:
uow = UnitOfWork(session)  # crea UoW solo para hacer commit
session.add(cat)            # agrega directo a la session, no al repo
uow.commit()                # commit a través del UoW
```

No es incorrecto para el parcial, pero el `BaseRepository` queda sin uso. Es código muerto.

### P4: Carpeta duplicada en Categoría

Hay dos carpetas: `Schema/` y `Schemas/` con el mismo contenido exacto. Una sobra.

### P5: `config.py` vacío

Existe pero no tiene contenido. Si no lo vas a usar, sacalo.

### P6: Schemas sin validaciones

Los schemas (`CategoriaCreate`, `IngredienteCreate`, `ProductoCreate`) no tienen validaciones con `Annotated` o `Field`. Las validaciones están SOLO en los modelos de tabla. El PDF pide explícitamente:

> "Uso de `Annotated`, `Query` y `Path` para reglas de negocio (ej. longitudes, rangos)"

Los routers usan `Annotated` + `Query` para paginación ✅, pero los schemas no tienen validaciones propias.

### P7: `response_model` no filtra datos sensibles

El PDF dice: _"Implementación de response_model para no filtrar datos sensibles o innecesarios"_. Los `Read` schemas actuales son simples reflections del modelo. Funcionan, pero para el video conviene mostrar que entendés POR QUÉ existen.

---

## ✅ Lo que YA funciona y cumple la rúbrica

| Criterio del PDF                                                          | Estado             |
| ------------------------------------------------------------------------- | ------------------ |
| Entorno: `.venv`, `requirements.txt`, FastAPI en dev mode                 | ✅                 |
| Modelado con SQLModel                                                     | ✅                 |
| Relación 1:N (Categoría → Producto) con `Relationship` y `back_populates` | ✅                 |
| Relación N:N (Producto ↔ Ingrediente) con tabla intermedia                | ✅ (modelo existe) |
| Uso de `Annotated` y `Query` en routers                                   | ✅                 |
| `HTTPException` con códigos de estado (404, 201, 204)                     | ✅                 |
| `response_model` en endpoints                                             | ✅                 |
| Persistencia PostgreSQL vía Docker                                        | ✅                 |
| Código organizado por módulos (routers, schemas, services, models)        | ✅                 |
| CRUD Categoría completo                                                   | ✅                 |
| CRUD Ingrediente completo                                                 | ✅                 |
| CRUD Producto básico (sin relaciones N:N)                                 | ⚠️ Parcial         |

---

## 📋 Lo que FALTA implementar

### Prioridad ALTA (sin esto no aprobás)

1. **[ ] Definir la relación Producto ↔ Categoría**
   - Decidir si es 1:N (FK directa, ya está) o N:N (usar ProductoCategoria)
   - Si es N:N: agregar `Relationship` a ProductoCategoria, Producto, y Categoría
   - Si es 1:N: eliminar el modelo ProductoCategoria, sacarlo de `main.py`

2. **[ ] Completar CRUD de Producto con relaciones N:N (Ingredientes)**
   - `ProductoCreate` debe aceptar una lista de ingredientes (ej: `ingredientes: list[ProductoIngredienteInput]`)
   - `ProductoRead` debe devolver los ingredientes relacionados (anidados)
   - `productoService.create()` debe crear las filas en `ProductoIngrediente`
   - `productoService.update()` debe actualizar las relaciones N:N
   - `productoService.delete()` debe manejar el cascade o borrar manualmente

3. **[ ] Agregar `ProductoRepository` al UoW**
   - Está comentado: `# self.productos = ProductoRepository(session, Producto)`
   - Descomentar y crear la clase

### Prioridad MEDIA (mejora la nota significativamente)

4. **[ ] Agregar validaciones `Annotated`/`Field` en los Schemas**
   - Ej: `nombre: Annotated[str, Field(min_length=2, max_length=100)]` en `CategoriaCreate`
   - El PDF evalúa esto explícitamente en la rúbrica

5. **[ ] Agregar `Path` para validar IDs en routers**
   - Ej: `categoria_id: Annotated[int, Path(gt=0, description="ID de la categoría")]`
   - El checklist del PDF lo pide

6. **[ ] Limpiar código muerto**
   - Borrar carpeta `Schemas/` duplicada en Categoría
   - Borrar `config.py` si queda vacío
   - Decidir si usar `BaseRepository` o sacarlo

7. **[ ] Crear endpoint de detalle que muestre relaciones**
   - El PDF dice: _"Este producto pertenece a la categoría X y tiene los ingredientes A y B"_
   - El `GET /producto/{id}` debería devolver categoría e ingredientes anidados

### Prioridad BAJA (nice to have para el 10)

8. **[ ] CORS middleware**
   - Para que el frontend pueda consumir la API, necesitás `CORSMiddleware`
   - Sin esto, el frontend no va a poder conectarse

9. **[ ] Validaciones de negocio más robustas**
   - Verificar que `categoria_id` exista antes de asignarla a un producto
   - Verificar que los `ingrediente_id` existan antes de crear relaciones N:N

10. **[ ] README.md configurado**
    - El PDF lo pide explícitamente con descripción del proyecto y link al video

11. **[ ] CHECKLIST.md en la raíz del repo**
    - El PDF provee un template para copiar y completar

12. **[ ] Migrar `@app.on_event("startup")` a `lifespan`**
    - `on_event` está deprecado en FastAPI moderno, pero para el parcial no es crítico

---

## 📊 Resumen Visual

```
                    ┌──────────────┐
                    │  Categoría   │
                    │  ✅ COMPLETO │
                    └──────┬───────┘
                           │ 1:N (FK directa)
                           │ ó N:N (tabla intermedia)?
                           ▼
┌──────────────┐    ┌──────────────┐    ┌──────────────────────┐
│ Ingrediente  │◄───│   Producto   │───►│  ProductoCategoria   │
│  ✅ COMPLETO │ N:N│  ⚠️ PARCIAL │    │  ❌ HUÉRFANO         │
└──────────────┘    └──────────────┘    └──────────────────────┘
        ▲                  │
        │    ┌─────────────┘
        │    ▼
   ┌────────────────────┐
   │ ProductoIngrediente │
   │   ✅ MODELO OK      │
   │   ❌ SIN LÓGICA     │
   └─────────────────────┘
```

**Leyenda:**

- ✅ = Listo para la rúbrica
- ⚠️ = Existe pero incompleto
- ❌ = Falta implementar o tiene problemas
