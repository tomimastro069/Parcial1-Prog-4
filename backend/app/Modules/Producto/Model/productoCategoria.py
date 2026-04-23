from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Producto.Model.producto import Producto
    from app.Modules.Categoria.Model.categoria import Categoria


# ── Tabla intermedia N:N: Producto ↔ Categoria ────────────────────────────────
class ProductoCategoria(SQLModel, table=True):
    producto_id: Optional[int] = Field(
        default=None, foreign_key="producto.id", primary_key=True
    )
    categoria_id: Optional[int] = Field(
        default=None, foreign_key="categoria.id", primary_key=True
    )

    # Relationships bidireccionales
    producto: Optional["Producto"] = Relationship(back_populates="producto_categorias")
    categoria: Optional["Categoria"] = Relationship(back_populates="producto_categorias")