from fastapi import HTTPException, status
from app.Core.ws_broadcast import broadcast_sync
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Ajustes.Model.ajuste import Ajuste
from app.Modules.Ajustes.ajusteSchema import AjusteUpdate

class AjusteService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow

    def get_by_clave(self, clave: str) -> Ajuste:
        with self.uow:
            ajuste = self.uow.ajustes.get_by_clave(clave)
            if not ajuste:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ajuste con clave '{clave}' no encontrado."
                )
            return ajuste

    def update(self, clave: str, data: AjusteUpdate, usuario_id: int) -> Ajuste:
        with self.uow:
            ajuste = self.uow.ajustes.get_by_clave(clave)
            if not ajuste:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ajuste con clave '{clave}' no encontrado."
                )
            # Validar que si es costo_envio sea un número válido y no negativo
            if clave == "costo_envio":
                try:
                    valor_float = float(data.valor)
                    if valor_float < 0:
                        raise ValueError()
                except ValueError:
                    raise HTTPException(
                        status_code=status.HTTP_400_BAD_REQUEST,
                        detail="El costo de envío debe ser un número no negativo."
                    )
            
            ajuste.valor = data.valor
            self.uow.session.add(ajuste)
            self.uow.session.flush()
            broadcast_sync("ajuste.actualizado", {"clave": clave, "valor": data.valor})
            if clave == "indice_ganancia":
                broadcast_sync("precios.actualizados", {})
            return ajuste
