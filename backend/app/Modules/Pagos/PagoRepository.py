from sqlmodel import Session
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Pagos.Model.formaPago import FormaPago

class PagoRepository(BaseRepository[FormaPago]):
    def __init__(self, session: Session):
        super().__init__(session, FormaPago)

    def get_by_codigo(self, codigo: str) -> FormaPago | None:
        return self.first_by(codigo=codigo)
