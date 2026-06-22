from sqlmodel import Session, select
from app.Modules.Categoria.categoria import Categoria
from app.Core.UnitOfWork.BaseRepository import BaseRepository



class CategoriaRepository(BaseRepository[Categoria]):
  
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    # proximos metodos a implementar: solo se agregan aca y listo.
    
    def clear_productos_rel(self, categoria_id: int) -> None:
        from app.Modules.Producto.Model.producto import Producto
        statement = select(Producto).where(Producto.categoria_id == categoria_id)
        for p in self.session.exec(statement).all():
            p.categoria_id = None
            self.session.add(p)
        self.session.flush()

    def get_full_path(self, categoria_id: int) -> str:
        """Construye el árbol recursivo de la categoría"""
        cat = self.get(categoria_id)
        if not cat:
            return ""
        if cat.parent_id:
            parent_path = self.get_full_path(cat.parent_id)
            return f"{parent_path} / {cat.nombre}"
        return cat.nombre