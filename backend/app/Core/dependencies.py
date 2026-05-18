from fastapi import Depends
from app.Core.database import get_session
from app.Core.UnitOfWork.unit_of_work import UnitOfWork

def get_uow(session=Depends(get_session)):
    """Inyecta el Unit of Work en los servicios."""
    return UnitOfWork(session)
