from sqlmodel import Session
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Ajustes.Model.ajuste import Ajuste

class AjusteRepository(BaseRepository[Ajuste]):
    def __init__(self, session: Session):
        super().__init__(session, Ajuste)

    def get_by_clave(self, clave: str) -> Ajuste | None:
        return self.session.get(self.model, clave)
