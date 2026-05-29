from fastapi import APIRouter, Depends
from fastapi.responses import StreamingResponse
from typing import Annotated

from app.Core.Security.deps import require_role, get_uow
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Modules.Reportes.reporteService import ReporteService

router = APIRouter()

def get_reporte_service(uow: Annotated[UnitOfWork, Depends(get_uow)]) -> ReporteService:
    return ReporteService(uow)

# Roles permitidos para ver/descargar reportes
ALLOWED_ROLES = [UserRole.ADMIN, UserRole.STOCK, UserRole.PEDIDOS]

@router.get("/excel/general")
def get_reporte_general(
    service: Annotated[ReporteService, Depends(get_reporte_service)],
    current_user: Annotated[Usuario, Depends(require_role(ALLOWED_ROLES))]
):
    buffer = service.generar_reporte_general()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte-general.xlsx"}
    )

@router.get("/excel/productos")
def get_reporte_productos(
    service: Annotated[ReporteService, Depends(get_reporte_service)],
    current_user: Annotated[Usuario, Depends(require_role(ALLOWED_ROLES))]
):
    buffer = service.generar_reporte_productos()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte-productos.xlsx"}
    )

@router.get("/excel/categorias")
def get_reporte_categorias(
    service: Annotated[ReporteService, Depends(get_reporte_service)],
    current_user: Annotated[Usuario, Depends(require_role(ALLOWED_ROLES))]
):
    buffer = service.generar_reporte_categorias()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte-categorias.xlsx"}
    )

@router.get("/excel/ingredientes")
def get_reporte_ingredientes(
    service: Annotated[ReporteService, Depends(get_reporte_service)],
    current_user: Annotated[Usuario, Depends(require_role(ALLOWED_ROLES))]
):
    buffer = service.generar_reporte_ingredientes()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte-ingredientes.xlsx"}
    )

@router.get("/excel/pedidos")
def get_reporte_pedidos(
    service: Annotated[ReporteService, Depends(get_reporte_service)],
    current_user: Annotated[Usuario, Depends(require_role(ALLOWED_ROLES))]
):
    buffer = service.generar_reporte_pedidos()
    return StreamingResponse(
        buffer,
        media_type="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
        headers={"Content-Disposition": "attachment; filename=reporte-pedidos.xlsx"}
    )
