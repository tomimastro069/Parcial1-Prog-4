from sqlmodel import Session
from app.Modules.Auditoria.Model.auditoria import Auditoria
from app.Core.UnitOfWork.BaseRepository import BaseRepository

class AuditoriaRepository(BaseRepository[Auditoria]):
    def __init__(self, session: Session):
        super().__init__(session, Auditoria)
