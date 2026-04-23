from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
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
    # Categorías relacionadas
    pcs = session.exec(
        select(ProductoCategoria).where(ProductoCategoria.producto_id == p.id)
    ).all()
    categorias = []
    for pc in pcs:
        cat = session.get(Categoria, pc.categoria_id)
        if cat:
            categorias.append(CategoriaEnProducto(id=cat.id, nombre=cat.nombre))

    # Ingredientes relacionados
    pis = session.exec(
        select(ProductoIngrediente).where(ProductoIngrediente.producto_id == p.id)
    ).all()
    ingredientes = []
    for pi in pis:
        ing = session.get(Ingrediente, pi.ingrediente_id)
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
    productos = session.exec(select(Producto).offset(offset).limit(limit)).all()
    return [_build_read(p, session) for p in productos]


def get_by_id(session: Session, producto_id: int) -> ProductoRead:
    p = session.get(Producto, producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )
    return _build_read(p, session)


def _validar_categorias(session: Session, categoria_ids: list[int]) -> None:
    """Valida que todas las categorías existan."""
    for cat_id in categoria_ids:
        if not session.get(Categoria, cat_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Categoría con id {cat_id} no encontrada",
            )


def _validar_ingredientes(session: Session, ingredientes: list) -> None:
    """Valida que todos los ingredientes existan."""
    for ing_input in ingredientes:
        if not session.get(Ingrediente, ing_input.ingrediente_id):
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_input.ingrediente_id} no encontrado",
            )


def create(session: Session, data: ProductoCreate) -> ProductoRead:
    uow = UnitOfWork(session)

    _validar_categorias(session, data.categoria_ids)
    _validar_ingredientes(session, data.ingredientes)

    # Crear el producto base
    p = Producto(nombre=data.nombre, precio=data.precio, descripcion=data.descripcion)
    session.add(p)
    session.flush()  # obtenemos el ID antes del commit

    # Crear relaciones N:N con Categorías
    for cat_id in data.categoria_ids:
        session.add(ProductoCategoria(producto_id=p.id, categoria_id=cat_id))

    # Crear relaciones N:N con Ingredientes
    for ing_input in data.ingredientes:
        session.add(
            ProductoIngrediente(
                producto_id=p.id,
                ingrediente_id=ing_input.ingrediente_id,
                cantidad=ing_input.cantidad,
            )
        )

    uow.commit()
    session.refresh(p)
    return _build_read(p, session)


def update(session: Session, producto_id: int, data: ProductoUpdate) -> ProductoRead:
    uow = UnitOfWork(session)

    p = session.get(Producto, producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )

    # Actualizar campos básicos del producto
    campos_base = data.model_dump(exclude_unset=True, exclude={"categoria_ids", "ingredientes"})
    for key, val in campos_base.items():
        setattr(p, key, val)
    session.add(p)

    # Sincronizar categorías si se enviaron
    if data.categoria_ids is not None:
        _validar_categorias(session, data.categoria_ids)
        # Borrar las relaciones existentes
        for pc in session.exec(
            select(ProductoCategoria).where(ProductoCategoria.producto_id == producto_id)
        ).all():
            session.delete(pc)
        session.flush()
        # Agregar las nuevas
        for cat_id in data.categoria_ids:
            session.add(ProductoCategoria(producto_id=producto_id, categoria_id=cat_id))

    # Sincronizar ingredientes si se enviaron
    if data.ingredientes is not None:
        _validar_ingredientes(session, data.ingredientes)
        # Borrar las relaciones existentes
        for pi in session.exec(
            select(ProductoIngrediente).where(ProductoIngrediente.producto_id == producto_id)
        ).all():
            session.delete(pi)
        session.flush()
        # Agregar los nuevos
        for ing_input in data.ingredientes:
            session.add(
                ProductoIngrediente(
                    producto_id=producto_id,
                    ingrediente_id=ing_input.ingrediente_id,
                    cantidad=ing_input.cantidad,
                )
            )

    uow.commit()
    session.refresh(p)
    return _build_read(p, session)


def delete(session: Session, producto_id: int) -> None:
    uow = UnitOfWork(session)
    p = session.get(Producto, producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )
    # El cascade "all, delete-orphan" en el modelo borra las junction tables
    session.delete(p)
    uow.commit()