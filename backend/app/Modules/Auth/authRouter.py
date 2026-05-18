from fastapi import APIRouter, Depends, status, Request, Response
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
def login(request: Request, response: Response, data: LoginRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    token_data = service.login(data)
    response.set_cookie(key="access_token", value=token_data.access_token, httponly=True, samesite="lax")
    return token_data

@router.post("/logout")
def logout(response: Response, data: LogoutRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    result = service.logout(data.refresh_token)
    response.delete_cookie("access_token")
    return result

@router.post("/refresh", response_model=TokenResponse)
def refresh(response: Response, data: RefreshRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    token_data = service.refresh_session(data.refresh_token)
    response.set_cookie(key="access_token", value=token_data.access_token, httponly=True, samesite="lax")
    return token_data

@router.get("/me", response_model=UserProfile)
def me(current_user: Usuario = Depends(get_current_user)):
    return current_user
