from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Producto.Model.productoCategoria import ProductoCategoria


class Categoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100, sa_column_kwargs={"unique": True})
    descripcion: Optional[str] = Field(default=None, max_length=255)
    
    # Jerarquía
    parent_id: Optional[int] = Field(default=None, foreign_key="categoria.id")
    
    is_active: bool = Field(default=True)  # borrado lógico

    # Relación N:N con Productos
    producto_categorias: List["ProductoCategoria"] = Relationship(
        back_populates="categoria"
    )

    # Relación jerárquica (autorreferencia)
    parent: Optional["Categoria"] = Relationship(
        back_populates="children",
        sa_relationship_kwargs={"remote_side": "Categoria.id"}
    )
    children: List["Categoria"] = Relationship(back_populates="parent")