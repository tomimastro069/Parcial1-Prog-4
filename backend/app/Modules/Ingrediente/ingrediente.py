from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from datetime import datetime

if TYPE_CHECKING:
    from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente


class Ingrediente(SQLModel, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    nombre: str = Field(min_length=2, max_length=100)
    descripcion: Optional[str] = Field(default=None, max_length=500)
    es_alergeno: bool = Field(default=False)
    stock_actual: float = Field(default=0.0, ge=0)
    is_active: bool = Field(default=True)  # borrado lógico

    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False
    )

    # Lado N:N → un Ingrediente aparece en muchos Productos
    producto_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="ingrediente"
    )

    unidad_medida_id: Optional[int] = Field(
    default=None,
    foreign_key="unidadmedida.id",
    nullable=False)

    unidad_medida: Optional["UnidadMedida"] = Relationship(
        back_populates="ingredientes")