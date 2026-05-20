from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from datetime import datetime, timezone
from sqlalchemy import Column, Integer
from sqlalchemy.dialects.postgresql import ARRAY

if TYPE_CHECKING:
    from app.Modules.Pedidos.Model.pedido import Pedido
    from app.Modules.Producto.Model.producto import Producto

class DetallePedido(SQLModel, table=True):
    __tablename__ = "detallepedido"

    pedido_id: int = Field(foreign_key="pedido.id", primary_key=True)
    producto_id: int = Field(foreign_key="producto.id", primary_key=True)
    
    cantidad: int = Field(nullable=False, gt=0)
    
    nombre_snapshot: str = Field(max_length=200, nullable=False)
    precio_snapshot: Decimal = Field(nullable=False, max_digits=10, decimal_places=2)
    subtotal_snap: Decimal = Field(nullable=False, max_digits=10, decimal_places=2)
    
    personalizacion: Optional[List[int]] = Field(default=None, sa_column=Column(ARRAY(Integer)))

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="detalles")
    # producto: Optional["Producto"] = Relationship()
