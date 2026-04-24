from sqlmodel import Session
from sqlmodel import select

from app.Core.repository import BaseRepository
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente


class CategoriaRepository(BaseRepository[Categoria]):
    """Repositorio específico para Categoría."""
    pass


class IngredienteRepository(BaseRepository[Ingrediente]):
    """Repositorio específico para Ingrediente."""
    pass


class ProductoRepository(BaseRepository[Producto]):
    """Repositorio específico para Producto."""

    def list_categorias_rel(self, producto_id: int) -> list[ProductoCategoria]:
        statement = select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        return self.session.exec(statement).all()

    def list_ingredientes_rel(self, producto_id: int) -> list[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(
            ProductoIngrediente.producto_id == producto_id
        )
        return self.session.exec(statement).all()

    def add_categoria_rel(self, producto_id: int, categoria_id: int) -> ProductoCategoria:
        rel = ProductoCategoria(producto_id=producto_id, categoria_id=categoria_id)
        self.session.add(rel)
        self.session.flush()
        return rel

    def add_ingrediente_rel(
        self, producto_id: int, ingrediente_id: int, cantidad: float
    ) -> ProductoIngrediente:
        rel = ProductoIngrediente(
            producto_id=producto_id,
            ingrediente_id=ingrediente_id,
            cantidad=cantidad,
        )
        self.session.add(rel)
        self.session.flush()
        return rel

    def clear_categorias_rel(self, producto_id: int) -> None:
        for rel in self.list_categorias_rel(producto_id):
            self.session.delete(rel)
        self.session.flush()

    def clear_ingredientes_rel(self, producto_id: int) -> None:
        for rel in self.list_ingredientes_rel(producto_id):
            self.session.delete(rel)
        self.session.flush()


class UnitOfWork:
    """Coordinador central de transacciones y repositorios."""

    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session, Categoria)
        self.ingredientes = IngredienteRepository(session, Ingrediente)
        self.productos = ProductoRepository(session, Producto)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type:
            self.rollback()
        # No cerramos la sesión aquí porque la maneja FastAPI con Depends(get_session)

    def commit(self) -> None:
        """Confirma la transacción."""
        self.session.commit()

    def rollback(self) -> None:
        """Revierte la transacción."""
        self.session.rollback()

    def close(self) -> None:
        """Cierra la sesión."""
        self.session.close()
