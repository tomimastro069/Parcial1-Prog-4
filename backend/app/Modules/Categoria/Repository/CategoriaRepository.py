from sqlmodel import Session
from app.Modules.Categoria.Model.categoria import Categoria
from app.Core.BaseRepository import BaseRepository



class CategoriaRepository(BaseRepository[Categoria]):
  
    def __init__(self, session: Session):
        super().__init__(session, Categoria)

    # proximos metodos a implementar: solo se agregan aca y listo.
    