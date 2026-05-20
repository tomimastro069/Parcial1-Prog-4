from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING
from datetime import datetime, timezone

if TYPE_CHECKING:
    from app.Modules.Pedidos.Model.pedido import Pedido
    from app.Modules.Pedidos.Model.estadoPedido import EstadoPedido

class HistorialEstadoPedido(SQLModel, table=True):
    __tablename__ = "historialestadopedido"

    id: Optional[int] = Field(default=None, primary_key=True)
    pedido_id: int = Field(foreign_key="pedido.id", nullable=False)
    estado_desde: Optional[str] = Field(default=None, foreign_key="estadopedido.codigo", max_length=20)
    estado_hacia: str = Field(foreign_key="estadopedido.codigo", nullable=False, max_length=20)
    usuario_id: Optional[int] = Field(default=None, foreign_key="usuario.id")
    
    motivo: Optional[str] = Field(default=None)
    
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc), nullable=False)

    pedido: Optional["Pedido"] = Relationship(back_populates="historial")
    rel_estado_desde: Optional["EstadoPedido"] = Relationship(back_populates="historial_desde", sa_relationship_kwargs={"foreign_keys": "[HistorialEstadoPedido.estado_desde]"})
    rel_estado_hacia: Optional["EstadoPedido"] = Relationship(back_populates="historial_hacia", sa_relationship_kwargs={"foreign_keys": "[HistorialEstadoPedido.estado_hacia]"})
