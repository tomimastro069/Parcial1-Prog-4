from sqlmodel import SQLModel, create_engine, Session
from sqlalchemy import text
from dotenv import load_dotenv
import os

load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL", "postgresql://postgres:postgres@db:5432/appdb")

engine = create_engine(DATABASE_URL, echo=True)


def _run_light_migrations():
    """Migraciones ligeras idempotentes para columnas agregadas después de la
    creación inicial (create_all no agrega columnas a tablas existentes)."""
    statements = [
        "ALTER TABLE producto ADD COLUMN IF NOT EXISTS margen_ganancia NUMERIC(10,2)",
    ]
    with engine.begin() as conn:
        for stmt in statements:
            conn.execute(text(stmt))


def create_db_and_tables():
    SQLModel.metadata.create_all(engine)
    _run_light_migrations()


def get_session():
    with Session(engine) as session:
        yield session