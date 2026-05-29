from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime
from decimal import Decimal
from app.Modules.Pagos.Model.PaymentStatus import PaymentStatus

class Pagos(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    payment_id: str = Field(index=True, unique=True)
    status: PaymentStatus = Field(index=True)
    
    amount: Decimal = Field(max_digits=10, decimal_places=2)
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    usuario_id: Optional[int] = Field(default=None, index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
