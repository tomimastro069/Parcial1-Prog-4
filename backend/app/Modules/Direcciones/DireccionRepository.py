from sqlmodel import Session
from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.Direcciones.Model.direccionEntrega import DireccionEntrega

class DireccionRepository(BaseRepository[DireccionEntrega]):
    def __init__(self, session: Session):
        super().__init__(session, DireccionEntrega)

    def desmarcar_principal_usuario(self, usuario_id: int) -> None:
        """Marca todas las direcciones del usuario como es_principal = False"""
        direcciones = self.filter_by(usuario_id=usuario_id, deleted_at=None, es_principal=True)
        for d in direcciones:
            d.es_principal = False
            self.session.add(d)
        self.session.flush()
# ------------