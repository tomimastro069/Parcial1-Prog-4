from fastapi import APIRouter, Depends, status
from typing import Annotated

from app.Core.Security.deps import get_current_active_user, require_role, get_uow
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario, UserRole

from app.Modules.Pedidos.pedidoSchema import (
    PedidoCreate, PedidoRead, PedidoUpdateEstado, 
    PaginatedPedidoResponse, EstadoPedidoRead
)
from app.Modules.Pedidos.pedidoService import PedidoService
from app.Modules.Pagos.pagoService import EstadoPedidoService

router = APIRouter()

def get_pedido_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> PedidoService:
    return PedidoService(uow)

def get_estado_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> EstadoPedidoService:
    return EstadoPedidoService(uow)


@router.get("/estados", response_model=list[EstadoPedidoRead])
def get_estados_pedido(
    service: Annotated[EstadoPedidoService, Depends(get_estado_service)],
    current_user: Annotated[Usuario, Depends(get_current_active_user)]
):
    """Obtener listado de estados de pedido posibles"""
    return service.get_all()


@router.get("/", response_model=PaginatedPedidoResponse)
def get_pedidos(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    page: int = 1,
    size: int = 12,
    estado: str | None = None
):
    """
    Retorna pedidos.
    Si el usuario es ADMIN o PEDIDOS, puede ver todos.
    Si es CLIENT, solo ve sus propios pedidos.
    Opcionalmente filtra por estado_codigo.
    """
    if current_user.rol in [UserRole.ADMIN, UserRole.PEDIDOS]:
        return service.get_all_paginated(page=page, size=size, estado_codigo=estado)
    else:
        return service.get_user_pedidos(current_user.id, page=page, size=size)

@router.get("/mis-pedidos", response_model=PaginatedPedidoResponse)
def get_mis_pedidos(
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)],
    page: int = 1,
    size: int = 12
):
    """Alias endpoint for client-specific pedidos."""
    return service.get_user_pedidos(current_user.id, page=page, size=size)


@router.get("/{pedido_id}", response_model=PedidoRead)
def get_pedido(
    pedido_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)]
):
    is_admin = current_user.rol in [UserRole.ADMIN, UserRole.PEDIDOS]
    return service.get_by_id(pedido_id, usuario_id=current_user.id, admin=is_admin)


@router.post("/", response_model=PedidoRead, status_code=status.HTTP_201_CREATED)
def create_pedido(
    data: PedidoCreate,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[PedidoService, Depends(get_pedido_service)]
):
    return service.create(data, current_user.id)


@router.patch("/{pedido_id}/estado", response_model=PedidoRead, dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.PEDIDOS]))])
def cambiar_estado_pedido(
    pedido_id: int,
    data: PedidoUpdateEstado,
    service: Annotated[PedidoService, Depends(get_pedido_service)]
):
    """
    Cambiar el estado de un pedido (Sólo ADMIN o PEDIDOS).
    """
    return service.cambiar_estado(pedido_id, data, admin=True)
