from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from app.Core.Security.jwt import decode_token
from app.Core.database import get_session
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario, UserRole

# Definimos de dónde sacar el token (el endpoint de login)
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="auth/login")

def get_uow(session=Depends(get_session)):
    """Inyecta el Unit of Work en los servicios."""
    return UnitOfWork(session)

async def get_current_user(token: str = Depends(oauth2_scheme), uow: UnitOfWork = Depends(get_uow)) -> Usuario:
    """Valida el token y devuelve el usuario actual."""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="No se pudo validar las credenciales",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    payload = decode_token(token)
    if payload is None:
        raise credentials_exception
        
    email: str = payload.get("sub")
    if email is None:
        raise credentials_exception
        
    with uow:
        user = uow.usuarios.get_by_email(email)
        if user is None:
            raise credentials_exception
        return user

def role_required(allowed_roles: list[UserRole]):
    """Filtro para restringir rutas según el rol."""
    async def role_checker(current_user: Usuario = Depends(get_current_user)):
        if current_user.rol not in allowed_roles:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="No tenés permisos para realizar esta acción"
            )
        return current_user
    return role_checker
