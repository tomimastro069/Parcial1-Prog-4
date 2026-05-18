from fastapi import APIRouter, Depends, Path, Query, status
from typing import Annotated

from app.Modules.Ingrediente.ingredienteSchema import IngredienteCreate, IngredienteRead, IngredienteUpdate
from app.Modules.Ingrediente.ingredienteService import IngredienteService
from app.Core.dependencies import get_uow
from app.Core.Security.deps import require_role as role_required
from app.Modules.Usuarios.usuario import UserRole, Usuario
from app.Core.Schema.pagination import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[IngredienteRead])
def listar_ingredientes(
    uow=Depends(get_uow),
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=1000)] = 10,
    search: Annotated[str | None, Query()] = None,
    is_active: Annotated[bool | None, Query()] = None,
):
    service = IngredienteService(uow)
    return service.get_all(page, size, search=search, is_active=is_active)


@router.get("/{ing_id}", response_model=IngredienteRead)
def obtener_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
):
    service = IngredienteService(uow)
    return service.get_by_id(ing_id)


@router.post("/", 
             response_model=IngredienteRead, 
             status_code=status.HTTP_201_CREATED)
def crear_ingrediente(
    data: IngredienteCreate, 
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = IngredienteService(uow)
    return service.create(data, current_user.id)


@router.patch("/{ing_id}", response_model=IngredienteRead)
def editar_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    data: IngredienteUpdate,
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = IngredienteService(uow)
    return service.update(ing_id, data, current_user.id)


@router.patch("/{ing_id}/activar", response_model=IngredienteRead)
def activar_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN, UserRole.STOCK]))
):
    service = IngredienteService(uow)
    return service.activar(ing_id, current_user.id)


@router.delete("/{ing_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_ingrediente(
    ing_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = IngredienteService(uow)
    service.delete(ing_id, current_user.id)
