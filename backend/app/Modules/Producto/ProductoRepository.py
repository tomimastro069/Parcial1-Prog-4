from sqlmodel import Session, select, func
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Core.UnitOfWork.BaseRepository import BaseRepository


from app.Modules.Categoria.categoria import Categoria

class ProductoRepository(BaseRepository[Producto]):
    
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def list_ingredientes_rel(self, producto_id: int) -> list[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        return self.session.exec(statement).all()

    def add_ingrediente_rel(self, producto_id: int, ingrediente_id: int, cantidad: float, unidad_medida_id: int) -> ProductoIngrediente:
        rel = ProductoIngrediente(
            producto_id=producto_id, 
            ingrediente_id=ingrediente_id, 
            cantidad=cantidad,
            unidad_medida_id=unidad_medida_id
        )
        self.session.add(rel)
        self.session.flush()
        return rel



    def clear_ingredientes_rel(self, producto_id: int) -> None:
        for rel in self.list_ingredientes_rel(producto_id):
            self.session.delete(rel)
        self.session.flush()

    def search(self, search_term: str | None = None, categoria_id: int | None = None, offset: int = 0, limit: int = 100, **filters) -> tuple[list[Producto], int]:
        statement = select(Producto)
        
        if categoria_id:
            # Obtener todas las subcategorías de manera recursiva
            from app.Modules.Categoria.categoria import Categoria
            
            def get_descendants(cid: int) -> set[int]:
                res = {cid}
                children = self.session.exec(select(Categoria.id).where(Categoria.parent_id == cid)).all()
                for child in children:
                    res.update(get_descendants(child))
                return res
            
            allowed_cats = get_descendants(categoria_id)
            statement = statement.where(Producto.categoria_id.in_(allowed_cats))
            
        return super().search(
            search_term=search_term,
            offset=offset,
            limit=limit,
            base_statement=statement,
            **filters
        )