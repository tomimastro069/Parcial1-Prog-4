from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional, List


# ── Schemas anidados para datos relacionados ───────────────────────────────────

class CategoriaEnProducto(SQLModel):
    """Datos de categoría que se muestran dentro de un producto."""
    id: int
    nombre: str


class IngredienteEnProducto(SQLModel):
    """Datos de ingrediente + cantidad que se muestran dentro de un producto."""
    id: int
    nombre: str
    unidad: str
    cantidad: float
    es_alergeno: bool = False
    descripcion: Optional[str] = None


class ProductoIngredienteInput(SQLModel):
    ingrediente_id: int
    cantidad: float


# ── Schemas principales ────────────────────────────────────────────────────────

class ProductoCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    precio_base: Annotated[Optional[float], Field(gt=0)] = None
    # Solo obligatorio si es_terminado=True. Para productos elaborados se calcula desde ingredientes.
    margen_ganancia: Annotated[Optional[float], Field(ge=0)] = None
    # Porcentaje de ganancia por producto (ej: 50 = +50%). Si es None se usa el índice global.
    descripcion: Annotated[Optional[str], Field(max_length=500)] = None
    imagen_url: Optional[str] = None
    es_terminado: bool = False
    categorias: List[int] = []
    ingredientes: List[ProductoIngredienteInput] = []


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    costo: float = 0  # costo base antes del margen (suma ingredientes o precio_base)
    margen_ganancia: Optional[float] = None  # porcentaje aplicado (None = índice global)
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    is_active: bool = True
    es_terminado: bool = False
    disponible: bool = True
    stock_calculado: int = 0  # unidades que se pueden fabricar según stock de ingredientes
    categorias: List[CategoriaEnProducto] = []
    ingredientes: List[IngredienteEnProducto] = []


class ProductoUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    precio_base: Annotated[Optional[float], Field(gt=0)] = None
    margen_ganancia: Annotated[Optional[float], Field(ge=0)] = None
    # Solo relevante para productos terminados.
    descripcion: Annotated[Optional[str], Field(max_length=500)] = None
    imagen_url: Optional[str] = None
    es_terminado: Optional[bool] = None
    categorias: Optional[List[int]] = None
    ingredientes: Optional[List[ProductoIngredienteInput]] = None


from app.Core.pagination import PaginatedResponse


class PaginatedProductoResponse(PaginatedResponse[ProductoRead]):
    pass
