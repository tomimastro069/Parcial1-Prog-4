from sqlmodel import Session, select

from app.Core.database import engine
from app.Core.Security.jwt import get_password_hash

from app.Modules.Usuarios.usuario import Usuario, UserRole
from app.Modules.Categoria.categoria import Categoria
from app.Modules.Ingrediente.ingrediente import Ingrediente
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.Model.productoIngrediente import ProductoIngrediente
from app.Modules.UnidadMedida.unidadMedida import UnidadMedida


# -----------------------------
# ADMIN
# -----------------------------
def seed_admin():
    with Session(engine) as session:
        admin = session.exec(
            select(Usuario).where(Usuario.rol == UserRole.ADMIN)
        ).first()

        if not admin:
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


# -----------------------------
# UNIDADES DE MEDIDA
# -----------------------------
def seed_unidades(session):
    print("Verificando unidades de medida...")

    unidades_data = [
        # masa
        ("kilogramo", "kg", "masa"),
        ("gramo", "g", "masa"),

        # volumen
        ("litro", "L", "volumen"),
        ("mililitro", "mL", "volumen"),

        # unidad
        ("pieza", "u", "unidad"),
        ("docena", "doc", "unidad"),

        # area
        ("metro cuadrado", "m²", "area"),
    ]

    dict_unidades = {}

    for nombre, simbolo, tipo in unidades_data:
        unidad = session.exec(
            select(UnidadMedida).where(UnidadMedida.nombre == nombre)
        ).first()

        if not unidad:
            unidad = UnidadMedida(
                nombre=nombre,
                simbolo=simbolo,
                tipo=tipo
            )
            session.add(unidad)
            session.commit()
            session.refresh(unidad)

        dict_unidades[nombre] = unidad

    return dict_unidades


# -----------------------------
# CATEGORIAS
# -----------------------------
def seed_categorias(session):
    nombres = ["Hamburguesas", "Pizzas", "Bebidas"]
    dict_cats = {}

    for nombre in nombres:
        cat = session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

        if not cat:
            cat = Categoria(nombre=nombre, descripcion=f"Categoria {nombre}")
            session.add(cat)
            session.commit()
            session.refresh(cat)

        dict_cats[nombre] = cat

    return dict_cats


# -----------------------------
# INGREDIENTES
# -----------------------------
def seed_ingredientes(session, unidades):
    print("Verificando ingredientes...")

    data = [
        ("Carne vacuna", "gramo", "Medallón de carne"),
        ("Lechuga", "gramo", "Lechuga fresca"),
        ("Tomate", "gramo", "Tomate"),
        ("Queso Cheddar", "gramo", "Queso cheddar"),
        ("Pan de burger", "pieza", "Pan brioche"),
        ("Harina", "gramo", "Harina 0000"),
        ("Salsa de tomate", "mililitro", "Salsa pomodoro"),
        ("Muzarella", "gramo", "Queso muzarella"),
        ("Albahaca", "gramo", "Albahaca fresca"),
        ("Coca Cola", "pieza", "Botella 500ml"),
    ]

    dict_ings = {}

    for nombre, tipo_unidad, desc in data:

        unidad = unidades.get(tipo_unidad)

        ing = session.exec(
            select(Ingrediente).where(Ingrediente.nombre == nombre)
        ).first()

        if not ing:
            ing = Ingrediente(
                nombre=nombre,
                descripcion=desc,
                unidad_medida_id=unidad.id if unidad else None
            )
            session.add(ing)
            session.commit()
            session.refresh(ing)

        dict_ings[nombre] = ing

    return dict_ings


# -----------------------------
# PRODUCTOS
# -----------------------------
def seed_productos(session, cats, ings):
    print("Verificando productos...")

    if session.exec(select(Producto)).first():
        print("Productos ya existen")
        return

    p1 = Producto(nombre="Burger Clásica", precio_base=1200, descripcion="Hamburguesa clásica", es_terminado=False)
    p2 = Producto(nombre="Pizza Margherita", precio_base=1500, descripcion="Pizza italiana", es_terminado=False)
    p3 = Producto(nombre="Coca Cola 500ml", precio_base=500, descripcion="Gaseosa", es_terminado=True)

    session.add_all([p1, p2, p3])
    session.commit()

    session.refresh(p1)
    session.refresh(p2)
    session.refresh(p3)

    # categorías
    session.add_all([
        ProductoCategoria(producto_id=p1.id, categoria_id=cats["Hamburguesas"].id),
        ProductoCategoria(producto_id=p2.id, categoria_id=cats["Pizzas"].id),
        ProductoCategoria(producto_id=p3.id, categoria_id=cats["Bebidas"].id),
    ])

    # ingredientes
    session.add_all([
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Carne vacuna"].id, cantidad=180, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Lechuga"].id, cantidad=20, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Tomate"].id, cantidad=30, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Queso Cheddar"].id, cantidad=2, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Pan de burger"].id, cantidad=1, unidad_medida_id=None),

        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Harina"].id, cantidad=250, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Salsa de tomate"].id, cantidad=100, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Muzarella"].id, cantidad=200, unidad_medida_id=None),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Albahaca"].id, cantidad=5, unidad_medida_id=None),
    ])

    session.commit()


# -----------------------------
# MAIN SEED
# -----------------------------
def seed_data():
    with Session(engine) as session:

        unidades = seed_unidades(session)
        cats = seed_categorias(session)
        ings = seed_ingredientes(session, unidades)

        seed_productos(session, cats, ings)

        print("SEED COMPLETO OK")


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    seed_admin()
    seed_data()