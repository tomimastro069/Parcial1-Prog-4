from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional


class IngredienteCreate(SQLModel):
    nombre: Annotated[str, Field(min_length=2, max_length=100)]
    unidad_medida_id: int
    descripcion: Optional[str] = None
    es_alergeno: bool = False


class IngredienteRead(SQLModel):
    id: int
    nombre: str
    unidad_medida_id: Optional[int] = None
    unidad: str
    descripcion: Optional[str] = None
    es_alergeno: bool = False
    is_active: bool = True


class IngredienteUpdate(SQLModel):
    nombre: Annotated[Optional[str], Field(min_length=2, max_length=100)] = None
    unidad_medida_id: Optional[int] = None
    descripcion: Optional[str] = None
    es_alergeno: Optional[bool] = None
