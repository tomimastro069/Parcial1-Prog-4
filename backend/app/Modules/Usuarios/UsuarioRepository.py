from datetime import datetime, timezone
from sqlmodel import Session, select
from app.Modules.Usuarios.usuario import Usuario
from app.Core.UnitOfWork.BaseRepository import BaseRepository

class UsuarioRepository(BaseRepository[Usuario]):
    def __init__(self, session: Session):
        super().__init__(session, Usuario)

    def get_all_active(self, offset: int = 0, limit: int = 15, search: str | None = None):
        from sqlmodel import func, select as sel
        stmt = sel(self.model).where(self.model.deleted_at == None)
        if search:
            stmt = stmt.where(self.model.email.ilike(f"%{search}%"))
        total = self.session.exec(sel(func.count()).select_from(stmt.subquery())).one()
        items = self.session.exec(stmt.order_by(self.model.id).offset(offset).limit(limit)).all()
        return list(items), total

    def get_by_email(self, email: str) -> Usuario | None:
        """Busca un usuario activo por su email (excluye soft-deleted)."""
        stmt = select(self.model).where(
            self.model.email == email,
            self.model.deleted_at == None
        )
        return self.session.exec(stmt).first()
