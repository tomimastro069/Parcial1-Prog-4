from sqlmodel import Session, select
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Core.BaseRepository import BaseRepository


class ProductoRepository(BaseRepository[Producto]):
    

    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def list_categorias_rel(self, producto_id: int) -> list[ProductoCategoria]:
        statement = select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        return self.session.exec(statement).all()

    def list_ingredientes_rel(self, producto_id: int) -> list[ProductoIngrediente]:
        statement = select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        return self.session.exec(statement).all()

    def add_categoria_rel(self, producto_id: int, categoria_id: int) -> ProductoCategoria:
        rel = ProductoCategoria(producto_id=producto_id, categoria_id=categoria_id)
        self.session.add(rel)
        self.session.flush()
        self.session.refresh(rel)
        return rel

    def add_ingrediente_rel(self, producto_id: int, ingrediente_id: int, cantidad: float) -> ProductoIngrediente:
        rel = ProductoIngrediente(producto_id=producto_id, ingrediente_id=ingrediente_id, cantidad=cantidad)
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