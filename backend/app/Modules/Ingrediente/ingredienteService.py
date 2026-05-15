from fastapi import HTTPException, status
from sqlmodel import select
from app.Modules.Ingrediente.ingrediente import Ingrediente
from app.Modules.Ingrediente.ingredienteSchema import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Core.Schema.pagination import PaginatedResponse
from app.Modules.Auditoria.auditoria import Auditoria
from app.Modules.UnidadMedida.unidadMedida import UnidadMedida

class IngredienteService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def _build_read(self, c: Ingrediente) -> IngredienteRead:
        unidad_simbolo = "u"
        if c.unidad_medida_id:
            um = self.uow.session.get(UnidadMedida, c.unidad_medida_id)
            if um:
                unidad_simbolo = um.simbolo
        
        return IngredienteRead(
            id=c.id,
            nombre=c.nombre,
            unidad_medida_id=c.unidad_medida_id,
            unidad=unidad_simbolo,
            descripcion=c.descripcion,
            es_alergeno=c.es_alergeno,
            is_active=c.is_active
        )

    def get_all(self, page: int = 1, size: int = 10, search: str | None = None, is_active: bool | None = None) -> PaginatedResponse[IngredienteRead]:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            
            ings_db, total = self.uow.ingredientes.search(
                search_term=search,
                offset=offset,
                limit=size,
                is_active=is_active
            )

            items = [self._build_read(c) for c in ings_db]
            pages = max(1, (total + size - 1) // size)

            return PaginatedResponse(
                items=items,
                total=total,
                page=page,
                size=size,
                pages=pages
            )

    def get_by_id(self, ing_id: int) -> IngredienteRead:
        with self.uow:
            ing = self.uow.ingredientes.get(ing_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_id} no encontrado",
                )
            return self._build_read(ing)

    def create(self, data: IngredienteCreate, user_id: int) -> IngredienteRead:
        with self.uow:
            ing = Ingrediente(
                nombre=data.nombre,
                descripcion=data.descripcion,
                es_alergeno=data.es_alergeno,
                unidad_medida_id=data.unidad_medida_id
            )
            self.uow.ingredientes.add(ing)
            
            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="INGREDIENTE_CREAR",
                modulo="INGREDIENTES",
                descripcion=f"Se creó el ingrediente: {ing.nombre}",
                metadata_info={"id": ing.id}
            ))
            
            return self._build_read(ing)

    def update(self, ing_id: int, data: IngredienteUpdate, user_id: int) -> IngredienteRead:
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

            return self._build_read(ing)

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

    def activar(self, ing_id: int, user_id: int) -> IngredienteRead:
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
            return self._build_read(ing)