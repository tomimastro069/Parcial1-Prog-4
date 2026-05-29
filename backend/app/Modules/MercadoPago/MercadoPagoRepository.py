from sqlmodel import Session
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Pagos.Model.Pagos import Pagos

class MercadoPagoRepository(BaseRepository[Pagos]):
    def __init__(self, session: Session):
        super().__init__(session, Pagos)

    def get_by_payment_id(self, payment_id: str) -> Pagos | None:
        return self.first_by(payment_id=payment_id)

    def get_by_pedido_id(self, pedido_id: int) -> Pagos | None:
        return self.first_by(pedido_id=pedido_id)
