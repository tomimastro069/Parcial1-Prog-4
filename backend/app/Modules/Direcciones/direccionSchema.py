from sqlmodel import SQLModel
from pydantic import Field
from typing import Annotated, Optional
from decimal import Decimal

class DireccionEntregaCreate(SQLModel):
    alias: Annotated[Optional[str], Field(max_length=50)] = None
    linea1: str
    linea2: Optional[str] = None
    ciudad: Annotated[str, Field(max_length=100)]
    provincia: Annotated[Optional[str], Field(max_length=100)] = None
    codigo_postal: Annotated[Optional[str], Field(max_length=10)] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    es_principal: bool = False

class DireccionEntregaRead(SQLModel):
    id: int
    usuario_id: int
    alias: Optional[str] = None
    linea1: str
    linea2: Optional[str] = None
    ciudad: str
    provincia: Optional[str] = None
    codigo_postal: Optional[str] = None
    latitud: Optional[float] = None
    longitud: Optional[float] = None
    es_principal: bool

class DireccionEntregaUpdate(SQLModel):
    alias: Annotated[Optional[str], Field(max_length=50)] = None
    linea1: Optional[str] = None
    linea2: Optional[str] = None
    ciudad: Annotated[Optional[str], Field(max_length=100)] = None
    provincia: Annotated[Optional[str], Field(max_length=100)] = None
    codigo_postal: Annotated[Optional[str], Field(max_length=10)] = None
    latitud: Optional[Decimal] = None
    longitud: Optional[Decimal] = None
    es_principal: Optional[bool] = None

from app.Core.pagination import PaginatedResponse

class PaginatedDireccionResponse(PaginatedResponse[DireccionEntregaRead]):
    pass
