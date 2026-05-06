from fastapi import APIRouter, Depends, Path, Query, status
from sqlmodel import Session
from typing import Annotated

from app.Core.database import get_session
from app.Modules.Producto.Schema.productoSchema import ProductoCreate, ProductoRead, ProductoUpdate
from app.Modules.Producto.Service import productoService as producto_service
from app.Core.Dependencies.dependencies import role_required
from app.Modules.Usuarios.usuario import UserRole

router = APIRouter()


@router.get("/", response_model=list[ProductoRead])
def listar_productos(
    session: Session = Depends(get_session),
    offset: Annotated[int, Query(ge=0)] = 0,
    limit: Annotated[int, Query(ge=1, le=100)] = 10,
):
    return producto_service.get_all(session, offset, limit)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: Annotated[int, Path(gt=0)],
    session: Session = Depends(get_session),
):
    return producto_service.get_by_id(session, producto_id)


@router.post("/", 
             response_model=ProductoRead, 
             status_code=status.HTTP_201_CREATED,
             dependencies=[Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))])
def crear_producto(data: ProductoCreate, session: Session = Depends(get_session)):
    return producto_service.create(session, data)


@router.patch("/{producto_id}", 
              response_model=ProductoRead,
              dependencies=[Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))])
def editar_producto(
    producto_id: Annotated[int, Path(gt=0)],
    data: ProductoUpdate,
    session: Session = Depends(get_session),
):
    return producto_service.update(session, producto_id, data)


@router.delete("/{producto_id}", 
               status_code=status.HTTP_204_NO_CONTENT,
               dependencies=[Depends(role_required([UserRole.ADMIN]))])
def eliminar_producto(
    producto_id: Annotated[int, Path(gt=0)],
    session: Session = Depends(get_session),
):
    producto_service.delete(session, producto_id)
