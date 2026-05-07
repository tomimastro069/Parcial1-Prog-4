import secrets
from datetime import datetime, timedelta, timezone
from fastapi import HTTPException, status
from app.Core.Security.jwt import get_password_hash, verify_password, create_access_token
from app.Core.Config.Config import settings
from app.Modules.Auth.Schema.authSchema import LoginRequest, RegisterRequest, TokenResponse
from app.Modules.Usuarios.usuario import Usuario
from app.Modules.Auth.Model.refreshToken import RefreshToken
from app.Modules.Auditoria.Model.auditoria import Auditoria

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
                nombre=data.nombre,
                apellido=data.apellido,
                email=data.email,
                password_hash=hashed_pass,
                rol=data.rol
            )

            # 4. Guardamos
            self.uow.usuarios.add(new_user)

            # 5. AUDITORÍA: Registro de usuario
            self.uow.auditoria.add(Auditoria(
                user_id=new_user.id,
                accion="USUARIO_REGISTRO",
                modulo="AUTH",
                descripcion=f"Nuevo usuario registrado: {new_user.email}",
                metadata_info={"email": new_user.email, "rol": new_user.rol.value}
            ))
            
            return {"message": "Usuario registrado con éxito"}

    def login(self, data: LoginRequest) -> TokenResponse:
        with self.uow:
            # 1. Buscamos al usuario
            user = self.uow.usuarios.get_by_email(data.email)
            
            # 2. Validamos existencia y contraseña
            if not user or not verify_password(data.password, user.password_hash):
                # AUDITORÍA: Intento fallido
                self.uow.auditoria.add(Auditoria(
                    user_id=user.id if user else None,
                    accion="LOGIN_FALLIDO",
                    modulo="AUTH",
                    descripcion=f"Intento de login fallido para: {data.email}"
                ))
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

            # 3. AUDITORÍA: Login exitoso
            self.uow.auditoria.add(Auditoria(
                user_id=user.id,
                accion="LOGIN_EXITOSO",
                modulo="AUTH",
                descripcion=f"Inicio de sesión exitoso: {user.email}"
            ))

            # 4. Generamos el Token de Acceso
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            access_token = create_access_token(
                data={"sub": user.email, "rol": user.rol.value},
                expires_delta=access_token_expires
            )

            # 5. Generamos y guardamos el Refresh Token
            refresh_token_str = secrets.token_hex(32)
            refresh_expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            
            new_refresh_token = RefreshToken(
                token=refresh_token_str,
                user_id=user.id,
                expires_at=refresh_expire
            )
            
            self.uow.auth.add(new_refresh_token)

            return TokenResponse(
                access_token=access_token,
                refresh_token=refresh_token_str,
                user_email=user.email,
                rol=user.rol.value
            )

    def logout(self, refresh_token: str):
        with self.uow:
            # 1. Buscamos el token
            token_db = self.uow.auth.get_by_token(refresh_token)
            
            if token_db:
                # 2. Revocación (Soft Delete)
                token_db.is_revoked = True
                
                # 3. AUDITORÍA: Logout
                self.uow.auditoria.add(Auditoria(
                    user_id=token_db.user_id,
                    accion="LOGOUT",
                    modulo="AUTH",
                    descripcion=f"Sesión cerrada y token revocado"
                ))
            
            return {"message": "Sesión cerrada con éxito"}

    def refresh_session(self, old_token_str: str) -> TokenResponse:
        with self.uow:
            # 1. Validamos el token viejo en la base de datos
            token_db = self.uow.auth.get_by_token(old_token_str)
            
            if not token_db or token_db.is_revoked:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de refresco inválido o revocado"
                )
            
            if token_db.expires_at < datetime.now(timezone.utc):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Token de refresco expirado"
                )

            # 2. Obtenemos al usuario
            user = self.uow.usuarios.get(token_db.user_id)
            if not user or not user.is_active:
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Usuario no encontrado o inactivo"
                )

            # 3. ROTACIÓN: Revocamos el token viejo
            token_db.is_revoked = True

            # 4. Generamos el nuevo par de tokens
            access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
            new_access_token = create_access_token(
                data={"sub": user.email, "rol": user.rol.value},
                expires_delta=access_token_expires
            )

            new_refresh_token_str = secrets.token_hex(32)
            refresh_expire = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
            
            new_refresh_token = RefreshToken(
                token=new_refresh_token_str,
                user_id=user.id,
                expires_at=refresh_expire
            )
            
            # 5. Guardamos el nuevo refresh token
            self.uow.auth.add(new_refresh_token)

            # 6. AUDITORÍA: Refresh
            self.uow.auditoria.add(Auditoria(
                user_id=user.id,
                accion="TOKEN_REFRESH",
                modulo="AUTH",
                descripcion=f"Renovación de sesión exitosa para: {user.email}"
            ))

            return TokenResponse(
                access_token=new_access_token,
                refresh_token=new_refresh_token_str,
                user_email=user.email,
                rol=user.rol.value
            )
