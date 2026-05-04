from sqlmodel import Session
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Core.UnitOfWork.BaseRepository import BaseRepository


class IngredienteRepository(BaseRepository[Ingrediente]):
    
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    # proximos metodos a implementar: solo se agregan aca y listo.
    
    def clear_productos_rel(self, ingrediente_id: int) -> None:
        statement = select(ProductoIngrediente).where(ProductoIngrediente.ingrediente_id == ingrediente_id)
        for rel in self.session.exec(statement).all():
            self.session.delete(rel)
        self.session.flush()