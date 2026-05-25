from sqlmodel import SQLModel, Field

class Ajuste(SQLModel, table=True):
    __tablename__ = "ajuste"

    clave: str = Field(primary_key=True, max_length=50)
    valor: str = Field(max_length=255, nullable=False)
    descripcion: str = Field(max_length=255, nullable=True)
