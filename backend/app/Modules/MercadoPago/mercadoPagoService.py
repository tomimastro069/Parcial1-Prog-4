from decimal import Decimal
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Pagos.Model.Pagos import Pagos
from app.Modules.Pagos.Model.PaymentStatus import PaymentStatus
from app.Modules.Pedidos.Model.historialEstadoPedido import HistorialEstadoPedido
from app.Core.mercadopago import sdk
from app.Core.helper import get_ngrok_url
from app.Core.Config.Config import settings

class MercadoPagoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def crear_preferencia(self, pedido_id: int, usuario_id: int) -> dict:
        with self.uow:
            pedido = self.uow.pedidos.get_with_relations(pedido_id)
            if not pedido or pedido.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pedido {pedido_id} no encontrado"
                )
            
            if pedido.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para pagar este pedido"
                )

            if pedido.forma_pago_codigo != "MERCADOPAGO":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La forma de pago de este pedido no es MERCADOPAGO"
                )

            if pedido.estado_codigo != "PENDIENTE":
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El pedido ya no está PENDIENTE (estado actual: {pedido.estado_codigo})"
                )

            # Armar la preferencia con Mercado Pago
            ngrok_url = get_ngrok_url()
            base_url = ngrok_url if ngrok_url else "http://localhost:8000"

            preference_data = {
                "items": [
                    {
                        "title": f"Pedido #{pedido.id} - Food Store",
                        "quantity": 1,
                        "unit_price": float(pedido.total),
                        "currency_id": "ARS"
                    }
                ],
                "back_urls": {
                    "success": f"{base_url}/api/v1/mercadopago/success",
                    "failure": f"{base_url}/api/v1/mercadopago/failure",
                    "pending": f"{base_url}/api/v1/mercadopago/pending"
                },
                "auto_return": "approved",
                "notification_url": f"{base_url}/api/v1/mercadopago/webhook",
                "external_reference": str(pedido.id)
            }

            try:
                preference_response = sdk.preference().create(preference_data)
                preference = preference_response["response"]
                return {
                    "preference_id": preference["id"],
                    "init_point": preference["init_point"]
                }
            except Exception as e:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail=f"Error al crear preferencia en Mercado Pago: {str(e)}"
                )

    def procesar_webhook(self, payment_id: str) -> None:
        try:
            payment_info = sdk.payment().get(payment_id)
            if payment_info.get("status") != 200:
                return
            payment_data = payment_info.get("response", {})
        except Exception:
            return  # Fail silently to webhook or handle gracefully

        status_mp = payment_data.get("status")
        external_reference = payment_data.get("external_reference")
        amount = payment_data.get("transaction_amount")

        if not external_reference or not external_reference.isdigit():
            return

        pedido_id = int(external_reference)

        # Mapeamos el estado
        payment_status = PaymentStatus.pending
        if status_mp == "approved":
            payment_status = PaymentStatus.success
        elif status_mp in ["rejected", "cancelled"]:
            payment_status = PaymentStatus.failure

        with self.uow:
            pedido = self.uow.pedidos.get(pedido_id)
            if not pedido or pedido.deleted_at is not None:
                return

            # Registrar/Actualizar el pago
            pago_existente = self.uow.mercadopago_pagos.get_by_payment_id(payment_id)
            if pago_existente:
                pago_existente.status = payment_status
                pago_existente.updated_at = datetime.now(timezone.utc)
            else:
                nuevo_pago = Pagos(
                    payment_id=payment_id,
                    status=payment_status,
                    amount=Decimal(str(amount)),
                    pedido_id=pedido_id,
                    usuario_id=pedido.usuario_id
                )
                self.uow.mercadopago_pagos.add(nuevo_pago)

            # Si el pago es exitoso y el pedido está pendiente, lo confirmamos
            if payment_status == PaymentStatus.success and pedido.estado_codigo == "PENDIENTE":
                estado_confirmado = self.uow.estado_pedidos.get_by_codigo("CONFIRMADO")
                if estado_confirmado:
                    estado_anterior = pedido.estado_codigo
                    pedido.estado_codigo = estado_confirmado.codigo
                    pedido.updated_at = datetime.now(timezone.utc)

                    historial = HistorialEstadoPedido(
                        pedido_id=pedido.id,
                        estado_desde=estado_anterior,
                        estado_hacia=estado_confirmado.codigo,
                        usuario_id=pedido.usuario_id,
                        motivo="Pago aprobado vía Mercado Pago"
                    )
                    self.uow.session.add(historial)
            
            self.uow.commit()
