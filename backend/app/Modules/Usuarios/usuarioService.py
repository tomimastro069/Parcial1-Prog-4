import math
from fastapi import HTTPException, status
from app.Core.Security.jwt import get_password_hash
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario, UserRole


class UsuarioService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def _build_read(self, u: Usuario) -> dict:
        return {
            "id": u.id,
            "nombre": u.nombre,
            "apellido": u.apellido,
            "email": u.email,
            "rol": u.rol,
            "is_active": u.is_active,
            "created_at": u.created_at,
        }

    def get_all_paginated(self, page: int = 1, size: int = 15, search: str | None = None) -> dict:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            usuarios, total = self.uow.usuarios.search(
                search_term=search,
                search_field="email",
                offset=offset,
                limit=size
            )
            return {
                "items": [self._build_read(u) for u in usuarios],
                "total": total,
                "page": page,
                "size": size,
                "pages": max(1, math.ceil(total / size)),
            }

    def cambiar_rol(self, usuario_id: int, nuevo_rol: UserRole, admin_id: int) -> dict:
        with self.uow:
            u = self.uow.usuarios.get(usuario_id)
            if not u:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if u.id == admin_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No podés cambiar tu propio rol")
            u.rol = nuevo_rol
            self.uow.commit()
            self.uow.session.refresh(u)
            return self._build_read(u)

    def crear_usuario(self, nombre: str, apellido: str, email: str, password: str, rol: UserRole) -> dict:
        with self.uow:
            if self.uow.usuarios.get_by_email(email):
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="El email ya está registrado")
            u = Usuario(
                nombre=nombre,
                apellido=apellido,
                email=email,
                password_hash=get_password_hash(password),
                rol=rol,
                is_active=True
            )
            self.uow.usuarios.add(u)
            self.uow.commit()
            self.uow.session.refresh(u)
            return self._build_read(u)

    def toggle_activo(self, usuario_id: int, admin_id: int) -> dict:
        with self.uow:
            u = self.uow.usuarios.get(usuario_id)
            if not u:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
            if u.id == admin_id:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="No podés desactivarte a vos mismo")
            u.is_active = not u.is_active
            self.uow.commit()
            self.uow.session.refresh(u)
            return self._build_read(u)
