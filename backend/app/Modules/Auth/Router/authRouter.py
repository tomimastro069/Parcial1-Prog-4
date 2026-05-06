from fastapi import APIRouter, Depends, status
from app.Core.Dependencies.dependencies import get_uow
from app.Modules.Auth.Service.authService import AuthService
from app.Modules.Auth.Schema.authSchema import LoginRequest, RegisterRequest, TokenResponse

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.register(data)

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.login(data)
