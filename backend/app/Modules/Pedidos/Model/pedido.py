from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone
from decimal import Decimal

if TYPE_CHECKING:
    from app.Modules.Pedidos.Model.estadoPedido import EstadoPedido
    from app.Modules.Pagos.Model.formaPago import FormaPago
    from app.Modules.Pedidos.Model.detallePedido import DetallePedido
    from app.Modules.Pedidos.Model.historialEstadoPedido import HistorialEstadoPedido

class Pedido(SQLModel, table=True):
    __tablename__ = "pedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    usuario_id: int = Field(foreign_key="usuario.id", nullable=False)
    direccion_id: Optional[int] = Field(default=None, foreign_key="direccionentrega.id")
    estado_codigo: str = Field(foreign_key="estadopedido.codigo", nullable=False, max_length=20)
    forma_pago_codigo: str = Field(foreign_key="formapago.codigo", nullable=False, max_length=20)
    
    subtotal: Decimal = Field(nullable=False, max_digits=10, decimal_places=2)
    descuento: Decimal = Field(default=Decimal("0.00"), nullable=False, max_digits=10, decimal_places=2)
    costo_envio: Decimal = Field(default=Decimal("50.00"), nullable=False, max_digits=10, decimal_places=2)
    total: Decimal = Field(nullable=False, max_digits=10, decimal_places=2)
    
    notas: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)
    deleted_at: Optional[datetime] = Field(default=None)

    estado: Optional["EstadoPedido"] = Relationship(back_populates="pedidos")
    forma_pago: Optional["FormaPago"] = Relationship(back_populates="pedidos")
    detalles: List["DetallePedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    historial: List["HistorialEstadoPedido"] = Relationship(
        back_populates="pedido",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )