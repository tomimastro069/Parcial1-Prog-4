import math
from fastapi import APIRouter, Depends
from typing import Annotated
from sqlmodel import select, desc
from sqlmodel import func as sqlfunc
from app.Core.Security.deps import require_role, get_uow
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import UserRole, Usuario
from app.Modules.Pagos.Model.Pagos import Pagos

router = APIRouter()

@router.get("/", dependencies=[Depends(require_role([UserRole.ADMIN, UserRole.PEDIDOS]))])
def listar_pagos(
    uow: Annotated[UnitOfWork, Depends(get_uow)],
    page: int = 1,
    size: int = 15,
    usuario_id: int | None = None,
    pedido_id: int | None = None,
):
    with uow:
        offset = max(0, (page - 1) * size)
        stmt = select(Pagos)
        if usuario_id is not None:
            stmt = stmt.where(Pagos.usuario_id == usuario_id)
        if pedido_id is not None:
            stmt = stmt.where(Pagos.pedido_id == pedido_id)
        total = uow.session.exec(select(sqlfunc.count()).select_from(stmt.subquery())).one()
        stmt = stmt.order_by(desc(Pagos.id))
        items = uow.session.exec(stmt.offset(offset).limit(size)).all()

        # traer usuarios de una sola consulta
        usuario_ids = [p.usuario_id for p in items if p.usuario_id]
        usuarios = {}
        if usuario_ids:
            for u in uow.session.exec(select(Usuario).where(Usuario.id.in_(usuario_ids))).all():
                usuarios[u.id] = u

        return {
            "items": [
                {
                    "id": p.id,
                    "pedido_id": p.pedido_id,
                    "usuario_id": p.usuario_id,
                    "usuario_nombre": f"{usuarios[p.usuario_id].nombre} {usuarios[p.usuario_id].apellido}" if p.usuario_id and p.usuario_id in usuarios else None,
                    "usuario_email": usuarios[p.usuario_id].email if p.usuario_id and p.usuario_id in usuarios else None,
                    "payment_id": p.payment_id,
                    "status": p.status,
                    "mp_status_detail": p.mp_status_detail,
                    "external_reference": p.external_reference,
                    "amount": float(p.amount),
                    "payment_method_id": p.payment_method_id,
                    "created_at": p.created_at,
                    "updated_at": p.updated_at,
                }
                for p in items
            ],
            "total": total,
            "page": page,
            "size": size,
            "pages": max(1, math.ceil(total / size)),
        }
