from pydantic import BaseModel

class PreferenciaRequest(BaseModel):
    pedido_id: int

class PreferenciaResponse(BaseModel):
    preference_id: str
    init_point: str
