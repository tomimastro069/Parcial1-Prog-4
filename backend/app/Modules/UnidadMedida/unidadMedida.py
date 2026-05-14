from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List
from datetime import datetime


class UnidadMedida(SQLModel, table=True):
    __tablename__ = "unidadmedida"

    id: Optional[int] = Field(default=None, primary_key=True)

    nombre: str = Field(
        min_length=2,
        max_length=50,
        unique=True,
        nullable=False
    )

    simbolo: str = Field(
        min_length=1,
        max_length=10,
        unique=True,
        nullable=False
    )

    tipo: str = Field(
        min_length=2,
        max_length=20,
        nullable=False
    )

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    # -------------------
    # RELACIONES 1:N
    # -------------------

    productos: List["Producto"] = Relationship(
        back_populates="unidad_medida"
    )

    ingredientes: List["Ingrediente"] = Relationship(
        back_populates="unidad_medida"
    )