"""Helper para emitir eventos WebSocket desde código síncrono (services)."""
import asyncio
from app.Core.websocket_manager import manager

_loop: asyncio.AbstractEventLoop | None = None


def set_event_loop(loop: asyncio.AbstractEventLoop):
    global _loop
    _loop = loop


def broadcast_sync(event: str, data: dict | None = None, room: str | None = None):
    if data is None:
        data = {}
    if _loop is None or not _loop.is_running():
        return
    try:
        if room:
            coro = manager.broadcast_room(room, event, data)
        else:
            coro = manager.broadcast(event, data)
        asyncio.run_coroutine_threadsafe(coro, _loop)
    except Exception:
        pass
