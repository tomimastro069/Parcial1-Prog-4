from sqlmodel import Session, select
from app.Modules.Categoria.categoria import Categoria
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

    def get_full_path(self, categoria_id: int) -> str:
        """Construye el árbol recursivo de la categoría (Ej: Bebidas > Alcohólicas > Vinos)"""
        cat = self.get(categoria_id)
        if not cat:
            return ""
        if cat.parent_id:
            parent_path = self.get_full_path(cat.parent_id)
            return f"{parent_path} > {cat.nombre}"
        return cat.nombre