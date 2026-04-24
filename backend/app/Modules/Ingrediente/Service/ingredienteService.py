from sqlmodel import Session
from fastapi import HTTPException, status

from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Ingrediente.Schema.ingredienteSchema import IngredienteCreate, IngredienteUpdate
from app.Core.unit_of_work import UnitOfWork


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[Ingrediente]:
    uow = UnitOfWork(session)
    return uow.ingredientes.list(offset=offset, limit=limit)


def get_by_id(session: Session, ing_id: int) -> Ingrediente:
    uow = UnitOfWork(session)
    ing = uow.ingredientes.get(ing_id)
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con id {ing_id} no encontrado",
        )
    return ing


def create(session: Session, data: IngredienteCreate) -> Ingrediente:
    uow = UnitOfWork(session)
    ing = Ingrediente.model_validate(data)
    uow.ingredientes.add(ing)
    uow.commit()
    session.refresh(ing)
    return ing


def update(session: Session, ing_id: int, data: IngredienteUpdate) -> Ingrediente:
    uow = UnitOfWork(session)
    ing = uow.ingredientes.get(ing_id)
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con id {ing_id} no encontrado",
        )
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(ing, key, val)
    uow.ingredientes.add(ing)
    uow.commit()
    session.refresh(ing)
    return ing


def delete(session: Session, ing_id: int) -> None:
    uow = UnitOfWork(session)
    ing = uow.ingredientes.get(ing_id)
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con id {ing_id} no encontrado",
        )
    uow.ingredientes.delete(ing_id)
    uow.commit()
