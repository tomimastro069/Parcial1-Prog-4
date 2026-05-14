from sqlmodel import Session
from app.Modules.Categoria.CategoriaRepository import CategoriaRepository
from app.Modules.Ingrediente.IngredienteRepository import IngredienteRepository
from app.Modules.Producto.ProductoRepository import ProductoRepository
from app.Modules.Usuarios.UsuarioRepository import UsuarioRepository
from app.Modules.Auth.authRepository import AuthRepository
from app.Modules.Auditoria.auditoriaRepository import AuditoriaRepository
from app.Modules.UnidadMedida.unidadRepository import UnidadMedidaRepository


class UnitOfWork:
    """Coordinador central de transacciones y repositorios."""

    def __init__(self, session: Session):
        self.session = session
        self.categorias = CategoriaRepository(session)    
        self.ingredientes = IngredienteRepository(session)
        self.productos = ProductoRepository(session)
        self.usuarios = UsuarioRepository(session)
        self.auth = AuthRepository(session)
        self.auditoria = AuditoriaRepository(session)
        self.unidades_medida = UnidadMedidaRepository(session)

    def __enter__(self):
        return self

    def __exit__(self, exc_type, exc, tb):
        if exc_type is not None:
            self.rollback()
        else:
            self.commit()

    def commit(self) -> None:
        self.session.commit()

    def rollback(self) -> None:
        self.session.rollback()

    def close(self) -> None:
        self.session.close()