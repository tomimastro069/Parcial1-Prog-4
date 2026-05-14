from datetime import datetime
from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, TYPE_CHECKING

if TYPE_CHECKING:
    from app.Modules.Usuarios.usuario import Usuario

class RefreshToken(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    token: str = Field(index=True, unique=True)
    user_id: int = Field(foreign_key="usuario.id")
    expires_at: datetime = Field(nullable=False)
    is_revoked: bool = Field(default=False)

    usuario: Optional["Usuario"] = Relationship()
