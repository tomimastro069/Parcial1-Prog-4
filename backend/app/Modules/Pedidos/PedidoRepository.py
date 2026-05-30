from sqlmodel import Session, select
from sqlalchemy import desc
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
