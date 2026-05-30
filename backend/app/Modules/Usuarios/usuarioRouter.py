from fastapi import APIRouter, Depends
from typing import Annotated
from app.Core.Security.deps import get_current_active_user, require_role, get_uow
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Modules.Usuarios.usuarioService import UsuarioService
from pydantic import BaseModel, EmailStr

router = APIRouter()

def get_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> UsuarioService:
    return UsuarioService(uow)

class CambiarRolBody(BaseModel):
    rol: UserRole

class CrearUsuarioBody(BaseModel):
    nombre: str
    apellido: str
    email: EmailStr
    celular: str | None = None
    password: str
    rol: UserRole = UserRole.CLIENT

@router.post("/", dependencies=[Depends(require_role([UserRole.ADMIN]))])
def crear_usuario(
    body: CrearUsuarioBody,
    service: Annotated[UsuarioService, Depends(get_service)]
):
    return service.crear_usuario(body.nombre, body.apellido, body.email, body.password, body.rol, body.celular)

@router.get("/", dependencies=[Depends(require_role([UserRole.ADMIN]))])
def listar_usuarios(
    service: Annotated[UsuarioService, Depends(get_service)],
    page: int = 1,
    size: int = 15,
    search: str | None = None
):
    return service.get_all_paginated(page=page, size=size, search=search)

@router.patch("/{usuario_id}/rol", dependencies=[Depends(require_role([UserRole.ADMIN]))])
def cambiar_rol(
    usuario_id: int,
    body: CambiarRolBody,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[UsuarioService, Depends(get_service)]
):
    return service.cambiar_rol(usuario_id, body.rol, admin_id=current_user.id)

@router.patch("/{usuario_id}/toggle-activo", dependencies=[Depends(require_role([UserRole.ADMIN]))])
def toggle_activo(
    usuario_id: int,
    current_user: Annotated[Usuario, Depends(get_current_active_user)],
    service: Annotated[UsuarioService, Depends(get_service)]
):
    return service.toggle_activo(usuario_id, admin_id=current_user.id)
