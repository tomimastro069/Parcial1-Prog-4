from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session
from typing import Annotated

from app.Core.database import get_session
from app.Modules.Ingrediente.Schema.ingredienteSchema import IngredienteCreate, IngredienteRead, IngredienteUpdate
from app.Modules.Ingrediente.Service import ingredienteService as ingrediente_service

router = APIRouter()


@router.get("/", response_model=list[IngredienteRead])
def listar_ingredientes(
    session: Session = Depends(get_session),
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return ingrediente_service.get_all(session, offset, limit)


@router.get("/{ing_id}", response_model=IngredienteRead)
def obtener_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    session: Session = Depends(get_session),
):
    return ingrediente_service.get_by_id(session, ing_id)


@router.post("/", response_model=IngredienteRead, status_code=status.HTTP_201_CREATED)
def crear_ingrediente(data: IngredienteCreate, session: Session = Depends(get_session)):
    return ingrediente_service.create(session, data)


@router.patch("/{ing_id}", response_model=IngredienteRead)
def editar_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    data: IngredienteUpdate,
    session: Session = Depends(get_session),
):
    return ingrediente_service.update(session, ing_id, data)


@router.delete("/{ing_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    session: Session = Depends(get_session),
):
    ingrediente_service.delete(session, ing_id)
