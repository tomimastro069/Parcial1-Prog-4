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
    email: str = Field(unique=True, index=True, max_length=255)
    password_hash: str = Field(max_length=255)
    rol: UserRole = Field(default=UserRole.CLIENT)
    is_active: bool = Field(default=True)
