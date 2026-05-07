from sqlmodel import Session, select
from app.Core.database import engine
from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Modules.Categoria.Model.categoria import Categoria
from app.Modules.Ingrediente.Model.ingrediente import Ingrediente
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Core.Security.jwt import get_password_hash

def seed_admin():
    with Session(engine) as session:
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

def seed_data():
    with Session(engine) as session:
        # 1. Categorías
        print("Verificando categorías...")
        nombres_cats = ["Hamburguesas", "Pizzas", "Bebidas"]
        dict_cats = {}
        for nombre in nombres_cats:
            cat = session.exec(select(Categoria).where(Categoria.nombre == nombre)).first()
            if not cat:
                print(f"Creando categoría: {nombre}")
                cat = Categoria(nombre=nombre, descripcion=f"Categoría de {nombre}")
                session.add(cat)
                session.commit()
                session.refresh(cat)
            dict_cats[nombre] = cat

        # 2. Ingredientes
        print("Verificando ingredientes...")
        datos_ings = [
            ("Carne vacuna", "gr", "Medallón de carne de 180gr"),
            ("Lechuga", "gr", "Lechuga fresca"),
            ("Tomate", "gr", "Tomate redondo"),
            ("Queso Cheddar", "fetas", "Queso cheddar real"),
            ("Pan de burger", "u", "Pan brioche artesanal"),
            ("Harina", "gr", "Harina 0000"),
            ("Salsa de tomate", "ml", "Salsa pomodoro"),
            ("Muzarella", "gr", "Queso muzarella de primera"),
            ("Albahaca", "gr", "Albahaca fresca"),
            ("Coca Cola", "u", "Botella 500ml")
        ]
        dict_ings = {}
        for nombre, unidad, desc in datos_ings:
            ing = session.exec(select(Ingrediente).where(Ingrediente.nombre == nombre)).first()
            if not ing:
                print(f"Creando ingrediente: {nombre}")
                ing = Ingrediente(nombre=nombre, unidad=unidad, descripcion=desc)
                session.add(ing)
                session.commit()
                session.refresh(ing)
            dict_ings[nombre] = ing

        # 3. Productos
        print("Verificando productos...")
        if session.exec(select(Producto)).first():
            print("Los productos ya existen.")
        else:
            print("Creando productos iniciales...")
            
            p1 = Producto(nombre="Burger Clásica", precio=1200.0, descripcion="Hamburgesa simple con lechuga y tomate")
            p2 = Producto(nombre="Pizza Margherita", precio=1500.0, descripcion="Pizza con pomodoro, muzarella y albahaca")
            p3 = Producto(nombre="Coca Cola 500ml", precio=500.0, descripcion="Gaseosa original")

            session.add(p1)
            session.add(p2)
            session.add(p3)
            session.commit()
            session.refresh(p1)
            session.refresh(p2)
            session.refresh(p3)

            # Asociar Categorías
            session.add(ProductoCategoria(producto_id=p1.id, categoria_id=dict_cats["Hamburguesas"].id))
            session.add(ProductoCategoria(producto_id=p2.id, categoria_id=dict_cats["Pizzas"].id))
            session.add(ProductoCategoria(producto_id=p3.id, categoria_id=dict_cats["Bebidas"].id))

            # Asociar Ingredientes
            # Burger
            session.add(ProductoIngrediente(producto_id=p1.id, ingrediente_id=dict_ings["Carne vacuna"].id, cantidad=180))
            session.add(ProductoIngrediente(producto_id=p1.id, ingrediente_id=dict_ings["Lechuga"].id, cantidad=20))
            session.add(ProductoIngrediente(producto_id=p1.id, ingrediente_id=dict_ings["Tomate"].id, cantidad=30))
            session.add(ProductoIngrediente(producto_id=p1.id, ingrediente_id=dict_ings["Queso Cheddar"].id, cantidad=2))
            session.add(ProductoIngrediente(producto_id=p1.id, ingrediente_id=dict_ings["Pan de burger"].id, cantidad=1))

            # Pizza
            session.add(ProductoIngrediente(producto_id=p2.id, ingrediente_id=dict_ings["Harina"].id, cantidad=250))
            session.add(ProductoIngrediente(producto_id=p2.id, ingrediente_id=dict_ings["Salsa de tomate"].id, cantidad=100))
            session.add(ProductoIngrediente(producto_id=p2.id, ingrediente_id=dict_ings["Muzarella"].id, cantidad=200))
            session.add(ProductoIngrediente(producto_id=p2.id, ingrediente_id=dict_ings["Albahaca"].id, cantidad=5))

            # Bebida
            session.add(ProductoIngrediente(producto_id=p3.id, ingrediente_id=dict_ings["Coca Cola"].id, cantidad=1))

            session.commit()
            print("Datos de prueba creados exitosamente.")
            print("3 PRODUCTOS -- 3 CATEGORIAS -- 10 INGREDIENTES ")

if __name__ == "__main__":
    seed_admin()
    seed_data()

