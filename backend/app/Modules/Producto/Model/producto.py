from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
    from app.Modules.Producto.Model.productoCategoria import ProductoCategoria


class Producto(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=150)
    precio: float = Field(gt=0, description="Precio debe ser mayor a 0")
    descripcion: Optional[str] = Field(default=None, max_length=500)

    # Relación N:N con Ingrediente a través de ProductoIngrediente
    producto_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="producto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    # Relación N:N con Categoria a través de ProductoCategoria
    producto_categorias: List["ProductoCategoria"] = Relationship(
        back_populates="producto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )