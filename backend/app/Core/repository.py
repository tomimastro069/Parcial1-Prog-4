from typing import TypeVar, Generic, List, Optional
from sqlmodel import Session, select

T = TypeVar("T")


class BaseRepository(Generic[T]):
    """Clase base genérica para todos los repositorios."""
    
    def __init__(self, session: Session, model: type[T]):
        self.session = session
        self.model = model
    
    def create(self, obj: T) -> T:
        """Crea un nuevo objeto en la BD."""
        self.session.add(obj)
        self.session.flush()
        return obj
    
    def get_by_id(self, id: int) -> Optional[T]:
        """Obtiene un objeto por ID."""
        statement = select(self.model).where(self.model.id == id)
        return self.session.exec(statement).first()
    
    def get_all(self) -> List[T]:
        """Obtiene todos los objetos."""
        statement = select(self.model)
        return self.session.exec(statement).all()
    
    def update(self, id: int, obj: T) -> Optional[T]:
        """Actualiza un objeto existente."""
        existing = self.get_by_id(id)
        if existing:
            obj_data = obj.dict(exclude_unset=True)
            for key, value in obj_data.items():
                setattr(existing, key, value)
            self.session.flush()
            return existing
        return None
    
    def delete(self, id: int) -> bool:
        """Elimina un objeto."""
        obj = self.get_by_id(id)
        if obj:
            self.session.delete(obj)
            self.session.flush()
            return True
        return False
