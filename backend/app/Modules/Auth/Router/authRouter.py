from app.Modules.Auth.Schema.authSchema import LoginRequest, RegisterRequest, TokenResponse, LogoutRequest, RefreshRequest

router = APIRouter()

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(data: RegisterRequest, uow=Depends(get_uow)):
    service = AuthService(uow)
    return service.register(data)

@router.post("/login", response_model=TokenResponse)
def login(data: LoginRequest, uow=Depends(get_uow)):
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
