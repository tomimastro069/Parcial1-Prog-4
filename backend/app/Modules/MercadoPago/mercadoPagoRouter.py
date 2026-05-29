from fastapi import APIRouter, Depends, Query, BackgroundTasks, status
from fastapi.responses import RedirectResponse
from typing import Annotated
from app.Core.Security.deps import get_uow, get_current_active_user
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario
from app.Modules.MercadoPago.mercadoPagoSchema import PreferenciaRequest, PreferenciaResponse
from app.Modules.MercadoPago.mercadoPagoService import MercadoPagoService

router = APIRouter()

def get_mp_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> MercadoPagoService:
    return MercadoPagoService(uow)

@router.post("/crear-preferencia", response_model=PreferenciaResponse)
def crear_preferencia(
    body: PreferenciaRequest,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[MercadoPagoService, Depends(get_mp_service)]
):
    """
    Crea una preferencia de pago en Mercado Pago para un pedido PENDIENTE
    con forma de pago MERCADOPAGO.
    """
    res = service.crear_preferencia(pedido_id=body.pedido_id, usuario_id=current_user.id)
    return res

@router.post("/webhook", status_code=status.HTTP_200_OK)
def webhook(
    background_tasks: BackgroundTasks,
    service: Annotated[MercadoPagoService, Depends(get_mp_service)],
    data: dict = Query(None),
    id: str | None = Query(None),
    topic: str | None = Query(None)
):
    """
    Webhook público para notificaciones instantáneas de Mercado Pago (IPN / Webhook).
    """
    payment_id = None
    if id and topic == "payment":
        payment_id = id
    elif data and data.get("id"):
        payment_id = data.get("id")
    
    if payment_id:
        background_tasks.add_task(service.procesar_webhook, payment_id)

    return {"status": "received"}

@router.get("/success")
def success():
    # Redirigir al checkout/success o mis pedidos en el frontend
    return RedirectResponse(url="http://localhost:5173/checkout/success?status=approved")

@router.get("/failure")
def failure():
    return RedirectResponse(url="http://localhost:5173/checkout/failure?status=rejected")

@router.get("/pending")
def pending():
    return RedirectResponse(url="http://localhost:5173/checkout/pending?status=pending")
