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
from app.Core.unit_of_work import UnitOfWork


def _build_read(p: Producto, session: Session) -> ProductoRead:
    """Construye el schema de lectura con datos de categorías e ingredientes."""
    uow = UnitOfWork(session)

    # Categorías relacionadas
    pcs = uow.productos.list_categorias_rel(p.id)
    categorias = []
    for pc in pcs:
        cat = uow.categorias.get(pc.categoria_id)
        if cat:
            categorias.append(CategoriaEnProducto(id=cat.id, nombre=cat.nombre))

    # Ingredientes relacionados
    pis = uow.productos.list_ingredientes_rel(p.id)
    ingredientes = []
    for pi in pis:
        ing = uow.ingredientes.get(pi.ingrediente_id)
        if ing:
            ingredientes.append(
                IngredienteEnProducto(
                    id=ing.id,
                    nombre=ing.nombre,
                    unidad=ing.unidad,
                    cantidad=pi.cantidad,
                )
            )

    return ProductoRead(
        id=p.id,
        nombre=p.nombre,
        precio=p.precio,
        descripcion=p.descripcion,
        categorias=categorias,
        ingredientes=ingredientes,
    )


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[ProductoRead]:
    uow = UnitOfWork(session)
    productos = uow.productos.list(offset=offset, limit=limit)
    return [_build_read(p, session) for p in productos]


def get_by_id(session: Session, producto_id: int) -> ProductoRead:
    uow = UnitOfWork(session)
    p = uow.productos.get(producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )
    return _build_read(p, session)


def _validar_categorias(uow: UnitOfWork, categoria_ids: list[int]) -> None:
    """Valida que todas las categorías existan."""
    for cat_id in categoria_ids:
        if not uow.categorias.get(cat_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con id {cat_id} no encontrada",
            )


def _validar_ingredientes(uow: UnitOfWork, ingredientes: list) -> None:
    """Valida que todos los ingredientes existan."""
    for ing_input in ingredientes:
        if not uow.ingredientes.get(ing_input.ingrediente_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_input.ingrediente_id} no encontrado",
            )


def create(session: Session, data: ProductoCreate) -> ProductoRead:
    uow = UnitOfWork(session)

    _validar_categorias(uow, data.categoria_ids)
    _validar_ingredientes(uow, data.ingredientes)

    # Crear el producto base
    p = Producto(nombre=data.nombre, precio=data.precio, descripcion=data.descripcion)
    uow.productos.add(p)

    # Crear relaciones N:N con Categorías
    for cat_id in data.categoria_ids:
        uow.productos.add_categoria_rel(producto_id=p.id, categoria_id=cat_id)

    # Crear relaciones N:N con Ingredientes
    for ing_input in data.ingredientes:
        uow.productos.add_ingrediente_rel(
            producto_id=p.id,
            ingrediente_id=ing_input.ingrediente_id,
            cantidad=ing_input.cantidad,
        )

    uow.commit()
    session.refresh(p)
    return _build_read(p, session)


def update(session: Session, producto_id: int, data: ProductoUpdate) -> ProductoRead:
    uow = UnitOfWork(session)

    p = uow.productos.get(producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )

    # Actualizar campos básicos del producto
    campos_base = data.model_dump(exclude_unset=True, exclude={"categoria_ids", "ingredientes"})
    for key, val in campos_base.items():
        setattr(p, key, val)
    uow.productos.add(p)

    # Sincronizar categorías si se enviaron
    if data.categoria_ids is not None:
        _validar_categorias(uow, data.categoria_ids)
        uow.productos.clear_categorias_rel(producto_id)
        # Agregar las nuevas
        for cat_id in data.categoria_ids:
            uow.productos.add_categoria_rel(producto_id=producto_id, categoria_id=cat_id)

    # Sincronizar ingredientes si se enviaron
    if data.ingredientes is not None:
        _validar_ingredientes(uow, data.ingredientes)
        uow.productos.clear_ingredientes_rel(producto_id)
        # Agregar los nuevos
        for ing_input in data.ingredientes:
            uow.productos.add_ingrediente_rel(
                producto_id=producto_id,
                ingrediente_id=ing_input.ingrediente_id,
                cantidad=ing_input.cantidad,
            )

    uow.commit()
    session.refresh(p)
    return _build_read(p, session)


def delete(session: Session, producto_id: int) -> None:
    uow = UnitOfWork(session)
    p = uow.productos.get(producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )
    # El cascade "all, delete-orphan" en el modelo borra las junction tables
    uow.productos.delete(producto_id)
    uow.commit()
