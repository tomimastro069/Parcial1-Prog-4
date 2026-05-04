from sqlmodel import Session
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Core.BaseRepository import BaseRepository


class IngredienteRepository(BaseRepository[Ingrediente]):
    
    def __init__(self, session: Session):
        super().__init__(session, Ingrediente)

    # proximos metodos a implementar: solo se agregan aca y listo.
    