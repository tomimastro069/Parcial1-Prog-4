from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List


class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100)
    unidad: str = Field(min_length=1, max_length=50)

    # Lado N:N → un Ingrediente aparece en muchos Productos
    producto_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="ingrediente"
    )