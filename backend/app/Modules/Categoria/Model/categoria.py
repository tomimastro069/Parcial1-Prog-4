from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100, sa_column_kwargs={"unique": True})
    descripcion: Optional[str] = Field(default=None, max_length=255)

    # Relación 1:N → una Categoría tiene muchos Productos
    productos: List["Producto"] = Relationship(back_populates="categoria", cascade="all, delete")