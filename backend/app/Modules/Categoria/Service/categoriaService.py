from fastapi import HTTPException, status
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Categoria.Schema.categoriaSchema import CategoriaCreate, CategoriaUpdate
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Auditoria.Model.auditoria import Auditoria

class CategoriaService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self, offset: int = 0, limit: int = 10) -> list[Categoria]:
        with self.uow:
            return self.uow.categorias.filter_by(is_active=True, offset=offset, limit=limit)

    def get_by_id(self, categoria_id: int) -> Categoria:
        with self.uow:
            cat = self.uow.categorias.get(categoria_id)
            if not cat or not cat.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id {categoria_id} no encontrada",
                )
            return cat

    def create(self, data: CategoriaCreate, user_id: int) -> Categoria:
        with self.uow:
            existing = self.uow.categorias.first_by(nombre=data.nombre)
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Una categoría con el mismo nombre ya existe",
                )
            cat = Categoria.model_validate(data)
            self.uow.categorias.add(cat)
            
            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="CATEGORIA_CREAR",
                modulo="CATEGORIAS",
                descripcion=f"Se creó la categoría: {cat.nombre}",
                metadata_info={"id": cat.id}
            ))
            
            return cat

    def update(self, categoria_id: int, data: CategoriaUpdate, user_id: int) -> Categoria:
        with self.uow:
            cat = self.uow.categorias.get(categoria_id)
            if not cat or not cat.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id {categoria_id} no encontrada",
                )
            
            cambios = data.model_dump(exclude_unset=True)
            for key, val in cambios.items():
                setattr(cat, key, val)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="CATEGORIA_ACTUALIZAR",
                modulo="CATEGORIAS",
                descripcion=f"Se actualizó la categoría: {cat.nombre}",
                metadata_info={"id": cat.id, "cambios": cambios}
            ))

            return cat

    def delete(self, categoria_id: int, user_id: int) -> None:
        with self.uow:
            cat = self.uow.categorias.get(categoria_id)
            if not cat or not cat.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id {categoria_id} no encontrada",
                )
            
            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="CATEGORIA_ELIMINAR",
                modulo="CATEGORIAS",
                descripcion=f"Se eliminó lógicamente la categoría: {cat.nombre}",
                metadata_info={"id": cat.id}
            ))

            self.uow.categorias.clear_productos_rel(categoria_id)
            cat.is_active = False