from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Categoria.Model.categoria import Categoria
    from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=150)
    precio: float = Field(gt=0, description="Precio debe ser mayor a 0")
    descripcion: Optional[str] = Field(default=None, max_length=500)

    # FK directa para relación 1:N con Categoria
    categoria_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    categoria: Optional["Categoria"] = Relationship(back_populates="productos")

    # Relación N:N con Ingrediente a través de ProductoIngrediente
    producto_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="producto"
    )