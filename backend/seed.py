from sqlmodel import Session, select
from app.Core.database import engine
from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Core.Security.jwt import get_password_hash

def seed_admin():
    with Session(engine) as session:
        # Verificar si ya existe un admin
        statement = select(Usuario).where(Usuario.rol == UserRole.ADMIN)
        admin = session.exec(statement).first()
        
        if not admin:
            print("Creando usuario administrador inicial...")
            admin_user = Usuario(
                nombre="Admin",
                apellido="Sistema",
                email="admin@foodstore.com",
                password_hash=get_password_hash("admin123"),
                rol=UserRole.ADMIN,
                is_active=True
            )
            session.add(admin_user)
            session.commit()
            print("Admin creado: admin@foodstore.com / admin123")
        else:
            print("El administrador ya existe.")

if __name__ == "__main__":
    seed_admin()
