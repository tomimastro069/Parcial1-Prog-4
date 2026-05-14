from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional


class CategoriaCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None


class CategoriaRead(SQLModel):
    id: int
    nombre: str
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: bool


class CategoriaUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    descripcion: Optional[str] = None
    parent_id: Optional[int] = None
    is_active: Optional[bool] = None
