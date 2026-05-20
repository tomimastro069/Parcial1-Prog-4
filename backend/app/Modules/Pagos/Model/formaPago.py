from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Pedidos.Model.pedido import Pedido

class FormaPago(SQLModel, table=True):
    __tablename__ = "formapago"

    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80, nullable=False)
    habilitado: bool = Field(default=True, nullable=False)

    pedidos: List["Pedido"] = Relationship(back_populates="forma_pago")
