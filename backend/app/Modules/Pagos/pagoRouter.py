from fastapi import APIRouter, Depends
from typing import Annotated

from app.Core.Security.deps import get_uow, get_current_active_user
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario

from app.Modules.Pagos.pagoSchema import FormaPagoRead
from app.Modules.Pagos.pagoService import PagoService

router = APIRouter()

def get_pago_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> PagoService:
    return PagoService(uow)

@router.get("/", response_model=list[FormaPagoRead])
def get_formas_pago(
    service: Annotated[PagoService, Depends(get_pago_service)],
    current_user: Annotated[Usuario, Depends(get_current_active_user)] # Protegido con auth actual
):
    """
    Lista de formas de pago disponibles (Efectivo, Tarjeta, etc)
    """
    return service.get_all()
