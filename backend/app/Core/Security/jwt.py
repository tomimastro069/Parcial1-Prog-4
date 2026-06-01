from datetime import datetime, timedelta, timezone
from typing import Union

from jose import JWTError, jwt
from passlib.context import CryptContext

# Importamos los settings que acabamos de crear
from app.Core.Config.Config import settings

# 1. Configuración para el hashing de contraseñas (bcrypt)
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verifica si la contraseña ingresada coincide con el hash guardado."""
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password: str) -> str:
    """Transforma una contraseña de texto plano en un hash seguro."""
    return pwd_context.hash(password)

# 2. Creación del Token de Acceso
def create_access_token(data: dict, expires_delta: Union[timedelta, None] = None) -> str:
    """
    Genera un JWT firmado. 
    'data' suele traer el email del usuario en el campo 'sub'.
    """
    to_encode = data.copy()
    
    if expires_delta:
        expire = datetime.now(timezone.utc) + expires_delta
    else:
        expire = datetime.now(timezone.utc) + timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    
    to_encode.update({"exp": expire})
    
    # Firmamos el token con nuestra SECRET_KEY
    encoded_jwt = jwt.encode(to_encode, settings.SECRET_KEY, algorithm=settings.ALGORITHM)
    return encoded_jwt

# 3. Decodificación del Token
def decode_token(token: str):
    """Verifica si un token es válido y devuelve su contenido."""
    try:
        payload = jwt.decode(token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM])
        return payload
    except JWTError:
        return None
#header hash rapido general 
#payload todo lo importante del usuario 
# firma clave secreta para verificar la integridad 