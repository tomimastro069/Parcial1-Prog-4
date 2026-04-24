from sqlmodel import Session
from fastapi import HTTPException, status

from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Categoria.Schema.categoriaSchema import CategoriaCreate, CategoriaUpdate
from app.Core.unit_of_work import UnitOfWork


def get_all(session: Session, offset: int = 0, limit: int = 10) -> list[Categoria]:
    uow = UnitOfWork(session)
    return uow.categorias.list(offset=offset, limit=limit)


def get_by_id(session: Session, categoria_id: int) -> Categoria:
    uow = UnitOfWork(session)
    cat = uow.categorias.get(categoria_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con id {categoria_id} no encontrada",
        )
    return cat


def create(session: Session, data: CategoriaCreate) -> Categoria:
    uow = UnitOfWork(session)
    existing = uow.categorias.first_by(nombre=data.nombre)
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Una categoría con el mismo nombre ya existe",
        )
    cat = Categoria.model_validate(data)
    uow.categorias.add(cat)
    uow.commit()
    session.refresh(cat)
    return cat


def update(session: Session, categoria_id: int, data: CategoriaUpdate) -> Categoria:
    uow = UnitOfWork(session)
    cat = uow.categorias.get(categoria_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con id {categoria_id} no encontrada",
        )
    for key, val in data.model_dump(exclude_unset=True).items():
        setattr(cat, key, val)
    uow.categorias.add(cat)
    uow.commit()
    session.refresh(cat)
    return cat


def delete(session: Session, categoria_id: int) -> None:
    uow = UnitOfWork(session)
    cat = uow.categorias.get(categoria_id)
    if not cat:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Categoría con id {categoria_id} no encontrada",
        )
    uow.categorias.delete(categoria_id)
    uow.commit()
