from sqlmodel import Session, select
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Core.UnitOfWork.BaseRepository import BaseRepository



class CategoriaRepository(BaseRepository[Categoria]):
  
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    # proximos metodos a implementar: solo se agregan aca y listo.
    
    def clear_productos_rel(self, categoria_id: int) -> None:
        statement = select(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
        for rel in self.session.exec(statement).all():
            self.session.delete(rel)
        self.session.flush()
    