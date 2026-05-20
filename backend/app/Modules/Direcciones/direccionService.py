import math
from fastapi import HTTPException, status
from datetime import datetime, timezone
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Direcciones.Model.direccionEntrega import DireccionEntrega
from app.Modules.Direcciones.direccionSchema import DireccionEntregaCreate, DireccionEntregaUpdate, DireccionEntregaRead

class DireccionService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_user_direcciones(self, usuario_id: int) -> list[DireccionEntregaRead]:
        with self.uow:
            direcciones = self.uow.direcciones.filter_by(usuario_id=usuario_id, deleted_at=None)
            # Adapt to schema
            return [
                DireccionEntregaRead(
                    id=d.id,
                    usuario_id=d.usuario_id,
                    alias=d.alias,
                    linea1=d.linea1,
                    linea2=d.linea2,
                    ciudad=d.ciudad,
                    provincia=d.provincia,
                    codigo_postal=d.codigo_postal,
                    latitud=float(d.latitud) if d.latitud else None,
                    longitud=float(d.longitud) if d.longitud else None,
                    es_principal=d.es_principal,
                    is_active=(d.deleted_at is None)
                ) for d in direcciones
            ]

    def create(self, data: DireccionEntregaCreate, usuario_id: int) -> DireccionEntregaRead:
        with self.uow:
            if data.es_principal:
                self.uow.direcciones.desmarcar_principal_usuario(usuario_id)

            d = DireccionEntrega(
                usuario_id=usuario_id,
                alias=data.alias,
                linea1=data.linea1,
                linea2=data.linea2,
                ciudad=data.ciudad,
                provincia=data.provincia,
                codigo_postal=data.codigo_postal,
                latitud=data.latitud,
                longitud=data.longitud,
                es_principal=data.es_principal
            )
            self.uow.direcciones.add(d)
            
            return self.get_user_direcciones(usuario_id)[-1] # Para devolver con el schema correcto

    def update(self, direccion_id: int, data: DireccionEntregaUpdate, usuario_id: int) -> DireccionEntregaRead:
        with self.uow:
            d = self.uow.direcciones.get(direccion_id)
            if not d or d.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dirección con id {direccion_id} no encontrada",
                )
            if d.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para editar esta dirección",
                )

            if data.es_principal:
                self.uow.direcciones.desmarcar_principal_usuario(usuario_id)

            update_data = data.model_dump(exclude_unset=True)
            for key, val in update_data.items():
                setattr(d, key, val)

            d.updated_at = datetime.now(timezone.utc)
            self.uow.session.add(d)
            self.uow.session.flush()
            
            # Re-read para schema
            for dir_read in self.get_user_direcciones(usuario_id):
                if dir_read.id == d.id:
                    return dir_read

    def delete(self, direccion_id: int, usuario_id: int) -> None:
        with self.uow:
            d = self.uow.direcciones.get(direccion_id)
            if not d or d.deleted_at is not None:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Dirección con id {direccion_id} no encontrada",
                )
            if d.usuario_id != usuario_id:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail="No tienes permiso para eliminar esta dirección",
                )
            
            d.deleted_at = datetime.now(timezone.utc)
            d.updated_at = datetime.now(timezone.utc)
            self.uow.session.add(d)
