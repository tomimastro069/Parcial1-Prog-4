from typing import Any, Generic, Optional, TypeVar
from sqlmodel import Session, select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Clase base genérica para todos los repositorios."""
    
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model
    
    def add(self, obj: T) -> T:
        """Agrega un objeto a la sesión y hace flush."""
        self.session.add(obj)
        self.session.flush()
        return obj

    def create(self, obj: T) -> T:
        """Alias de compatibilidad para add()."""
        return self.add(obj)
    
    def get(self, id: int) -> Optional[T]:
        """Obtiene un objeto por ID."""
        statement = select(self.model).where(self.model.id == id)
        return self.session.exec(statement).first()

    def get_by_id(self, id: int) -> Optional[T]:
        """Alias de compatibilidad para get()."""
        return self.get(id)
    
    def get_list(self, offset: int = 0, limit: int = 100) -> list[T]:
        """Obtiene objetos paginados."""
        statement = select(self.model).offset(offset).limit(limit)
        return self.session.exec(statement).all()

    def get_all(self) -> list[T]:
        """Alias de compatibilidad para get_list()."""
        return self.get_list()

    def first_by(self, **filters: Any) -> Optional[T]:
        """Obtiene el primer registro que cumpla filtros exactos."""
        statement = select(self.model)
        for field, value in filters.items():
            statement = statement.where(getattr(self.model, field) == value)
        return self.session.exec(statement).first()

    def get_with_relations(self, id: int) -> Optional[T]:
        """Hook para repositorios específicos con relaciones."""
        return self.get(id)
    
    def update(self, id: int, obj: T) -> Optional[T]:
        """Actualiza un objeto existente."""
        existing = self.get(id)
        if existing:
            obj_data = (
                obj.model_dump(exclude_unset=True)
                if hasattr(obj, "model_dump")
                else obj.dict(exclude_unset=True)
            )
            for key, value in obj_data.items():
                setattr(existing, key, value)
            self.session.flush()
            return existing
        return None
    
    def delete(self, id: int) -> bool:
        """Elimina un objeto."""
        obj = self.get(id)
        if obj:
            self.session.delete(obj)
            self.session.flush()
            return True
        return False
