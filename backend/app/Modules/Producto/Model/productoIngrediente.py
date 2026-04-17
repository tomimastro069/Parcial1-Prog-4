from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List

# ── Tabla intermedia N:N: Producto ↔ Ingrediente ──────────────────────────────
class ProductoIngrediente(SQLModel, table=True):
    producto_id: Optional[int] = Field(
        default=None, foreign_key="producto.id", primary_key=True
    )
    ingrediente_id: Optional[int] = Field(
        default=None, foreign_key="ingrediente.id", primary_key=True
    )
    cantidad: float = Field(gt=0, description="Cantidad del ingrediente en el producto")

    producto: Optional["Producto"] = Relationship(back_populates="producto_ingredientes")
    ingrediente: Optional["Ingrediente"] = Relationship(back_populates="producto_ingredientes")
