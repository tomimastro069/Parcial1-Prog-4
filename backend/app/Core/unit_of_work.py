from sqlmodel import Session
from app.Core.repository import BaseRepository
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Producto.Model.producto import Producto


class CategoriaRepository(BaseRepository[Categoria]):
    """Repositorio específico para Categoría."""
    pass


class IngredienteRepository(BaseRepository[Ingrediente]):
    """Repositorio específico para Ingrediente."""
    pass


class ProductoRepository(BaseRepository[Producto]):
    """Repositorio específico para Producto."""
    pass


class UnitOfWork:
    """Coordinador central de transacciones y repositorios."""

    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session, Categoria)
        self.ingredientes = IngredienteRepository(session, Ingrediente)
        self.productos = ProductoRepository(session, Producto)

    def commit(self) -> None:
        """Confirma la transacción."""
        self.session.commit()

    def rollback(self) -> None:
        """Revierte la transacción."""
        self.session.rollback()

    def close(self) -> None:
        """Cierra la sesión."""
        self.session.close()
