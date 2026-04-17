from sqlmodel import Session, select
from fastapi import HTTPException, status

from app.models.ingrediente import Ingrediente
from app.schemas.ingrediente import IngredienteCreate, IngredienteUpdate
from app.uow import UnitOfWork


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[Ingrediente]:
    return session.exec(select(Ingrediente).offset(offset).limit(limit)).all()


def get_by_id(session: Session, ing_id: int) -> Ingrediente:
    ing = session.get(Ingrediente, ing_id)
    if not ing:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Ingrediente con id {ing_id} no encontrado",
        )
    return ing


def create(session: Session, data: IngredienteCreate) -> Ingrediente:
    uow = UnitOfWork(session)
    ing = Ingrediente.model_validate(data)
    session.add(ing)
    uow.commit()
    uow.refresh(ing)
    return ing


def update(session: Session, ing_id: int, data: IngredienteUpdate) -> Ingrediente:
    uow = UnitOfWork(session)
    ing = get_by_id(session, ing_id)
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(ing, key, val)
    session.add(ing)
    uow.commit()
    uow.refresh(ing)
    return ing


def delete(session: Session, ing_id: int) -> None:
    uow = UnitOfWork(session)
    ing = get_by_id(session, ing_id)
    session.delete(ing)
    uow.commit()