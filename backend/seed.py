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
from app.Modules.Pedidos.Model.estadoPedido import EstadoPedido
from app.Modules.Pagos.Model.formaPago import FormaPago


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
def seed_users():
    usuarios_data = [
        {"nombre": "Stock", "apellido": "Sistema", "email": "stock@foodstore.com", "rol": UserRole.STOCK},
        {"nombre": "Pedidos", "apellido": "Sistema", "email": "pedidos@foodstore.com", "rol": UserRole.PEDIDOS},
        {"nombre": "Cliente", "apellido": "Sistema", "email": "client@foodstore.com", "rol": UserRole.CLIENT},
    ]
    with Session(engine) as session:
        for data in usuarios_data:
            existe = session.exec(select(Usuario).where(Usuario.email == data["email"])).first()
            if not existe:
                session.add(Usuario(
                    nombre=data["nombre"],
                    apellido=data["apellido"],
                    email=data["email"],
                    password_hash=get_password_hash("admin123"),
                    rol=data["rol"],
                    is_active=True
                ))
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
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Carne vacuna"].id, cantidad=180, unidad_medida_id=ings["Carne vacuna"].unidad_medida_id),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Lechuga"].id, cantidad=20, unidad_medida_id=ings["Lechuga"].unidad_medida_id),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Tomate"].id, cantidad=30, unidad_medida_id=ings["Tomate"].unidad_medida_id),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Queso Cheddar"].id, cantidad=2, unidad_medida_id=ings["Queso Cheddar"].unidad_medida_id),
        ProductoIngrediente(producto_id=p1.id, ingrediente_id=ings["Pan de burger"].id, cantidad=1, unidad_medida_id=ings["Pan de burger"].unidad_medida_id),

        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Harina"].id, cantidad=250, unidad_medida_id=ings["Harina"].unidad_medida_id),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Salsa de tomate"].id, cantidad=100, unidad_medida_id=ings["Salsa de tomate"].unidad_medida_id),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Muzarella"].id, cantidad=200, unidad_medida_id=ings["Muzarella"].unidad_medida_id),
        ProductoIngrediente(producto_id=p2.id, ingrediente_id=ings["Albahaca"].id, cantidad=5, unidad_medida_id=ings["Albahaca"].unidad_medida_id),
    ])

    session.commit()


# -----------------------------
# ESTADOS PEDIDO
# -----------------------------
def seed_estados_pedidos(session):
    print("Verificando estados de pedido...")
    estados_data = [
        {"codigo": "PENDIENTE", "descripcion": "Pedido pendiente de confirmación", "orden": 1, "es_terminal": False},
        {"codigo": "CONFIRMADO", "descripcion": "Pedido confirmado", "orden": 2, "es_terminal": False},
        {"codigo": "EN_PREP", "descripcion": "Pedido en preparación", "orden": 3, "es_terminal": False},
        {"codigo": "EN_CAMINO", "descripcion": "Pedido en camino", "orden": 4, "es_terminal": False},
        {"codigo": "ENTREGADO", "descripcion": "Pedido entregado con éxito", "orden": 5, "es_terminal": True},
        {"codigo": "CANCELADO", "descripcion": "Pedido cancelado", "orden": 6, "es_terminal": True},
    ]
    for data in estados_data:
        estado_db = session.exec(select(EstadoPedido).where(EstadoPedido.codigo == data["codigo"])).first()
        if not estado_db:
            session.add(EstadoPedido(**data))
    session.commit()

# -----------------------------
# FORMAS PAGO
# -----------------------------
def seed_formas_pago(session):
    print("Verificando formas de pago...")
    formas_data = [
        {"codigo": "MERCADOPAGO", "descripcion": "Pago online con MercadoPago"},
        {"codigo": "EFECTIVO", "descripcion": "Pago en efectivo al retirar o recibir"},
        {"codigo": "TRANSFERENCIA", "descripcion": "Transferencia bancaria o billetera virtual"},
    ]
    for data in formas_data:
        forma_db = session.exec(select(FormaPago).where(FormaPago.codigo == data["codigo"])).first()
        if not forma_db:
            session.add(FormaPago(**data))
    session.commit()


#------------------------------
# PEDIDOS
#------------------------------

def seed_pedidos(session):
    pass
# -----------------------------
# AJUSTES
# -----------------------------
def seed_ajustes(session):
    print("Verificando ajustes...")
    from app.Modules.Ajustes.Model.ajuste import Ajuste
    costo_envio = session.exec(select(Ajuste).where(Ajuste.clave == "costo_envio")).first()
    if not costo_envio:
        costo_envio = Ajuste(
            clave="costo_envio",
            valor="50.00",
            descripcion="Costo de envío para los pedidos"
        )
        session.add(costo_envio)
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
        seed_estados_pedidos(session)
        seed_formas_pago(session)
        seed_ajustes(session)

        print("---------SEED COMPLETO OK---------")


# -----------------------------
# RUN
# -----------------------------
if __name__ == "__main__":
    seed_admin()
    seed_users()
    seed_data()