from contextlib import asynccontextmanager

import fastapi
import uvicorn
from fastapi.middleware.cors import CORSMiddleware

from app.Core.database import create_db_and_tables
from app.Modules.Categoria.Router.categoriaRouter import router as categoria_router
from app.Modules.Producto.Router.productoRouter import router as producto_router
from app.Modules.Ingrediente.Router.ingredienteRouter import router as ingrediente_router

# Importar modelos para que SQLModel los registre en metadata
from app.Modules.Categoria.Model.categoria import Categoria  # noqa: F401
from app.Modules.Producto.Model.producto import Producto  # noqa: F401
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente  # noqa: F401
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria  # noqa: F401
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente  # noqa: F401

@asynccontextmanager
async def lifespan(_: fastapi.FastAPI):
    create_db_and_tables()
    yield


app = fastapi.FastAPI(lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Main.py activo"}

app.include_router(categoria_router, prefix="/categoria", tags=["categoria"])
app.include_router(producto_router, prefix="/producto", tags=["producto"])
app.include_router(ingrediente_router, prefix="/ingrediente", tags=["ingrediente"])


if __name__ == "__main__":
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True, reload_excludes=[".venv"])
