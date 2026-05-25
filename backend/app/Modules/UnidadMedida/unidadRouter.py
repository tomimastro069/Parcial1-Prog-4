from fastapi import APIRouter, Depends, HTTPException, status
from app.Core.dependencies import get_uow
from app.Modules.UnidadMedida.unidadService import UnidadMedidaService
from app.Core.Security.deps import require_role as role_required
from app.Modules.Usuarios.usuario import UserRole, Usuario

from app.Modules.UnidadMedida.unidadSchema import UnidadMedidaRead, UnidadMedidaCreate

router = APIRouter()

@router.get("/", response_model=list[UnidadMedidaRead])
def listar_unidades(uow=Depends(get_uow)):
    service = UnidadMedidaService(uow)
    return service.get_all()

@router.post("/", response_model=UnidadMedidaRead, status_code=201)
def crear_unidad(data: UnidadMedidaCreate, uow=Depends(get_uow)):
    service = UnidadMedidaService(uow)
    return service.create(data, user_id=1)

@router.delete("/{unidad_id}", status_code=status.HTTP_204_NO_CONTENT)
def eliminar_unidad(
    unidad_id: int,
    uow=Depends(get_uow),
    current_user: Usuario = Depends(role_required([UserRole.ADMIN]))
):
    service = UnidadMedidaService(uow)
    deleted = service.delete(unidad_id)
    if not deleted:
        raise HTTPException(status_code=404, detail="Unidad de medida no encontrada")
