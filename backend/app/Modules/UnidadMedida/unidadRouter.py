from fastapi import APIRouter, Depends
from app.Core.Dependencies.dependencies import get_uow
from app.Modules.UnidadMedida.unidadService import UnidadMedidaService

from app.Modules.UnidadMedida.unidadSchema import UnidadMedidaRead, UnidadMedidaCreate

router = APIRouter()

@router.get("/", response_model=list[UnidadMedidaRead])
def listar_unidades(uow=Depends(get_uow)):
    service = UnidadMedidaService(uow)
    return service.get_all()

@router.post("/", response_model=UnidadMedidaRead, status_code=201)
def crear_unidad(data: UnidadMedidaCreate, uow=Depends(get_uow)):
    # Asumimos user_id=1 por ahora (Admin por defecto) al igual que en otros lados
    service = UnidadMedidaService(uow)
    return service.create(data, user_id=1)
