from fastapi import HTTPException, status
from sqlmodel import select
from app.Modules.Ingrediente.ingrediente import Ingrediente
from app.Modules.Ingrediente.ingredienteSchema import IngredienteCreate, IngredienteUpdate, IngredienteRead
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Core.pagination import PaginatedResponse
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
            precio_unitario=float(c.precio_unitario),
            stock_actual=float(c.stock_actual),
            is_active=c.is_active
        )

    def get_all(self, page: int = 1, size: int = 10, search: str | None = None, is_active: bool | None = None, sin_stock: bool | None = None) -> PaginatedResponse[IngredienteRead]:
        with self.uow:
            from sqlmodel import select as sel
            from app.Modules.Ingrediente.ingrediente import Ingrediente as IngModel
            page = max(1, page)
            offset = max(0, (page - 1) * size)

            if sin_stock is not None:
                from sqlmodel import func, select as sel2
                stmt = sel(IngModel)
                if is_active is not None:
                    stmt = stmt.where(IngModel.is_active == is_active)
                if search:
                    stmt = stmt.where(IngModel.nombre.ilike(f"%{search}%"))
                if sin_stock:
                    stmt = stmt.where(IngModel.stock_actual <= 0)
                else:
                    stmt = stmt.where(IngModel.stock_actual > 0)
                from sqlmodel import func as sqlfunc
                total = self.uow.session.exec(sel2(sqlfunc.count()).select_from(stmt.subquery())).one()
                ings_db = self.uow.session.exec(stmt.offset(offset).limit(size)).all()
            else:
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
            from decimal import Decimal
            ing = Ingrediente(
                nombre=data.nombre,
                descripcion=data.descripcion,
                es_alergeno=data.es_alergeno,
                unidad_medida_id=data.unidad_medida_id,
                precio_unitario=Decimal(str(data.precio_unitario))
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

            # NO borramos la relación con productos — la receta queda intacta
            # El ingrediente inactivo ya bloquea el stock en _calcular_stock
            ing.is_active = False
            ing.stock_actual = 0.0  # forzar stock a 0 al inactivar

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