from fastapi import HTTPException, status
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Ingrediente.Schema.ingredienteSchema import IngredienteCreate, IngredienteUpdate
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Auditoria.Model.auditoria import Auditoria

class IngredienteService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, offset: int = 0, limit: int = 10) -> list[Ingrediente]:
        with self.uow:
            return self.uow.ingredientes.filter_by(is_active=True, offset=offset, limit=limit)

    def get_by_id(self, ing_id: int) -> Ingrediente:
        with self.uow:
            ing = self.uow.ingredientes.get(ing_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_id} no encontrado",
                )
            return ing

    def create(self, data: IngredienteCreate, user_id: int) -> Ingrediente:
        with self.uow:
            ing = Ingrediente.model_validate(data)
            self.uow.ingredientes.add(ing)
            
            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="INGREDIENTE_CREAR",
                modulo="INGREDIENTES",
                descripcion=f"Se creó el ingrediente: {ing.nombre}",
                metadata_info={"id": ing.id}
            ))
            
            return ing

    def update(self, ing_id: int, data: IngredienteUpdate, user_id: int) -> Ingrediente:
        with self.uow:
            ing = self.uow.ingredientes.get(ing_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_id} no encontrado",
                )
            
            cambios = data.model_dump(exclude_unset=True)
            for key, val in cambios.items():
                setattr(ing, key, val)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="INGREDIENTE_ACTUALIZAR",
                modulo="INGREDIENTES",
                descripcion=f"Se actualizó el ingrediente: {ing.nombre}",
                metadata_info={"id": ing.id, "cambios": cambios}
            ))

            return ing

    def delete(self, ing_id: int, user_id: int) -> None:
        with self.uow:
            ing = self.uow.ingredientes.get(ing_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_id} no encontrado",
                )
            
            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="INGREDIENTE_ELIMINAR",
                modulo="INGREDIENTES",
                descripcion=f"Se eliminó lógicamente el ingrediente: {ing.nombre}",
                metadata_info={"id": ing.id}
            ))

            self.uow.ingredientes.clear_productos_rel(ing_id)
            ing.is_active = False