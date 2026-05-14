from fastapi import APIRouter, Depends, Path, Query, status
from typing import Annotated, Optional

from app.Modules.Producto.productoSchema import ProductoCreate, ProductoRead, ProductoUpdate
from app.Modules.Producto.productoService import ProductoService
from app.Core.Dependencies.dependencies import role_required, get_uow
from app.Modules.Usuarios.usuario import UserRole, Usuario
from app.Core.Schema.pagination import PaginatedResponse

router = APIRouter()


@router.get("", response_model=PaginatedResponse[ProductoRead])
def listar_productos(
    uow=Depends(get_uow),
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=100)] = 10,
    search: Annotated[str | None, Query()] = None,
    categoria_id: Annotated[int | None, Query()] = None,
    is_active: Annotated[bool | None, Query()] = None,
):
    service = ProductoService(uow)
    return service.get_all_paginated(page=page, size=size, search=search, categoria_id=categoria_id, is_active=is_active)


@router.get("/{producto_id}", response_model=ProductoRead)
def obtener_producto(
    producto_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
):
    service = ProductoService(uow)
    return service.get_by_id(producto_id)


@router.post("", 
             response_model=ProductoRead, 
             status_code=status.HTTP_201_CREATED)
def crear_producto(
    data: ProductoCreate, 
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = ProductoService(uow)
    return service.create(data, current_user.id)


@router.patch("/{producto_id}", response_model=ProductoRead)
def editar_producto(
    producto_id: Annotated[int, Path(gt=0)],
    data: ProductoUpdate,
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = ProductoService(uow)
    return service.update(producto_id, data, current_user.id)


@router.patch("/{producto_id}/activar", response_model=ProductoRead)
def activar_producto(
    producto_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = ProductoService(uow)
    return service.activar(producto_id, current_user.id)


@router.delete("/{producto_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_producto(
    producto_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = ProductoService(uow)
    service.delete(producto_id, current_user.id)
