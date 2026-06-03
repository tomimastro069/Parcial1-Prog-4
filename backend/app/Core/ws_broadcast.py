"""Helper para emitir eventos WebSocket desde código síncrono (services)."""
import asyncio
from app.Core.websocket_manager import manager

_loop: asyncio.AbstractEventLoop | None = None


def set_event_loop(loop: asyncio.AbstractEventLoop):
    global _loop
    _loop = loop


def broadcast_sync(event: str, data: dict = {}):
    if _loop is None or not _loop.is_running():
        return
    try:
        asyncio.run_coroutine_threadsafe(manager.broadcast(event, data), _loop)
    except Exception:
        pass
