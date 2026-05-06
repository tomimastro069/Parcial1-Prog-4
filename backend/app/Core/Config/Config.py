import os
from dotenv import load_dotenv

# Cargamos las variables de entorno desde el archivo .env
load_dotenv()

class Settings:
    # --- Base de Datos ---
    DATABASE_URL: str = os.getenv("DATABASE_URL")

    # --- Seguridad JWT ---
    SECRET_KEY: str = os.getenv("SECRET_KEY")
    ALGORITHM: str = os.getenv("ALGORITHM", "HS256")
    ACCESS_TOKEN_EXPIRE_MINUTES: int = int(os.getenv("ACCESS_TOKEN_EXPIRE_MINUTES", 30))
    REFRESH_TOKEN_EXPIRE_DAYS: int = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", 7))

    # --- Otros ---
    PROJECT_NAME: str = "Food Store API"
    VERSION: str = "4.0"

# Creamos una instancia única (Singleton) para importar en el resto del código
settings = Settings()
