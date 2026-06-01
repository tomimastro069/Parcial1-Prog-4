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
    nombres = [
        "Hamburguesas", "Pizzas", "Bebidas",
        "Empanadas", "Postres", "Ensaladas", "Sandwiches"
    ]
    dict_cats = {}

    for nombre in nombres:
        cat = session.exec(
            select(Categoria).where(Categoria.nombre == nombre)
        ).first()

        if not cat:
            cat = Categoria(nombre=nombre, descripcion=f"Categoría {nombre}")
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
        # nombre,               unidad,       descripcion,                  es_alergeno
        ("Carne vacuna",        "gramo",      "Medallón de carne",          False),
        ("Lechuga",             "gramo",      "Lechuga fresca",             False),
        ("Tomate",              "gramo",      "Tomate perita",              False),
        ("Queso Cheddar",       "gramo",      "Queso cheddar",              True),
        ("Pan de burger",       "pieza",      "Pan brioche",                True),
        ("Harina",              "gramo",      "Harina 0000",                True),
        ("Salsa de tomate",     "mililitro",  "Salsa pomodoro",             False),
        ("Muzarella",           "gramo",      "Queso muzarella",            True),
        ("Albahaca",            "gramo",      "Albahaca fresca",            False),
        ("Pepperoni",           "gramo",      "Pepperoni ahumado",          False),
        ("Jamón",               "gramo",      "Jamón cocido",               False),
        ("Cebolla",             "gramo",      "Cebolla blanca",             False),
        ("Panceta",             "gramo",      "Panceta ahumada",            False),
        ("Huevo",               "pieza",      "Huevo de gallina",           True),
        ("Masa de empanada",    "pieza",      "Disco de empanada",          True),
        ("Chocolate",           "gramo",      "Chocolate negro 70%",        True),
        ("Crema",               "mililitro",  "Crema de leche",             True),
        ("Pan de miga",         "pieza",      "Pan de miga blanco",         True),
        ("Mayonesa",            "gramo",      "Mayonesa",                   True),
        ("Agua con gas",        "mililitro",  "Agua mineral con gas",       False),
        ("Jugo de naranja",     "mililitro",  "Jugo de naranja natural",    False),
    ]

    dict_ings = {}

    for nombre, tipo_unidad, desc, es_alergeno in data:
        unidad = unidades.get(tipo_unidad)
        ing = session.exec(
            select(Ingrediente).where(Ingrediente.nombre == nombre)
        ).first()

        if not ing:
            ing = Ingrediente(
                nombre=nombre,
                descripcion=desc,
                es_alergeno=es_alergeno,
                unidad_medida_id=unidad.id if unidad else None
            )
            session.add(ing)
            session.commit()
            session.refresh(ing)

        dict_ings[nombre] = ing

    return dict_ings


# -----------------------------
# HELPER: agregar producto si no existe
# -----------------------------
def _agregar_producto(session, nombre, precio, descripcion, imagen_url, es_terminado, cats_list, ings_list, cats, ings):
    """
    cats_list: lista de nombres de categorías
    ings_list: lista de (nombre_ingrediente, cantidad, es_removible)
    """
    existe = session.exec(select(Producto).where(Producto.nombre == nombre)).first()
    if existe:
        return

    p = Producto(
        nombre=nombre,
        precio_base=precio,
        descripcion=descripcion,
        imagenes_url=[imagen_url] if imagen_url else None,
        es_terminado=es_terminado,
        disponible=True,
        is_active=True,
        stock_cantidad=50,
    )
    session.add(p)
    session.commit()
    session.refresh(p)

    for cat_nombre in cats_list:
        if cat_nombre in cats:
            session.add(ProductoCategoria(producto_id=p.id, categoria_id=cats[cat_nombre].id))

    for ing_nombre, cantidad, es_removible in ings_list:
        if ing_nombre in ings:
            ing = ings[ing_nombre]
            session.add(ProductoIngrediente(
                producto_id=p.id,
                ingrediente_id=ing.id,
                cantidad=cantidad,
                unidad_medida_id=ing.unidad_medida_id,
                es_removible=es_removible,
            ))

    session.commit()
    print(f"  ✓ {nombre}")


