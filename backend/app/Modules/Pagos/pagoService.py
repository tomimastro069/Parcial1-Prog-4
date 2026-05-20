import math
from fastapi import HTTPException, status
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Pagos.pagoSchema import FormaPagoRead

class PagoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self) -> list[FormaPagoRead]:
        with self.uow:
            return self.uow.pagos.filter_by(habilitado=True)

class EstadoPedidoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self) -> list:
        with self.uow:
            return self.uow.estado_pedidos.get_list()
