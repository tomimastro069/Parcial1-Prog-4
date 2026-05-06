from datetime import timedelta
from fastapi import HTTPException, status
from app.Core.Security.jwt import get_password_hash, verify_password, create_access_token
from app.Core.Config.Config import settings
from app.Modules.Auth.Schema.authSchema import LoginRequest, RegisterRequest, TokenResponse
from app.Modules.Usuarios.usuario import Usuario

class AuthService:
    def __init__(self, uow):
        self.uow = uow

    def register(self, data: RegisterRequest):
        # Usamos 'with' sincrónico y dejamos que el UoW haga el commit solo
        with self.uow:
            # 1. Verificamos si el usuario ya existe
            existing_user = self.uow.usuarios.get_by_email(data.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El email ya está registrado"
                )

            # 2. Hasheamos la contraseña
            hashed_pass = get_password_hash(data.password)

            # 3. Creamos el nuevo usuario
            new_user = Usuario(
                email=data.email,
                password_hash=hashed_pass,
                rol=data.rol
            )

            # 4. Guardamos
            self.uow.usuarios.add(new_user)
            
            return {"message": "Usuario registrado con éxito"}

    def login(self, data: LoginRequest) -> TokenResponse:
        with self.uow:
            # 1. Buscamos al usuario
            user = self.uow.usuarios.get_by_email(data.email)
            
            # 2. Validamos existencia y contraseña
            if not user or not verify_password(data.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Credenciales inválidas",
                    headers={"WWW-Authenticate": "Bearer"},
                )
            
            if not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="Usuario inactivo"
                )

            # 3. Generamos el Token de Acceso
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "rol": user.rol.value},
                expires_delta=access_token_expires
            )

            return TokenResponse(
                access_token=access_token,
                user_email=user.email,
                rol=user.rol.value
            )
