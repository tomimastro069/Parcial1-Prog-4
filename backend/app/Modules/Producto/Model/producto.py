from sqlmodel import SQLModel, Field, Relationship
from typing import Optional, List, TYPE_CHECKING
from decimal import Decimal
from sqlalchemy import Column, JSON

if TYPE_CHECKING:
    from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
    from app.Modules.Categoria.Model.categoria import Categoria
    from app.Modules.UnidadMedida.Model.unidadMedida import UnidadMedida


class Producto(SQLModel, table=True):
    __tablename__ = "producto"

    id: Optional[int] = Field(default=None, primary_key=True)
    unidad_venta_id: Optional[int] = Field(
        default=None,
        foreign_key="unidadmedida.id",
        nullable=True
    )
    categoria_id: Optional[int] = Field(
        default=None,
        foreign_key="categoria.id",
        nullable=True
    )

    # NN
    nombre: str = Field(
        min_length=2,
        max_length=150,
        nullable=False
    )

    # TEXT
    descripcion: Optional[str] = Field(default=None)

    # DECIMAL(10,2) NN
    precio_base: Decimal = Field(
        gt=0,
        nullable=False
    )

    # Margen de ganancia POR PRODUCTO, expresado en porcentaje (ej: 50 = +50%).
    # Si es NULL, el producto usa el índice de ganancia global (ajuste).
    margen_ganancia: Optional[Decimal] = Field(
        default=None,
        ge=0,
        nullable=True
    )

    # TEXT[]
    imagenes_url: Optional[List[str]] = Field(default=None,sa_column=Column(JSON))

    # INTEGER NN DEFAULT 0
    stock_cantidad: int = Field(
        default=0,
        ge=0,
        nullable=False
    )

    # BOOLEAN NN DEFAULT TRUE
    disponible: bool = Field(
        default=True,
        nullable=False
    )

    # BOOLEAN NN DEFAULT TRUE
    is_active: bool = Field(
        default=True,
        nullable=False
    )

    # BOOLEAN NN DEFAULT FALSE
    es_terminado: bool = Field(
        default=False,
        nullable=False
    )

    # -------------------------
    # RELACIONES
    # -------------------------

    unidad_medida: Optional["UnidadMedida"] = Relationship(back_populates="productos")

    producto_ingredientes: List["ProductoIngrediente"] = Relationship(
        back_populates="producto",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"},
    )

    categoria: Optional["Categoria"] = Relationship(
        back_populates="productos"
    )