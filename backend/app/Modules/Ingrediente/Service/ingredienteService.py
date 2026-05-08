from fastapi import HTTPException, status
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Ingrediente.Schema.ingredienteSchema import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Core.Schema.pagination import PaginatedResponse
from app.Modules.Auditoria.Model.auditoria import Auditoria

class IngredienteService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, page: int = 1, size: int = 10, is_active: bool | None = None) -> PaginatedResponse[IngredienteRead]:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            if is_active is not None:
                ings_db = self.uow.ingredientes.filter_by(offset=offset, limit=size, is_active=is_active)
                total = self.uow.ingredientes.count_by(is_active=is_active)
            else:
                ings_db = self.uow.ingredientes.get_list(offset=offset, limit=size)
                total = self.uow.ingredientes.count()

            items = [IngredienteRead.model_validate(c) for c in ings_db]
            pages = max(1, (total + size - 1) // size)

            return PaginatedResponse(
                items=items,
                total=total,
                page=page,
                size=size,
                pages=pages
            )

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

    def activar(self, ing_id: int, user_id: int) -> Ingrediente:
        with self.uow:
            ing = self.uow.ingredientes.get(ing_id)
            if not ing:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_id} no encontrado",
                )
            ing.is_active = True
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="INGREDIENTE_ACTIVAR",
                modulo="INGREDIENTES",
                descripcion=f"Se reactivó el ingrediente: {ing.nombre}",
                metadata_info={"id": ing.id}
            ))
            return ing