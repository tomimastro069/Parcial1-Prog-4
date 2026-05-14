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
    precio: Annotated[float, Field(gt=0)]
    descripcion: Annotated[Optional[str], Field(max_length=500)] = None
    categorias: List[int] = []
    ingredientes: List[ProductoIngredienteInput] = []


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    imagen_url: Optional[str] = None
    is_active: bool = True
    categorias: List[CategoriaEnProducto] = []
    ingredientes: List[IngredienteEnProducto] = []


class ProductoUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    precio: Annotated[Optional[float], Field(gt=0)] = None
    descripcion: Annotated[Optional[str], Field(max_length=500)] = None
    categorias: Optional[List[int]] = None
    ingredientes: Optional[List[ProductoIngredienteInput]] = None


from app.Core.Schema.pagination import PaginatedResponse


class PaginatedProductoResponse(PaginatedResponse[ProductoRead]):
    pass
