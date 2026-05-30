from sqlmodel import SQLModel, Field
from typing import Optional
from datetime import datetime, timezone
from decimal import Decimal
from app.Modules.Pagos.Model.PaymentStatus import PaymentStatus

class Pagos(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)

    # FK
    pedido_id: int = Field(foreign_key="pedido.id", index=True)
    usuario_id: Optional[int] = Field(default=None, index=True)

    # MercadoPago Checkout API
    payment_id: str = Field(index=True, unique=True)
    status: PaymentStatus = Field(index=True)
    mp_status_detail: Optional[str] = Field(default=None, max_length=100)
    # Ej: accredited | cc_rejected_other_reason | cc_rejected_insufficient_amount

    external_reference: Optional[str] = Field(default=None, max_length=100)
    # UUID que identifica al Pedido en MercadoPago

    idempotency_key: Optional[str] = Field(default=None, max_length=100)
    # UUID generado por backend ANTES de llamar al SDK (X-Idempotency-Key)

    amount: Decimal = Field(max_digits=10, decimal_places=2)
    # Monto cobrado por MP (transaction_amount)

    payment_method_id: Optional[str] = Field(default=None, max_length=50)
    # Ej: visa | master | account_money | rapipago

    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
