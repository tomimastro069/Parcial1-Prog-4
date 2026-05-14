from sqlmodel import SQLModel
from typing import Optional

class UnidadMedidaRead(SQLModel):
    id: int
    nombre: str
    simbolo: str
    tipo: str

class UnidadMedidaCreate(SQLModel):
    nombre: str
    simbolo: str
    tipo: str
