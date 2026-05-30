from sqlmodel import Session, select
from sqlalchemy import desc, case
from typing import Optional, List
from sqlalchemy.orm import selectinload
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Pedidos.Model.pedido import Pedido

class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def get_with_relations(self, pedido_id: int) -> Optional[Pedido]:
        statement = select(self.model).where(self.model.id == pedido_id).options(
            selectinload(self.model.detalles),
            selectinload(self.model.historial),
            selectinload(self.model.estado),
            selectinload(self.model.forma_pago)
        )
        return self.session.exec(statement).first()

    def get_user_orders(self, usuario_id: int, offset: int = 0, limit: int = 100) -> tuple[List[Pedido], int]:
        statement = select(self.model).where(
            self.model.usuario_id == usuario_id,
            self.model.deleted_at == None
        )
        
        statement_with_options = statement.options(
            selectinload(self.model.detalles),
            selectinload(self.model.estado),
            selectinload(self.model.forma_pago)
        )
        
        from sqlmodel import func
        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
        
        items = self.session.exec(statement_with_options.order_by(desc(self.model.id)).offset(offset).limit(limit)).all()
        return list(items), total

    def get_all_admin(self, offset: int = 0, limit: int = 10, estado_codigo: str | None = None, pedido_id: int | None = None) -> tuple[List[Pedido], int]:
        statement = select(self.model).where(self.model.deleted_at == None)
        if estado_codigo:
            statement = statement.where(self.model.estado_codigo == estado_codigo)
        if pedido_id:
            statement = statement.where(self.model.id == pedido_id)

        from sqlmodel import func
        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()

        # Pedidos terminales (ENTREGADO, CANCELADO) van al final; dentro de cada grupo, más reciente primero
        orden_terminal = case(
            (self.model.estado_codigo.in_(["ENTREGADO", "CANCELADO"]), 1),
            else_=0
        )
        statement = statement.order_by(orden_terminal, desc(self.model.id))

        items = self.session.exec(statement.offset(offset).limit(limit)).all()
        return list(items), total
