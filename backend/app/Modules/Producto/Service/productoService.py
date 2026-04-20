from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Schema.productoSchema import ProductoCreate, ProductoUpdate
from app.Core.unit_of_work import UnitOfWork


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[Producto]:
    return session.exec(select(Producto).offset(offset).limit(limit)).all()


def get_by_id(session: Session, producto_id: int) -> Producto:
    p = session.get(Producto, producto_id)
    if not p:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Producto con id {producto_id} no encontrado",
        )
    return p


def create(session: Session, data: ProductoCreate) -> Producto:
    uow = UnitOfWork(session)
    p = Producto.model_validate(data)
    session.add(p)
    uow.commit()
    session.refresh(p)
    return p


def update(session: Session, producto_id: int, data: ProductoUpdate) -> Producto:
    uow = UnitOfWork(session)
    p = get_by_id(session, producto_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(p, key, val)
    session.add(p)
    uow.commit()
    session.refresh(p)
    return p


def delete(session: Session, producto_id: int) -> None:
    uow = UnitOfWork(session)
    p = get_by_id(session, producto_id)
    session.delete(p)
    uow.commit()