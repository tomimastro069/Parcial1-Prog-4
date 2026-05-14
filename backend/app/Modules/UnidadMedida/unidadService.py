from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.UnidadMedida.unidadSchema import UnidadMedidaRead, UnidadMedidaCreate

class UnidadMedidaService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_all(self) -> list[UnidadMedidaRead]:
        with self.uow:
            unidades = self.uow.unidades_medida.get_list()
            return [
                UnidadMedidaRead(
                    id=u.id,
                    nombre=u.nombre,
                    simbolo=u.simbolo,
                    tipo=u.tipo
                ) for u in unidades
            ]

    def create(self, data: UnidadMedidaCreate, user_id: int) -> UnidadMedidaRead:
        from app.Modules.UnidadMedida.unidadMedida import UnidadMedida
        from app.Modules.Auditoria.auditoria import Auditoria
        
        with self.uow:
            u = UnidadMedida(
                nombre=data.nombre,
                simbolo=data.simbolo,
                tipo=data.tipo
            )
            self.uow.unidades_medida.add(u)
            
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="UNIDAD_CREAR",
                modulo="UNIDADES",
                descripcion=f"Se creó la unidad de medida: {u.nombre}",
                metadata_info={"id": u.id}
            ))
            
            return UnidadMedidaRead(
                id=u.id,
                nombre=u.nombre,
                simbolo=u.simbolo,
                tipo=u.tipo
            )