# -----------------------------
# PRODUCTOS
# -----------------------------
def seed_productos(session, cats, ings):
    print("Verificando productos...")

    productos = [
        # --- HAMBURGUESAS ---
        (
            "Burger Clásica", 1200, "Hamburguesa de carne vacuna con lechuga, tomate y queso cheddar",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 180, False),
                ("Pan de burger", 1, False),
                ("Lechuga", 20, True),
                ("Tomate", 30, True),
                ("Queso Cheddar", 30, True),
            ]
        ),
        (
            "Burger BBQ", 1450, "Hamburguesa con panceta crocante y cebolla caramelizada",
            "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 200, False),
                ("Pan de burger", 1, False),
                ("Panceta", 40, True),
                ("Cebolla", 30, True),
                ("Queso Cheddar", 30, True),
            ]
        ),
        (
            "Doble Burger", 1800, "Doble medallón de carne con doble queso",
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 360, False),
                ("Pan de burger", 1, False),
                ("Queso Cheddar", 60, True),
                ("Lechuga", 20, True),
                ("Tomate", 30, True),
            ]
        ),
        # --- PIZZAS ---
        (
            "Pizza Margherita", 1500, "Pizza clásica con salsa de tomate, muzarella y albahaca",
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 250, False),
                ("Salsa de tomate", 100, False),
                ("Muzarella", 200, True),
                ("Albahaca", 5, True),
            ]
        ),
        (
            "Pizza Pepperoni", 1700, "Pizza con pepperoni y muzarella extra",
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 250, False),
                ("Salsa de tomate", 100, False),
                ("Muzarella", 200, True),
                ("Pepperoni", 80, True),
            ]
        ),
        (
            "Pizza Jamón y Morrones", 1600, "Pizza con jamón y morrones asados",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 250, False),
                ("Salsa de tomate", 100, False),
                ("Muzarella", 180, True),
                ("Jamón", 80, True),
            ]
        ),
        # --- EMPANADAS ---
        (
            "Empanada de Carne", 350, "Empanada jugosa de carne cortada a cuchillo",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
            False, ["Empanadas"],
            [
                ("Masa de empanada", 1, False),
                ("Carne vacuna", 80, False),
                ("Cebolla", 20, True),
                ("Huevo", 1, True),
            ]
        ),
        (
            "Empanada de Jamón y Queso", 320, "Empanada con jamón cocido y queso derretido",
            "https://images.unsplash.com/photo-1556909172-54557c7e4fb7?w=800",
            False, ["Empanadas"],
            [
                ("Masa de empanada", 1, False),
                ("Jamón", 50, False),
                ("Muzarella", 40, True),
            ]
        ),
        # --- SANDWICHES ---
        (
            "Sandwich de Jamón y Queso", 800, "Sandwich en pan de miga con jamón, queso y mayonesa",
            "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
            False, ["Sandwiches"],
            [
                ("Pan de miga", 2, False),
                ("Jamón", 60, True),
                ("Muzarella", 40, True),
                ("Mayonesa", 20, True),
                ("Tomate", 30, True),
                ("Lechuga", 15, True),
            ]
        ),
        # --- POSTRES ---
        (
            "Brownie de Chocolate", 700, "Brownie húmedo con chocolate negro 70%",
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
            True, ["Postres"],
            []
        ),
        (
            "Mousse de Chocolate", 650, "Mousse esponjosa con crema y chocolate",
            "https://images.unsplash.com/photo-1511715282680-fbf93a50e721?w=800",
            False, ["Postres"],
            [
                ("Chocolate", 80, False),
                ("Crema", 100, False),
                ("Huevo", 2, False),
            ]
        ),
        # --- BEBIDAS ---
        (
            "Coca Cola 500ml", 500, "Gaseosa Coca Cola botella personal",
            "https://images.unsplash.com/photo-1716800586014-fea19e9453fb?q=80&w=417&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            True, ["Bebidas"],
            []
        ),
        (
            "Agua con Gas 500ml", 350, "Agua mineral con gas",
            "https://images.unsplash.com/photo-1560023907-5f339617ea30?w=800",
            True, ["Bebidas"],
            []
        ),
        (
            "Jugo de Naranja Natural", 600, "Jugo exprimido al momento",
            "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800",
            False, ["Bebidas"],
            [
                ("Jugo de naranja", 300, False),
            ]
        ),
    ]

    for nombre, precio, desc, imagen, es_terminado, cats_list, ings_list in productos:
        _agregar_producto(session, nombre, precio, desc, imagen, es_terminado, cats_list, ings_list, cats, ings)


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