from datetime import datetime, timezone
from enum import Enum
from sqlmodel import SQLModel, Field
from typing import Optional

# Los roles se quedan acá porque son una propiedad del usuario
class UserRole(str, Enum):
    ADMIN = "ADMIN"
    STOCK = "STOCK"
    PEDIDOS = "PEDIDOS"
    CLIENT = "CLIENT"

class Usuario(SQLModel, table=True):

    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(max_length=100)
    apellido: str = Field(max_length=100)
    email: str = Field(unique=True, index=True, max_length=255)
    celular: Optional[str] = Field(default=None, max_length=20)
    password_hash: str = Field(max_length=255)
    rol: UserRole = Field(default=UserRole.CLIENT)
    is_active: bool = Field(default=True)
    created_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    updated_at: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    deleted_at: Optional[datetime] = Field(default=None)
