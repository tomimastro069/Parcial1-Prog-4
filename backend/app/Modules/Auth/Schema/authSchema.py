from pydantic import BaseModel, EmailStr
from app.Modules.Usuarios.usuario import UserRole

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class RegisterRequest(BaseModel):
    email: EmailStr
    password: str
    rol: UserRole = UserRole.CLIENT

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_email: str
    rol: str
