from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional


class IngredienteCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    unidad: Optional[str] = "u"
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    unidad: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class IngredienteUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    unidad: Optional[str] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None
