from contextlib import asynccontextmanager

import fastapi
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from app.Core.database import create_db_and_tables
from app.Modules.Categoria.categoriaRouter import router as categoria_router
from app.Modules.Producto.productoRouter import router as producto_router
from app.Modules.Ingrediente.ingredienteRouter import router as ingrediente_router
from app.Modules.Auth.authRouter import router as auth_router
from app.Modules.UnidadMedida.unidadRouter import router as unidad_router
from app.Modules.Direcciones.direccionRouter import router as direccion_router
from app.Modules.Pagos.pagoRouter import router as pago_router
from app.Modules.Pedidos.pedidoRouter import router as pedido_router
from seed import seed_admin
from seed import seed_data

# Importar modelos para que SQLModel los registre en metadata
from app.Modules.Categoria.categoria import Categoria  # noqa: F401
from app.Modules.Producto.Model.producto import Producto  # noqa: F401
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente  # noqa: F401
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria  # noqa: F401
from app.Modules.Ingrediente.ingrediente import Ingrediente  # noqa: F401
from app.Modules.Usuarios.usuario import Usuario  # noqa: F401
from app.Modules.Auth.refreshToken import RefreshToken  # noqa: F401
from app.Modules.Auditoria.auditoria import Auditoria  # noqa: F401
from app.Modules.Direcciones.Model.direccionEntrega import DireccionEntrega  # noqa: F401
from app.Modules.Pagos.Model.formaPago import FormaPago  # noqa: F401
from app.Modules.Pedidos.Model.estadoPedido import EstadoPedido  # noqa: F401
from app.Modules.Pedidos.Model.pedido import Pedido  # noqa: F401
from app.Modules.Pedidos.Model.detallePedido import DetallePedido  # noqa: F401
from app.Modules.Pedidos.Model.historialEstadoPedido import HistorialEstadoPedido  # noqa: F401
from app.Modules.Ajustes.Model.ajuste import Ajuste  # noqa: F401
from app.Modules.Ajustes.ajusteRouter import router as ajuste_router

from app.Core.Config.rate_limit import limiter
from slowapi.errors import RateLimitExceeded
from slowapi import _rate_limit_exceeded_handler

@asynccontextmanager
async def lifespan(_: fastapi.FastAPI):
    create_db_and_tables()
    seed_admin()
    seed_data()
    yield


app = fastapi.FastAPI(lifespan=lifespan)
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Main.py activo"}

app.include_router(categoria_router, prefix="/api/v1/categorias", tags=["categorias"])
app.include_router(producto_router, prefix="/api/v1/productos", tags=["productos"])
app.include_router(ingrediente_router, prefix="/api/v1/ingredientes", tags=["ingredientes"])
app.include_router(auth_router, prefix="/api/v1/auth", tags=["auth"])
app.include_router(unidad_router, prefix="/api/v1/unidades-medida", tags=["unidades-medida"])
app.include_router(direccion_router, prefix="/api/v1/direcciones", tags=["direcciones"])
app.include_router(pago_router, prefix="/api/v1/pagos", tags=["pagos"])
app.include_router(pedido_router, prefix="/api/v1/pedidos", tags=["pedidos"])
app.include_router(ajuste_router, prefix="/api/v1/ajustes", tags=["ajustes"])

if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_excludes=[".venv"])
