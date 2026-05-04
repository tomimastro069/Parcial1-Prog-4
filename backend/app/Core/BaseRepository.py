from typing import Any, Generic, Optional, TypeVar
from sqlmodel import Session, SQLModel, func, select

T = TypeVar("T", bound=SQLModel)


class BaseRepository(Generic[T]):
    """Clase base genérica para todos los repositorios."""

    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model

    # --- Escritura ---

    def add(self, obj: T) -> T:
        """Agrega un objeto a la sesión y retorna con id actualizado."""
        self.session.add(obj)
        self.session.flush()
        self.session.refresh(obj)
        return obj

    def update(self, id: int, data: dict[str, Any]) -> Optional[T]:
        """Actualiza un objeto existente a partir de un dict."""
        existing = self.get(id)
        if not existing:
            return None
        for key, value in data.items():
            setattr(existing, key, value)
        self.session.flush()
        self.session.refresh(existing)
        return existing

    def delete(self, id: int) -> bool:
        """Elimina un objeto por id. Retorna True si existía."""
        obj = self.get(id)
        if obj:
            self.session.delete(obj)
            self.session.flush()
            return True
        return False

    # --- Lectura ---

    def get(self, id: int) -> Optional[T]:
        """Busca por id (usa cache de sesión antes de ir a DB)."""
        return self.session.get(self.model, id)


    def get_list(self, offset: int = 0, limit: int = 100) -> list[T]:
        """Obtiene objetos paginados."""
        statement = select(self.model).offset(offset).limit(limit)
        return list(self.session.exec(statement).all())


    def filter_by(self, offset: int = 0, limit: int = 100, **filters: Any) -> list[T]:
        statement = select(self.model)
        for field, value in filters.items():
            statement = statement.where(getattr(self.model, field) == value)
        return list(self.session.exec(statement).offset(offset).limit(limit).all())

    def first_by(self, **filters: Any) -> Optional[T]:
        """Retorna el primer registro que cumpla los filtros."""
        statement = select(self.model)
        for field, value in filters.items():
            statement = statement.where(getattr(self.model, field) == value)
        return self.session.exec(statement).first()

    def exists(self, id: int) -> bool:
        """Verifica si existe un objeto sin traerlo completo."""
        return self.get(id) is not None

    def count(self) -> int:
        """Retorna el total de registros de la tabla."""
        statement = select(func.count()).select_from(self.model)
        return self.session.exec(statement).one()

    # --- Hook para subclases ---

    def get_with_relations(self, id: int) -> Optional[T]:
        """Sobreescribir en repositorios específicos que necesiten eager loading."""
        return self.get(id)

    # Aliases 
    # (funcionan como un segundo nombre para la clase.
    # es perfectamente valido llamar get_by_id() en vez de get(), van a dar el mismo resultado)
        get_by_id = get
        get_all = get_list
        create = add