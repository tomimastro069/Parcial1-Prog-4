from datetime import datetime, timezone
from typing import Optional, Any, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship, Column, JSON

if TYPE_CHECKING:
    from app.Modules.Usuarios.usuario import Usuario

class Auditoria(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: Optional[int] = Field(default=None, foreign_key="usuario.id", nullable=True)
    accion: str = Field(index=True, max_length=100)
    modulo: str = Field(index=True, max_length=50)
    descripcion: str = Field(max_length=500)
    
    metadata_info: Optional[dict[str, Any]] = Field(default=None, sa_column=Column(JSON))
    
    fecha: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    ip_address: Optional[str] = Field(default=None, max_length=45)

    usuario: Optional["Usuario"] = Relationship()
