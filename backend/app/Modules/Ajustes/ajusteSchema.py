from pydantic import BaseModel, ConfigDict

class AjusteRead(BaseModel):
    clave: str
    valor: str
    descripcion: str | None = None

    model_config = ConfigDict(from_attributes=True)

class AjusteUpdate(BaseModel):
    valor: str
