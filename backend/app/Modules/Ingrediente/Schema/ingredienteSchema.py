from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional


class IngredienteCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    unidad: Annotated[str, Field(min_length=1, max_length=50)]


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    unidad: str


class IngredienteUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    unidad: Annotated[Optional[str], Field(min_length=1, max_length=50)] = None
