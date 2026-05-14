from sqlmodel import Session
from app.Modules.Auth.Model.refreshToken import RefreshToken
from app.Core.UnitOfWork.BaseRepository import BaseRepository

class AuthRepository(BaseRepository[RefreshToken]):
    def __init__(self, session: Session):
        super().__init__(session, RefreshToken)

    def get_by_token(self, token: str) -> RefreshToken | None:
        """Busca un token de refresco."""
        return self.first_by(token=token)
