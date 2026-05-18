from fastapi import APIRouter, Depends, status, Request
from app.Core.dependencies import get_uow
from app.Core.Security.deps import get_current_active_user as get_current_user
from app.Modules.Auth.authService import AuthService
from app.Modules.Auth.authSchema import LoginRequest, RegisterRequest, TokenResponse, LogoutRequest, RefreshRequest, UserProfile
from app.Modules.Usuarios.usuario import Usuario
from app.Core.Config.rate_limit import limiter

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.register(data)

@router.post("/login", response_model=TokenResponse)
@limiter.limit("5/minute")
def login(request: Request, data: LoginRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.login(data)

@router.post("/logout")
def logout(data: LogoutRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.logout(data.refresh_token)

@router.post("/refresh", response_model=TokenResponse)
def refresh(data: RefreshRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.refresh_session(data.refresh_token)

@router.get("/me", response_model=UserProfile)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
