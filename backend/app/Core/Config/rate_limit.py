from slowapi import Limiter
from slowapi.util import get_remote_address

# Inicializamos el limitador usando la IP del cliente como clave
limiter = Limiter(key_func=get_remote_address)
