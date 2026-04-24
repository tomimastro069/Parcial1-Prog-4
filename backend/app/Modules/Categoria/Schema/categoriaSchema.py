from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional


class CategoriaCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    descripcion: Annotated[Optional[str], Field(max_length=255)] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None


class CategoriaUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    descripcion: Annotated[Optional[str], Field(max_length=255)] = None
