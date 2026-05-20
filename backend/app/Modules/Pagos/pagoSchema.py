from sqlmodel import SQLModel

class FormaPagoRead(SQLModel):
    codigo: str
    descripcion: str
    habilitado: bool

from app.Core.pagination import PaginatedResponse

class PaginatedFormaPagoResponse(PaginatedResponse[FormaPagoRead]):
    pass
