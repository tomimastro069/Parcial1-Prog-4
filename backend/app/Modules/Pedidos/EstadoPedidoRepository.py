from sqlmodel import Session
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Pedidos.Model.estadoPedido import EstadoPedido

class EstadoPedidoRepository(BaseRepository[EstadoPedido]):
    def __init__(self, session: Session):
        super().__init__(session, EstadoPedido)

    def get_by_codigo(self, codigo: str) -> EstadoPedido | None:
        return self.first_by(codigo=codigo)
