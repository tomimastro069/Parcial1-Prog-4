from fastapi import HTTPException, status
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Schema.productoSchema import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    CategoriaEnProducto,
    IngredienteEnProducto,
)
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Auditoria.Model.auditoria import Auditoria
from app.Core.Schema.pagination import PaginatedResponse

class ProductoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def _build_read(self, p: Producto) -> ProductoRead:
        """Construye el schema de lectura con datos de categorías e ingredientes."""
        pcs = self.uow.productos.list_categorias_rel(p.id)
        categorias = [
            CategoriaEnProducto(id=cat.id, nombre=cat.nombre)
            for pc in pcs
            if (cat := self.uow.categorias.get(pc.categoria_id))
        ]

        pis = self.uow.productos.list_ingredientes_rel(p.id)
        ingredientes = [
            IngredienteEnProducto(
                id=ing.id,
                nombre=ing.nombre,
                unidad=ing.unidad,
                cantidad=pi.cantidad,
            )
            for pi in pis
            if (ing := self.uow.ingredientes.get(pi.ingrediente_id))
        ]

        return ProductoRead(
            id=p.id,
            nombre=p.nombre,
            precio=p.precio,
            descripcion=p.descripcion,
            is_active=p.is_active,
            categorias=categorias,
            ingredientes=ingredientes,
        )

    def get_all(self, page: int = 1, size: int = 10) -> PaginatedResponse[ProductoRead]:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            productos = self.uow.productos.filter_by(is_active=True, offset=offset, limit=size)
            total = self.uow.productos.count_by(is_active=True)
            
            items = [self._build_read(p) for p in productos]
            pages = (total + size - 1) // size
            
            return PaginatedResponse(
                items=items,
                total=total,
                page=page,
                size=size,
                pages=pages
            )

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )
            return self._build_read(p)

    def _validar_categorias(self, categorias: list[int]) -> None:
        for cat_id in categorias:
            cat = self.uow.categorias.get(cat_id)
            if not cat or not cat.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id {cat_id} no encontrada",
                )

    def _validar_ingredientes(self, ingredientes: list) -> None:
        for ing_input in ingredientes:
            ing = self.uow.ingredientes.get(ing_input.ingrediente_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_input.ingrediente_id} no encontrado",
                )

    def create(self, data: ProductoCreate, user_id: int) -> ProductoRead:
        with self.uow:
            self._validar_categorias(data.categorias)
            self._validar_ingredientes(data.ingredientes)

            p = Producto(nombre=data.nombre, precio=data.precio, descripcion=data.descripcion)
            self.uow.productos.add(p)

            for cat_id in data.categorias:
                rel = self.uow.productos.add_categoria_rel(producto_id=p.id, categoria_id=cat_id)
                p.producto_categorias.append(rel)

            for ing_input in data.ingredientes:
                rel = self.uow.productos.add_ingrediente_rel(
                    producto_id=p.id,
                    ingrediente_id=ing_input.ingrediente_id,
                    cantidad=ing_input.cantidad,
                )
                p.producto_ingredientes.append(rel)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_CREAR",
                modulo="PRODUCTOS",
                descripcion=f"Se creó el producto: {p.nombre}",
                metadata_info={"id": p.id, "precio": p.precio}
            ))

            return self._build_read(p)

    def update(self, producto_id: int, data: ProductoUpdate, user_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )

            # Actualizar campos básicos
            campos_base = data.model_dump(exclude_unset=True, exclude={"categorias", "ingredientes"})
            for key, val in campos_base.items():
                setattr(p, key, val)

            # Sincronizar categorías
            if data.categorias is not None:
                self._validar_categorias(data.categorias)
                self.uow.productos.clear_categorias_rel(producto_id)
                p.producto_categorias = []
                for cat_id in data.categorias:
                    rel = self.uow.productos.add_categoria_rel(producto_id=producto_id, categoria_id=cat_id)
                    p.producto_categorias.append(rel)

            # Sincronizar ingredientes
            if data.ingredientes is not None:
                self._validar_ingredientes(data.ingredientes)
                self.uow.productos.clear_ingredientes_rel(producto_id)
                p.producto_ingredientes = []
                for ing_input in data.ingredientes:
                    rel = self.uow.productos.add_ingrediente_rel(
                        producto_id=producto_id,
                        ingrediente_id=ing_input.ingrediente_id,
                        cantidad=ing_input.cantidad,
                    )
                    p.producto_ingredientes.append(rel)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_ACTUALIZAR",
                modulo="PRODUCTOS",
                descripcion=f"Se actualizó el producto: {p.nombre}",
                metadata_info={"id": p.id, "cambios": data.model_dump(exclude_unset=True)}
            ))

            return self._build_read(p)

    def delete(self, producto_id: int, user_id: int) -> None:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )
            
            # Auditoría antes de desactivar para tener el nombre
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_ELIMINAR",
                modulo="PRODUCTOS",
                descripcion=f"Se eliminó lógicamente el producto: {p.nombre}",
                metadata_info={"id": p.id}
            ))

            self.uow.productos.clear_categorias_rel(producto_id)
            self.uow.productos.clear_ingredientes_rel(producto_id)
            p.is_active = False
