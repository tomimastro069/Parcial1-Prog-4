from sqlmodel import Session
from app.Modules.Categoria.Repository.CategoriaRepository import CategoriaRepository
from app.Modules.Ingrediente.Repository.IngredienteRepository import IngredienteRepository
from app.Modules.Producto.Repository.ProductoRepository import ProductoRepository


class UnitOfWork:
    """Coordinador central de transacciones y repositorios."""

    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session)    
        self.ingredientes = IngredienteRepository(session)
        self.productos = ProductoRepository(session)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type:
            self.rollback()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def close(self) -> None:
        self.session.close()