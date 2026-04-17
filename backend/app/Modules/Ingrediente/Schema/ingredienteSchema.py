from sqlmodel import SQLModel
from typing import Optional


class IngredienteCreate(SQLModel):
    nombre: str
    unidad: str


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    unidad: str


class IngredienteUpdate(SQLModel):
    nombre: Optional[str] = None
    unidad: Optional[str] = None