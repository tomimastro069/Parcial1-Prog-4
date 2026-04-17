from fastapi import APIRouter, Depends, Query, status
from sqlmodel import Session
from typing import Annotated

from app.database import get_session
from app.schemas.producto import ProductoCreate, ProductoRead, ProductoUpdate
from app.services import producto_service

router = APIRouter(prefix="/productos", tags=["Productos"])


@router.get("/", response_model=list[ProductoRead])
def listar_productos(
    session: Session = Depends(get_session),
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return producto_service.get_all(session, offset, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(producto_id: int, session: Session = Depends(get_session)):
    return producto_service.get_by_id(session, producto_id)


@router.post("/", response_model=ProductoRead, status_code=status.HTTP_201_CREATED)
def crear_producto(data: ProductoCreate, session: Session = Depends(get_session)):
    return producto_service.create(session, data)


@router.patch("/{producto_id}", response_model=ProductoRead)
def editar_producto(
    producto_id: int, data: ProductoUpdate, session: Session = Depends(get_session)
):
    return producto_service.update(session, producto_id, data)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(producto_id: int, session: Session = Depends(get_session)):
    producto_service.delete(session, producto_id)