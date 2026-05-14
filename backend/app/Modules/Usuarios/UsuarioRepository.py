from sqlmodel import Session
from app.Modules.Usuarios.usuario import Usuario
from app.Core.UnitOfWork.BaseRepository import BaseRepository

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_by_email(self, email: str) -> Usuario | None:
        """Busca un usuario por su email."""
        return self.first_by(email=email)
