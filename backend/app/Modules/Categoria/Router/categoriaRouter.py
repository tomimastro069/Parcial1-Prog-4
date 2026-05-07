from fastapi import APIRouter, Depends, Path, Query, status
from typing import Annotated

from app.Modules.Categoria.Schema.categoriaSchema import CategoriaCreate, CategoriaRead, CategoriaUpdate
from app.Modules.Categoria.Service.categoriaService import CategoriaService
from app.Core.Dependencies.dependencies import role_required, get_uow
from app.Modules.Usuarios.usuario import UserRole, Usuario
from app.Core.Schema.pagination import PaginatedResponse

router = APIRouter()


@router.get("/", response_model=PaginatedResponse[CategoriaRead])
def listar_categorias(
    uow=Depends(get_uow),
    page: Annotated[int, Query(ge=1)] = 1,
    size: Annotated[int, Query(ge=1, le=1000)] = 10,
):
    service = CategoriaService(uow)
    return service.get_all(page, size)


@router.get("/{categoria_id}", response_model=CategoriaRead)
def obtener_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
):
    service = CategoriaService(uow)
    return service.get_by_id(categoria_id)


@router.post("/", 
             response_model=CategoriaRead, 
             status_code=status.HTTP_201_CREATED)
def crear_categoria(
    data: CategoriaCreate, 
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = CategoriaService(uow)
    return service.create(data, current_user.id)


@router.patch("/{categoria_id}", response_model=CategoriaRead)
def editar_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    data: CategoriaUpdate,
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = CategoriaService(uow)
    return service.update(categoria_id, data, current_user.id)


@router.delete("/{categoria_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_categoria(
    categoria_id: Annotated[int, Path(gt=0)],
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = CategoriaService(uow)
    service.delete(categoria_id, current_user.id)
