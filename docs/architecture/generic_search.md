# Arquitectura del Buscador Genérico (Repository Pattern)

Este documento detalla la implementación del patrón de búsqueda genérica implementado en el backend, el cual centraliza la lógica de filtrado, búsqueda parcial (LIKE/ILIKE) y paginación para cualquier entidad.

## 1. El Problema Original
Anteriormente, cada repositorio y servicio implementaba su propia lógica de búsqueda:
- Repetición de las consultas `.where(Modelo.is_active == is_active)`.
- Repetición de las consultas `.where(Modelo.nombre.ilike(...))`.
- Repetición manual del conteo total (`func.count()`) necesario para la paginación.

Esto violaba el principio **DRY (Don't Repeat Yourself)** y aumentaba la probabilidad de errores al requerir mantener código duplicado en `IngredienteRepository`, `CategoriaRepository` y `ProductoRepository`.

## 2. La Solución: `BaseRepository.search`

La lógica fue abstraída al `BaseRepository`, permitiendo que **cualquier modelo** herede automáticamente esta capacidad.

### Firma del Método
```python
def search(self, search_term: str | None = None, search_field: str = "nombre", offset: int = 0, limit: int = 100, base_statement: Any = None, **filters: Any) -> tuple[list[T], int]:
```

### Características Clave

1. **Filtros Exactos Dinámicos (`**filters`)**:
   Cualquier argumento por nombre que se pase al método (ej. `is_active=True`, `es_alergeno=False`) es atrapado por `**filters`. El método itera sobre ellos y automáticamente construye los `.where()`. Ignora los valores `None`.
   ```python
   for field, value in filters.items():
       if value is not None:
           statement = statement.where(getattr(self.model, field) == value)
   ```

2. **Búsqueda Parcial Dinámica (`search_term` + `search_field`)**:
   En vez de estar atados a buscar siempre por el campo `nombre`, el método recibe `search_field`. Automáticamente construye un `ILIKE` para búsquedas insensibles a mayúsculas/minúsculas.
   ```python
   if search_term and hasattr(self.model, search_field):
       statement = statement.where(getattr(self.model, search_field).ilike(f"%{search_term}%"))
   ```

3. **Delegación de Sub-queries (`base_statement`)**:
   Para repositorios que requieren lógica compleja (como `ProductoRepository` que necesita hacer un `JOIN` con `ProductoCategoria`), el repositorio hijo puede inyectar un `base_statement`. El `BaseRepository` tomará esa query y le aplicará el resto de los filtros y paginación por encima.

4. **Conteo Robusto para Paginación**:
   Para devolver el `total` exacto de registros luego de los filtros (vital para la UI del Frontend), el método envuelve el `statement` actual en una subquery y le aplica un `count()`.
   ```python
   total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
   ```

## 3. Ejemplos de Uso

### Uso Simple (Categorías, Ingredientes)
Desde el servicio, simplemente llamamos al repositorio. No hace falta escribir el método en `CategoriaRepository`.
```python
categorias_db, total = self.uow.categorias.search(
    search_term="salsa",     # Buscará "%salsa%" en el campo "nombre"
    offset=0,
    limit=10,
    is_active=True           # Filtro exacto atrapado por **filters
)
```

### Uso Complejo con JOINs (Productos)
El repositorio hijo intercepta la llamada, agrega su lógica relacional y le pasa la posta con `super()`:
```python
class ProductoRepository(BaseRepository[Producto]):
    def search(self, search_term: str | None = None, categoria_id: int | None = None, offset: int = 0, limit: int = 100, **filters) -> tuple[list[Producto], int]:
        statement = select(Producto)
        
        # Lógica exclusiva de Producto (JOINs)
        if categoria_id:
            statement = statement.join(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
            
        # Delegamos filtrado, paginación y conteo al BaseRepository
        return super().search(
            search_term=search_term,
            offset=offset,
            limit=limit,
            base_statement=statement,
            **filters
        )
```

## 4. Beneficios
* **Alta Cohesión**: La lógica de paginación de SQLModel solo existe en un archivo.
* **Menos Código**: Se eliminaron decenas de líneas repetidas en los Servicios y Repositorios.
* **Frontend-Ready**: Se integra de manera impecable con el componente React `<SearchBar />` y la `<Pagination />`, garantizando que todas las tablas del dashboard compartan exactamente el mismo comportamiento.
