from fastapi import APIRouter, Depends, status
from typing import Annotated

from app.Core.Security.deps import get_current_active_user, get_uow
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario

from app.Modules.Direcciones.direccionSchema import (
    DireccionEntregaCreate, DireccionEntregaUpdate, 
    DireccionEntregaRead, PaginatedDireccionResponse
)
from app.Modules.Direcciones.direccionService import DireccionService

router = APIRouter()

def get_direccion_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> DireccionService:
    return DireccionService(uow)


@router.get("/", response_model=list[DireccionEntregaRead])
def get_user_direcciones(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[DireccionService, Depends(get_direccion_service)],
):
    return service.get_user_direcciones(current_user.id)


@router.post("/", response_model=DireccionEntregaRead, status_code=status.HTTP_201_CREATED)
def create_direccion(
    data: DireccionEntregaCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[DireccionService, Depends(get_direccion_service)],
):
    return service.create(data, current_user.id)


@router.put("/{direccion_id}", response_model=DireccionEntregaRead)
def update_direccion(
    direccion_id: int,
    data: DireccionEntregaUpdate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[DireccionService, Depends(get_direccion_service)],
):
    return service.update(direccion_id, data, current_user.id)


@router.delete("/{direccion_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_direccion(
    direccion_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[DireccionService, Depends(get_direccion_service)],
):
    service.delete(direccion_id, current_user.id)
