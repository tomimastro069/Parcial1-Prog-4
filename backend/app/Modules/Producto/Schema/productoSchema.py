from sqlmodel import SQLModel
from typing import Optional, List


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


# ── Input para asociar ingredientes al crear/actualizar un producto ────────────

class ProductoIngredienteInput(SQLModel):
    ingrediente_id: int
    cantidad: float


# ── Schemas principales ────────────────────────────────────────────────────────

class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    categoria_ids: List[int] = []
    ingredientes: List[ProductoIngredienteInput] = []


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    categorias: List[CategoriaEnProducto] = []
    ingredientes: List[IngredienteEnProducto] = []


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    descripcion: Optional[str] = None
    categoria_ids: Optional[List[int]] = None
    ingredientes: Optional[List[ProductoIngredienteInput]] = None