from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime, timezone

if TYPE_CHECKING:
    from app.Modules.Pedidos.Model.pedido import Pedido
    from app.Modules.Pedidos.Model.historialEstadoPedido import HistorialEstadoPedido

class EstadoPedido(SQLModel, table=True):
    __tablename__ = "estadopedido"

    codigo: str = Field(primary_key=True, max_length=20)
    descripcion: str = Field(max_length=80, nullable=False)
    orden: int = Field(nullable=False)
    es_terminal: bool = Field(nullable=False)

    pedidos: List["Pedido"] = Relationship(back_populates="estado")
    # Para HistorialEstadoPedido
    historial_desde: List["HistorialEstadoPedido"] = Relationship(back_populates="rel_estado_desde", sa_relationship_kwargs={"foreign_keys": "HistorialEstadoPedido.estado_desde"})
    historial_hacia: List["HistorialEstadoPedido"] = Relationship(back_populates="rel_estado_hacia", sa_relationship_kwargs={"foreign_keys": "HistorialEstadoPedido.estado_hacia"})
