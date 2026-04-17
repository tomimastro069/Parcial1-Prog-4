from sqlmodel import Session
from app.Core.repository import BaseRepository
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente


class CategoriaRepository(BaseRepository[Categoria]):
    """Repositorio específico para Categoría."""
    pass


class IngredienteRepository(BaseRepository[Ingrediente]):
    """Repositorio específico para Ingrediente."""
    pass


# Nota: ProductoRepository se agregará cuando Producto esté implementado


class UnitOfWork:
    """Coordinador central de transacciones y repositorios."""
    
    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session, Categoria)
        self.ingredientes = IngredienteRepository(session, Ingrediente)
        # self.productos = ProductoRepository(session, Producto)  # Se agrega después
    
    def commit(self) -> None:
        """Confirma la transacción."""
        self.session.commit()
    
    def rollback(self) -> None:
        """Revierte la transacción."""
        self.session.rollback()
    
    def close(self) -> None:
        """Cierra la sesión."""
        self.session.close()
