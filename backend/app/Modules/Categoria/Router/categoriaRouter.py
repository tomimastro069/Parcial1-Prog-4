from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from typing import Annotated

from app.database import get_session
from app.schemas.categoria import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.services import categoria_service

router = APIRouter(prefix="/categorias", tags=["Categorías"])


@router.get("/", response_model=list[CategoriaRead])
def listar_categorias(
    session: Session = Depends(get_session),
    offset: Annotated[int, Query(ge=0, description="Desde qué registro")] = 0,
    limit: Annotated[int, Query(ge=1, le=100, description="Cuántos traer")] = 10,
):
    return categoria_service.get_all(session, offset, limit)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(categoria_id: int, session: Session = Depends(get_session)):
    return categoria_service.get_by_id(session, categoria_id)


@router.post("/", response_model=CategoriaRead, status_code=status.HTTP_201_CREATED)
def crear_categoria(data: CategoriaCreate, session: Session = Depends(get_session)):
    return categoria_service.create(session, data)


@router.patch("/{categoria_id}", response_model=CategoriaRead)
def editar_categoria(
    categoria_id: int, data: CategoriaUpdate, session: Session = Depends(get_session)
):
    return categoria_service.update(session, categoria_id, data)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(categoria_id: int, session: Session = Depends(get_session)):
    categoria_service.delete(session, categoria_id)