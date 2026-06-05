from fastapi import APIRouter, WebSocket, WebSocketDisconnect
from app.Core.websocket_manager import manager
from app.Core.Security.jwt import decode_token

router = APIRouter()

@router.websocket("/ws")
async def websocket_endpoint(websocket: WebSocket):
    # Validar token del query param
    token = websocket.query_params.get("token")
    if not token:
        await websocket.close(code=4001, reason="Token requerido")
        return

    payload = decode_token(token)
    if not payload:
        await websocket.close(code=4001, reason="Token inválido")
        return

    await manager.connect(websocket)
    try:
        while True:
            await websocket.receive_text()
    except WebSocketDisconnect:
        manager.disconnect(websocket)
