from sqlmodel import SQLModel
from typing import Optional


class CategoriaCreate(SQLModel):
    nombre: str
    descripcion: Optional[str] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None


class CategoriaUpdate(SQLModel):
    nombre: Optional[str] = None
    descripcion: Optional[str] = None