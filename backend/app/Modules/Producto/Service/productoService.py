from sqlmodel import Session
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


def _build_read(p: Producto, uow: UnitOfWork) -> ProductoRead:
    """Construye el schema de lectura con datos de categorías e ingredientes."""
    pcs = uow.productos.list_categorias_rel(p.id)
    categorias = [
        CategoriaEnProducto(id=cat.id, nombre=cat.nombre)
        for pc in pcs
        if (cat := uow.categorias.get(pc.categoria_id))
    ]

    pis = uow.productos.list_ingredientes_rel(p.id)
    ingredientes = [
        IngredienteEnProducto(
            id=ing.id,
            nombre=ing.nombre,
            unidad=ing.unidad,
            cantidad=pi.cantidad,
        )
        for pi in pis
        if (ing := uow.ingredientes.get(pi.ingrediente_id))
    ]

    return ProductoRead(
        id=p.id,
        nombre=p.nombre,
        precio=p.precio,
        descripcion=p.descripcion,
        categorias=categorias,
        ingredientes=ingredientes,
    )


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[ProductoRead]:
    with UnitOfWork(session) as uow:
        productos = uow.productos.filter_by(is_active=True, offset=offset, limit=limit)
        return [_build_read(p, uow) for p in productos]


def get_by_id(session: Session, producto_id: int) -> ProductoRead:
    with UnitOfWork(session) as uow:
        p = uow.productos.get(producto_id)
        if not p or not p.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con id {producto_id} no encontrado",
            )
        return _build_read(p, uow)


def _validar_categorias(uow: UnitOfWork, categorias: list[int]) -> None:
    for cat_id in categorias:
        cat = uow.categorias.get(cat_id)
        if not cat or not cat.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con id {cat_id} no encontrada",
            )


def _validar_ingredientes(uow: UnitOfWork, ingredientes: list) -> None:
    for ing_input in ingredientes:
        ing = uow.ingredientes.get(ing_input.ingrediente_id)
        if not ing or not ing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_input.ingrediente_id} no encontrado",
            )


def create(session: Session, data: ProductoCreate) -> ProductoRead:
    with UnitOfWork(session) as uow:
        _validar_categorias(uow, data.categorias)
        _validar_ingredientes(uow, data.ingredientes)

        p = Producto(nombre=data.nombre, precio=data.precio, descripcion=data.descripcion)
        uow.productos.add(p)

        for cat_id in data.categorias:
            rel = uow.productos.add_categoria_rel(producto_id=p.id, categoria_id=cat_id)
            p.producto_categorias.append(rel)

        for ing_input in data.ingredientes:
            rel = uow.productos.add_ingrediente_rel(
                producto_id=p.id,
                ingrediente_id=ing_input.ingrediente_id,
                cantidad=ing_input.cantidad,
            )
            p.producto_ingredientes.append(rel)

        session.refresh(p)
        return _build_read(p, uow)


def update(session: Session, producto_id: int, data: ProductoUpdate) -> ProductoRead:
    with UnitOfWork(session) as uow:
        p = uow.productos.get(producto_id)
        if not p or not p.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con id {producto_id} no encontrado",
            )

        # Actualizar campos básicos
        campos_base = data.model_dump(exclude_unset=True, exclude={"categorias", "ingredientes"})
        for key, val in campos_base.items():
            setattr(p, key, val)

        # Sincronizar categorías si se enviaron
        if data.categorias is not None:
            _validar_categorias(uow, data.categorias)
            uow.productos.clear_categorias_rel(producto_id)
            p.producto_categorias = []
            for cat_id in data.categorias:
                rel = uow.productos.add_categoria_rel(producto_id=producto_id, categoria_id=cat_id)
                p.producto_categorias.append(rel)

        # Sincronizar ingredientes si se enviaron
        if data.ingredientes is not None:
            _validar_ingredientes(uow, data.ingredientes)
            uow.productos.clear_ingredientes_rel(producto_id)
            p.producto_ingredientes = []
            for ing_input in data.ingredientes:
                rel = uow.productos.add_ingrediente_rel(
                    producto_id=producto_id,
                    ingrediente_id=ing_input.ingrediente_id,
                    cantidad=ing_input.cantidad,
                )
                p.producto_ingredientes.append(rel)

        session.refresh(p)
        return _build_read(p, uow)


def delete(session: Session, producto_id: int) -> None:
    with UnitOfWork(session) as uow:
        p = uow.productos.get(producto_id)
        if not p or not p.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Producto con id {producto_id} no encontrado",
            )
        # Borrado físico de tablas intermedias
        uow.productos.clear_categorias_rel(producto_id)
        uow.productos.clear_ingredientes_rel(producto_id)
        # Borrado lógico del producto
        p.is_active = False
        session.flush()
