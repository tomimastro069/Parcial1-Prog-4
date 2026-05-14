from sqlmodel import Session, select, func
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Core.UnitOfWork.BaseRepository import BaseRepository


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

    def clear_categorias_rel(self, producto_id: int) -> None:
        for rel in self.list_categorias_rel(producto_id):
            self.session.delete(rel)
        self.session.flush()

    def clear_ingredientes_rel(self, producto_id: int) -> None:
        for rel in self.list_ingredientes_rel(producto_id):
            self.session.delete(rel)
        self.session.flush()

    def search(self, is_active: bool, search: str | None, categoria_id: int | None, offset: int, limit: int) -> tuple[list[Producto], int]:
        statement = select(Producto).where(Producto.is_active == is_active)
        
        if search:
            statement = statement.where(Producto.nombre.ilike(f"%{search}%"))
            
        if categoria_id:
            statement = statement.join(ProductoCategoria).where(ProductoCategoria.categoria_id == categoria_id)
            
        total = self.session.exec(select(func.count()).select_from(statement.subquery())).one()
        productos = self.session.exec(statement.offset(offset).limit(limit)).all()
        return list(productos), total