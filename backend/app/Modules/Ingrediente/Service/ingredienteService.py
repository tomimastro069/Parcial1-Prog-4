from sqlmodel import Session
from fastapi import HTTPException, status

from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Ingrediente.Schema.ingredienteSchema import IngredienteCreate, IngredienteUpdate
from app.Core.UnitOfWork.unit_of_work import UnitOfWork


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[Ingrediente]:
    with UnitOfWork(session) as uow:
        return uow.ingredientes.filter_by(is_active=True, offset=offset, limit=limit)


def get_by_id(session: Session, ing_id: int) -> Ingrediente:
    with UnitOfWork(session) as uow:
        ing = uow.ingredientes.get(ing_id)
        if not ing or not ing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_id} no encontrado",
            )
        return ing


def create(session: Session, data: IngredienteCreate) -> Ingrediente:
    with UnitOfWork(session) as uow:
        ing = Ingrediente.model_validate(data)
        uow.ingredientes.add(ing)
        session.refresh(ing)  # adentro del with
        return ing             #  adentro del with


def update(session: Session, ing_id: int, data: IngredienteUpdate) -> Ingrediente:
    with UnitOfWork(session) as uow:
        ing = uow.ingredientes.get(ing_id)
        if not ing or not ing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_id} no encontrado",
            )
        for key, val in data.model_dump(exclude_unset=True).items():
            setattr(ing, key, val)
        # eliminado uow.ingredientes.add(ing), solo setattr es suficiente
        session.refresh(ing)  # adentro del with
        return ing             # adentro del with


def delete(session: Session, ing_id: int) -> None:
    with UnitOfWork(session) as uow:
        ing = uow.ingredientes.get(ing_id)
        if not ing or not ing.is_active:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"Ingrediente con id {ing_id} no encontrado",
            )
        # Borrado físico de tablas intermedias
        uow.ingredientes.clear_productos_rel(ing_id)
        # Borrado lógico del producto
        ing.is_active = False
        session.flush()