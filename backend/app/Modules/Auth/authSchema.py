from datetime import datetime
from pydantic import BaseModel, EmailStr, model_validator, ConfigDict
from app.Modules.Usuarios.usuario import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    password: str
    rol: UserRole = UserRole.CLIENT

class TokenResponse(BaseModel):
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    user_email: str
    rol: str

class LogoutRequest(BaseModel):
    refresh_token: str

class RefreshRequest(BaseModel):
    refresh_token: str

class UserProfile(BaseModel):
    model_config = ConfigDict(from_attributes=True)
    
    id: int
    nombre: str
    apellido: str
    email: str
    rol: str
    is_active: bool
    created_at: datetime
    roles: list[str] = []

    @model_validator(mode='after')
    def set_roles(self) -> 'UserProfile':
        if not self.roles and self.rol:
            self.roles = [self.rol]
        return self
