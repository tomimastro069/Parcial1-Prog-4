from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional, List
from datetime import datetime

class EstadoPedidoRead(SQLModel):
    codigo: str
    descripcion: str
    orden: int
    es_terminal: bool

class DetallePedidoInput(SQLModel):
    producto_id: int
    cantidad: Annotated[int, Field(gt=0)]
    personalizacion: Optional[List[int]] = None

class DetallePedidoRead(SQLModel):
    pedido_id: int
    producto_id: int
    cantidad: int
    nombre_snapshot: str
    precio_snapshot: float
    subtotal_snap: float
    personalizacion: Optional[List[int]] = None
    created_at: datetime

class HistorialEstadoPedidoRead(SQLModel):
    id: int
    pedido_id: int
    estado_desde: Optional[str] = None
    estado_hacia: str
    usuario_id: Optional[int] = None
    motivo: Optional[str] = None
    created_at: datetime

class PedidoCreate(SQLModel):
    direccion_id: Optional[int] = None
    forma_pago_codigo: str
    notas: Optional[str] = None
    detalles: Annotated[List[DetallePedidoInput], Field(min_length=1)]

class PedidoRead(SQLModel):
    id: int
    usuario_id: int
    direccion_id: Optional[int] = None
    estado_codigo: str
    forma_pago_codigo: str
    subtotal: float
    descuento: float
    costo_envio: float
    total: float
    notas: Optional[str] = None
    created_at: datetime
    updated_at: datetime
    detalles: List[DetallePedidoRead] = []
    historial: List[HistorialEstadoPedidoRead] = []

class PedidoUpdateEstado(SQLModel):
    nuevo_estado_codigo: str
    motivo: Optional[str] = None

from app.Core.pagination import PaginatedResponse

class PaginatedPedidoResponse(PaginatedResponse[PedidoRead]):
    pass
class PaginatedEstadoPedidoResponse(PaginatedResponse[EstadoPedidoRead]):
    pass
