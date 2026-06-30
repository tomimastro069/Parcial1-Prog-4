from fastapi import APIRouter, Depends, Query, BackgroundTasks, status
from fastapi.responses import RedirectResponse
from typing import Annotated
from app.Core.Security.deps import get_uow, get_current_active_user
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario
from app.Modules.MercadoPago.mercadoPagoSchema import PreferenciaRequest, PreferenciaResponse
from app.Modules.MercadoPago.mercadoPagoService import MercadoPagoService
from app.Core.Config.Config import settings
from fastapi import Request

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
async def webhook(
    request: Request,
    background_tasks: BackgroundTasks,
    service: Annotated[MercadoPagoService, Depends(get_mp_service)],
    id: str | None = Query(None),
    topic: str | None = Query(None),
    type: str | None = Query(None),
):
    payload = await request.json()

    payment_id = (
        id
        if topic == "payment"
        else payload.get("data", {}).get("id")
        or payload.get("id")
    )

    if payment_id:
        background_tasks.add_task(service.procesar_webhook, payment_id)

    return {"status": "received"}

@router.get("/success")
def success(
    service: Annotated[MercadoPagoService, Depends(get_mp_service)],
    payment_id: str | None = Query(None),
    collection_id: str | None = Query(None),
    external_reference: str | None = Query(None),
    status: str | None = Query(None),
):
    mp_payment_id = payment_id or collection_id
    if mp_payment_id:
        try:
            service.procesar_webhook(mp_payment_id)
        except Exception:
            pass

    frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
    return RedirectResponse(url=f"{frontend_url}/checkout/success?status=approved")

@router.get("/failure")
def failure():
    frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
    return RedirectResponse(url=f"{frontend_url}/checkout/failure?status=rejected")

@router.get("/pending")
def pending():
    frontend_url = settings.FRONTEND_URL or "http://localhost:5173"
    return RedirectResponse(url=f"{frontend_url}/checkout/pending?status=pending")
