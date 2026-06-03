import math
from decimal import Decimal
from datetime import datetime, timezone
from fastapi import HTTPException, status
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Pedidos.Model.pedido import Pedido
from app.Modules.Pedidos.Model.detallePedido import DetallePedido
from app.Modules.Pedidos.Model.historialEstadoPedido import HistorialEstadoPedido
from app.Modules.Pedidos.pedidoSchema import (
    PedidoCreate, PedidoRead, DetallePedidoRead, 
    HistorialEstadoPedidoRead, PedidoUpdateEstado
)

class PedidoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def _build_read(self, p: Pedido) -> PedidoRead:
        detalles_read = [
            DetallePedidoRead(
                pedido_id=d.pedido_id,
                producto_id=d.producto_id,
                cantidad=d.cantidad,
                nombre_snapshot=d.nombre_snapshot,
                precio_snapshot=float(d.precio_snapshot),
                subtotal_snap=float(d.subtotal_snap),
                personalizacion=d.personalizacion,
                created_at=d.created_at
            ) for d in p.detalles
        ]
        
        historial_read = [
            HistorialEstadoPedidoRead(
                id=h.id,
                pedido_id=h.pedido_id,
                estado_desde=h.estado_desde,
                estado_hacia=h.estado_hacia,
                usuario_id=h.usuario_id,
                motivo=h.motivo,
                created_at=h.created_at
            ) for h in p.historial
        ]
        
        # Sort historial desc for convenience maybe, or leave as is
        historial_read.sort(key=lambda x: x.created_at)
        
        return PedidoRead(
            id=p.id,
            usuario_id=p.usuario_id,
            direccion_id=p.direccion_id,
            estado_codigo=p.estado_codigo,
            forma_pago_codigo=p.forma_pago_codigo,
            subtotal=float(p.subtotal),
            descuento=float(p.descuento),
            costo_envio=float(p.costo_envio),
            total=float(p.total),
            notas=p.notas,
            created_at=p.created_at,
            updated_at=p.updated_at,
            detalles=detalles_read,
            historial=historial_read
        )

    def get_all_paginated(self, page: int = 1, size: int = 12, estado_codigo: str | None = None, pedido_id: int | None = None) -> dict:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)

            pedidos, total = self.uow.pedidos.get_all_admin(
                offset=offset,
                limit=size,
                estado_codigo=estado_codigo,
                pedido_id=pedido_id
            )

            items = []
            for p in pedidos:
                ped_full = self.uow.pedidos.get_with_relations(p.id)
                if ped_full:
                    items.append(self._build_read(ped_full))

            return {
                "items": items,
                "total": total,
                "page": page,
                "size": size,
                "pages": max(1, math.ceil(total / size)),
            }
            
    def get_user_pedidos(self, usuario_id: int, page: int = 1, size: int = 12) -> dict:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            
            pedidos, total = self.uow.pedidos.get_user_orders(usuario_id=usuario_id, offset=offset, limit=size)
            
            return {
                "items": [self._build_read(p) for p in pedidos],
                "total": total,
                "page": page,
                "size": size,
                "pages": max(1, math.ceil(total / size)),
            }

    def get_by_id(self, pedido_id: int, usuario_id: int = None, admin: bool = False) -> PedidoRead:
        with self.uow:
            p = self.uow.pedidos.get_with_relations(pedido_id)
            if not p or p.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pedido {pedido_id} no encontrado",
                )
            if not admin and p.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para ver este pedido",
                )
            return self._build_read(p)

    def create(self, data: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow:
            if not data.detalles:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Un pedido no puede crearse sin detalles."
                )
                
            estado_pendiente = self.uow.estado_pedidos.get_by_codigo("PENDIENTE")
            if not estado_pendiente:
                raise HTTPException(
                    status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                    detail="El estado PENDIENTE no existe en la base de datos."
                )

            if data.direccion_id is not None:
                direccion = self.uow.direcciones.get(data.direccion_id)
                if not direccion or direccion.usuario_id != usuario_id or direccion.deleted_at is not None:
                     raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="La dirección de entrega no es válida o no pertenece al usuario."
                    )
                 
            forma_pago = self.uow.pagos.get_by_codigo(data.forma_pago_codigo)
            if not forma_pago or not forma_pago.habilitado:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="La forma de pago no es válida."
                )

            subtotal_total = Decimal("0.00")
            
            costo_envio_db = self.uow.ajustes.get_by_clave("costo_envio")
            costo_envio_val = Decimal(costo_envio_db.valor) if costo_envio_db else Decimal("50.00")

            p = Pedido(
                usuario_id=usuario_id,
                direccion_id=data.direccion_id,
                forma_pago_codigo=forma_pago.codigo,
                estado_codigo=estado_pendiente.codigo,
                subtotal=subtotal_total,
                total=subtotal_total,
                costo_envio=costo_envio_val,
                descuento=Decimal("0.00"),
                notas=data.notas
            )
            self.uow.pedidos.add(p)

            # Obtener índice de ganancia una sola vez
            ajuste_indice = self.uow.ajustes.get_by_clave("indice_ganancia")
            try:
                indice_ganancia = float(ajuste_indice.valor) if ajuste_indice else 1.5
            except (ValueError, AttributeError):
                indice_ganancia = 1.5

            for det in data.detalles:
                producto = self.uow.productos.get(det.producto_id)
                if not producto or not producto.is_active or not producto.disponible:
                     raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail=f"El producto con ID {det.producto_id} no es válido o no está disponible."
                    )

                # Calcular precio real igual que ProductoService._calcular_precio
                pis = self.uow.productos.list_ingredientes_rel(producto.id)

                if producto.es_terminado:
                    precio_unitario = Decimal(str(round(float(producto.precio_base) * indice_ganancia, 2)))
                    # Descontar stock del producto terminado
                    if producto.stock_cantidad < det.cantidad:
                        raise HTTPException(
                            status_code=status.HTTP_400_BAD_REQUEST,
                            detail=f"Stock insuficiente para '{producto.nombre}'"
                        )
                    producto.stock_cantidad -= det.cantidad
                else:
                    costo_total = 0.0
                    for pi in pis:
                        ing = self.uow.ingredientes.get(pi.ingrediente_id)
                        if ing:
                            costo_total += float(ing.precio_unitario) * float(pi.cantidad)
                    precio_unitario = Decimal(str(round(costo_total * indice_ganancia, 2)))

                    # Validar y descontar stock de ingredientes
                    for pi in pis:
                        ing = self.uow.ingredientes.get(pi.ingrediente_id)
                        if not ing:
                            continue
                        consumo = float(pi.cantidad) * det.cantidad
                        if ing.stock_actual < consumo:
                            raise HTTPException(
                                status_code=status.HTTP_400_BAD_REQUEST,
                                detail=f"Stock insuficiente del ingrediente '{ing.nombre}' para '{producto.nombre}'"
                            )
                        ing.stock_actual = round(ing.stock_actual - consumo, 6)

                subtotal_detalle = precio_unitario * det.cantidad
                subtotal_total += subtotal_detalle
                
                detalle_db = DetallePedido(
                    pedido_id=p.id,
                    producto_id=producto.id,
                    cantidad=det.cantidad,
                    precio_snapshot=precio_unitario,
                    nombre_snapshot=producto.nombre,
                    subtotal_snap=subtotal_detalle,
                    personalizacion=det.personalizacion
                )
                self.uow.session.add(detalle_db)
            
            p.subtotal = subtotal_total
            p.total = p.subtotal - p.descuento + p.costo_envio
            
            self.uow.session.flush() # Para asegurar IDs

            # Historial (append-only) (RN-02: estado_desde NULL indica creacion)
            historial = HistorialEstadoPedido(
                pedido_id=p.id,
                estado_desde=None,
                estado_hacia=estado_pendiente.codigo,
                usuario_id=usuario_id,
                motivo="Creación del pedido"
            )
            self.uow.session.add(historial)
            self.uow.session.flush()

            p_full = self.uow.pedidos.get_with_relations(p.id)
            return self._build_read(p_full)

    def cambiar_estado(self, pedido_id: int, data: PedidoUpdateEstado, admin: bool = True, usuario_id: int = None) -> PedidoRead:
        with self.uow:
            p = self.uow.pedidos.get_with_relations(pedido_id)
            if not p or p.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Pedido {pedido_id} no encontrado",
                )
                
            nuevo_estado = self.uow.estado_pedidos.get_by_codigo(data.nuevo_estado_codigo)
            if not nuevo_estado:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El nuevo estado no es válido."
                )

            # Validar que si cancela y es por admin, se pida motivo. El FSM lo manejamos:
            if p.estado.es_terminal:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail=f"El pedido no puede cambiar de estado porque ya está en estado terminal {p.estado.codigo}."
                )
                
            if nuevo_estado.codigo == "CANCELADO" and not data.motivo:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="El motivo es obligatorio para cancelar un pedido."
                )

            estado_desde_codigo = p.estado.codigo
            estado_desde_orden = p.estado.orden  # orden del estado actual antes de cancelar

            # ── Rollback de stock al cancelar ───────────────────────────────
            if nuevo_estado.codigo == "CANCELADO":
                # Estados con orden < 4 (EN_CAMINO=4): aún no salió, se devuelve todo
                # Estados con orden >= 4: ya salió, solo se devuelven terminados
                antes_de_camino = estado_desde_orden < 4

                for detalle in p.detalles:
                    producto = self.uow.productos.get(detalle.producto_id)
                    if not producto:
                        continue

                    if producto.es_terminado:
                        # Terminados: siempre se devuelve stock
                        producto.stock_cantidad += detalle.cantidad

                    elif antes_de_camino:
                        # Elaborados: solo si aún no salió a repartir
                        pis = self.uow.productos.list_ingredientes_rel(producto.id)
                        for pi in pis:
                            ing = self.uow.ingredientes.get(pi.ingrediente_id)
                            if ing:
                                ing.stock_actual = round(
                                    ing.stock_actual + float(pi.cantidad) * detalle.cantidad, 6
                                )
            # ────────────────────────────────────────────────────────────────

            p.estado_codigo = nuevo_estado.codigo
            p.updated_at = datetime.now(timezone.utc)

            historial = HistorialEstadoPedido(
                pedido_id=p.id,
                estado_desde=estado_desde_codigo,
                estado_hacia=nuevo_estado.codigo,
                usuario_id=usuario_id,
                motivo=data.motivo
            )
            self.uow.session.add(historial)
            self.uow.session.flush()

            p_full = self.uow.pedidos.get_with_relations(p.id)
            return self._build_read(p_full)
