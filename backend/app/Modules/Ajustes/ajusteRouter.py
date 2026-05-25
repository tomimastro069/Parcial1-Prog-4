from fastapi import APIRouter, Depends, status
from typing import Annotated

from app.Core.Security.deps import get_uow, require_role as role_required
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import UserRole, Usuario

from app.Modules.Ajustes.ajusteSchema import AjusteRead, AjusteUpdate
from app.Modules.Ajustes.ajusteService import AjusteService

router = APIRouter()

def get_ajuste_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> AjusteService:
    return AjusteService(uow)

@router.get("/{clave}", response_model=AjusteRead)
def obtener_ajuste(
    clave: str,
    service: Annotated[AjusteService, Depends(get_ajuste_service)],
):
    """
    Obtiene un ajuste por su clave.
    """
    return service.get_by_clave(clave)

@router.patch("/{clave}", response_model=AjusteRead)
def actualizar_ajuste(
    clave: str,
    data: AjusteUpdate,
    service: Annotated[AjusteService, Depends(get_ajuste_service)],
    current_user: Annotated[Usuario, Depends(role_required([UserRole.ADMIN]))],
):
    """
    Actualiza un ajuste por su clave (Solo Administradores).
    """
    return service.update(clave, data, current_user.id)
