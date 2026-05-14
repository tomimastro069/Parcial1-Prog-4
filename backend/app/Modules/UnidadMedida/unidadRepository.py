from typing import Optional, Any
from sqlmodel import Session, select

from app.Core.UnitOfWork.BaseRepository import BaseRepository
from app.Modules.UnidadMedida.unidadMedida import UnidadMedida


class UnidadMedidaRepository(BaseRepository[UnidadMedida]):

    def __init__(self, session: Session):
        super().__init__(session, UnidadMedida)

    # -----------------------------
    # QUERIES ESPECÍFICAS
    # -----------------------------

    def get_by_nombre(self, nombre: str) -> Optional[UnidadMedida]:
        return self.first_by(nombre=nombre)

    def get_by_simbolo(self, simbolo: str) -> Optional[UnidadMedida]:
        return self.first_by(simbolo=simbolo)

    def get_by_tipo(self, tipo: str) -> list[UnidadMedida]:
        return self.filter_by(tipo=tipo)

    def exists_nombre(self, nombre: str) -> bool:
        return self.first_by(nombre=nombre) is not None

    def exists_simbolo(self, simbolo: str) -> bool:
        return self.first_by(simbolo=simbolo) is not None

    # -----------------------------
    # CONSULTA AVANZADA
    # -----------------------------

    def search(self, query: str, limit: int = 50) -> list[UnidadMedida]:
        statement = (
            select(UnidadMedida)
            .where(UnidadMedida.nombre.ilike(f"%{query}%"))
            .limit(limit)
        )
        return list(self.session.exec(statement).all())

    def get_by_tipo_grouped(self) -> dict[str, list[UnidadMedida]]:
        """Devuelve unidades agrupadas por tipo (masa, volumen, etc)."""
        unidades = self.get_all()

        grouped: dict[str, list[UnidadMedida]] = {}

        for u in unidades:
            if u.tipo not in grouped:
                grouped[u.tipo] = []
            grouped[u.tipo].append(u)

        return grouped