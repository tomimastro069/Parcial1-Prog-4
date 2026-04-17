from sqlmodel import SQLModel
from typing import Optional
from .categoria import CategoriaRead


class ProductoCreate(SQLModel):
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None


class ProductoRead(SQLModel):
    id: int
    nombre: str
    precio: float
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None
    categoria: Optional[CategoriaRead] = None  # datos relacionados anidados


class ProductoUpdate(SQLModel):
    nombre: Optional[str] = None
    precio: Optional[float] = None
    descripcion: Optional[str] = None
    categoria_id: Optional[int] = None