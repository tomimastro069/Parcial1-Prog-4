import sys
from pathlib import Path

# Resolver ruta raíz del backend para evitar problemas de importación
backend_root = str(Path(__file__).resolve().parent.parent.parent)
if backend_root not in sys.path:
    sys.path.insert(0, backend_root)

from fastapi import FastAPI, Depends, Response, HTTPException
from fastapi.testclient import TestClient
from app.Core.Security.deps import get_current_user, require_role
from app.Core.Security.jwt import create_access_token
from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Core.dependencies import get_uow

app = FastAPI()

# Creamos un mock de usuario y UOW para independizarnos de la base de datos física
class MockUser:
    nombre = "Admin"
    apellido = "Sistema"
    email = "admin@foodstore.com"
    rol = UserRole.ADMIN
    is_active = True

class MockUsuariosRepository:
    def get_by_email(self, email: str):
        if email == "admin@foodstore.com":
            return MockUser()
        return None

class MockUnitOfWork:
    def __init__(self):
        self.usuarios = MockUsuariosRepository()
    def __enter__(self):
        return self
    def __exit__(self, exc_type, exc_val, exc_tb):
        pass

# Inyectamos el Mock en FastAPI para no ensuciar la base de datos
def get_mock_uow():
    return MockUnitOfWork()

app.dependency_overrides[get_uow] = get_mock_uow

@app.post("/login")
def login(response: Response):
    # Creamos un token real usando tu jwt.py
    token = create_access_token(data={"sub": "admin@foodstore.com", "rol": UserRole.ADMIN.value})
    # Seteamos la cookie access_token (tal como espera deps.py)
    response.set_cookie(key="access_token", value=token, httponly=True)
    return {"message": "Login exitoso, cookie seteada"}

@app.get("/me")
def read_me(current_user: Usuario = Depends(get_current_user)):
    return {"email": current_user.email, "rol": current_user.rol.value}

@app.get("/admin-only", dependencies=[Depends(require_role([UserRole.ADMIN]))])
def read_admin():
    return {"status": "authorized"}

client = TestClient(app)

def test_flow():
    print("--- INICIANDO TEST DE INTEGRACIÓN DE COOKIES ---")
    
    # 1. Intentar acceder a ruta protegida sin loguearse (Debe dar 401)
    print("\n1. Accediendo a /me sin cookie...")
    res = client.get("/me")
    print(f"Status: {res.status_code} | Detalle: {res.json()}")
    assert res.status_code == 401
    
    # 2. Hacer login para setear la cookie
    print("\n2. Haciendo login en /login...")
    res = client.post("/login")
    print(f"Status: {res.status_code} | Respuesta: {res.json()}")
    assert res.status_code == 200
    
    # 3. Acceder a ruta protegida con la cookie seteada (Debe dar 200)
    print("\n3. Accediendo a /me con la cookie de sesión...")
    res = client.get("/me")
    print(f"Status: {res.status_code} | Usuario: {res.json()}")
    assert res.status_code == 200
    assert res.json()["email"] == "admin@foodstore.com"
    
    # 4. Acceder a ruta con rol requerido (Debe dar 200)
    print("\n4. Accediendo a /admin-only con rol ADMIN...")
    res = client.get("/admin-only")
    print(f"Status: {res.status_code} | Autorización: {res.json()}")
    assert res.status_code == 200
    
    print("\n✅ ¡TEST COMPLETADO CON ÉXITO! Las dependencias de deps.py funcionan a la perfección.")

if __name__ == "__main__":
    test_flow()
