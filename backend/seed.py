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
        # nombre,               unidad,          descripcion,               es_alergeno, precio_unitario, stock_inicial
        # Sólidos → kg, stock en kg
        ("Carne vacuna",        "kilogramo",     "Medallón de carne",       False,       3500.0,  10.0),
        ("Lechuga",             "kilogramo",     "Lechuga fresca",          False,       800.0,   5.0),
        ("Tomate",              "kilogramo",     "Tomate perita",           False,       600.0,   8.0),
        ("Queso Cheddar",       "kilogramo",     "Queso cheddar",           True,        5000.0,  3.0),
        ("Harina",              "kilogramo",     "Harina 0000",             True,        400.0,   20.0),
        ("Muzarella",           "kilogramo",     "Queso muzarella",         True,        4500.0,  5.0),
        ("Albahaca",            "kilogramo",     "Albahaca fresca",         False,       2000.0,  1.0),
        ("Pepperoni",           "kilogramo",     "Pepperoni ahumado",       False,       6000.0,  3.0),
        ("Jamón",               "kilogramo",     "Jamón cocido",            False,       4000.0,  4.0),
        ("Cebolla",             "kilogramo",     "Cebolla blanca",          False,       500.0,   5.0),
        ("Panceta",             "kilogramo",     "Panceta ahumada",         False,       5500.0,  3.0),
        ("Chocolate",           "kilogramo",     "Chocolate negro 70%",     True,        8000.0,  2.0),
        ("Mayonesa",            "kilogramo",     "Mayonesa",                True,        1800.0,  3.0),
        # Líquidos → litros, stock en litros
        ("Salsa de tomate",     "litro",         "Salsa pomodoro",          False,       1200.0,  5.0),
        ("Crema",               "litro",         "Crema de leche",          True,        2000.0,  3.0),
        ("Agua con gas",        "litro",         "Agua mineral con gas",    False,       500.0,   10.0),
        ("Jugo de naranja",     "litro",         "Jugo de naranja natural", False,       800.0,   5.0),
        # Por pieza → stock en unidades
        ("Pan de burger",       "pieza",         "Pan brioche",             True,        350.0,   50.0),
        ("Huevo",               "pieza",         "Huevo de gallina",        True,        100.0,   30.0),
        ("Masa de empanada",    "pieza",         "Disco de empanada",       True,        50.0,    60.0),
        ("Pan de miga",         "pieza",         "Pan de miga blanco",      True,        80.0,    20.0),
    ]

    dict_ings = {}

    for nombre, tipo_unidad, desc, es_alergeno, precio_unitario, stock_inicial in data:
        unidad = unidades.get(tipo_unidad)
        ing = session.exec(
            select(Ingrediente).where(Ingrediente.nombre == nombre)
        ).first()

        if not ing:
            from decimal import Decimal
            ing = Ingrediente(
                nombre=nombre,
                descripcion=desc,
                es_alergeno=es_alergeno,
                unidad_medida_id=unidad.id if unidad else None,
                precio_unitario=Decimal(str(precio_unitario)),
                stock_actual=stock_inicial,
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

    from decimal import Decimal
    p = Producto(
        nombre=nombre,
        precio_base=Decimal(str(precio)) if precio is not None else Decimal("0"),
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

    # Cantidades en KG para sólidos, litros para líquidos, unidades para piezas
    # precio=None → se calcula desde ingredientes; precio=número → producto terminado con costo base fijo
    productos = [
        # --- HAMBURGUESAS ---
        (
            "Burger Clásica", None, "Hamburguesa de carne vacuna con lechuga, tomate y queso cheddar",
            "https://images.unsplash.com/photo-1568901346375-23c9450c58cd?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 0.180, False),
                ("Pan de burger", 1, False),
                ("Lechuga", 0.020, True),
                ("Tomate", 0.030, True),
                ("Queso Cheddar", 0.030, True),
            ]
        ),
        (
            "Burger BBQ", None, "Hamburguesa con panceta crocante y cebolla caramelizada",
            "https://images.unsplash.com/photo-1553979459-d2229ba7433b?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 0.200, False),
                ("Pan de burger", 1, False),
                ("Panceta", 0.040, True),
                ("Cebolla", 0.030, True),
                ("Queso Cheddar", 0.030, True),
            ]
        ),
        (
            "Doble Burger", None, "Doble medallón de carne con doble queso",
            "https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?w=800",
            False, ["Hamburguesas"],
            [
                ("Carne vacuna", 0.360, False),
                ("Pan de burger", 1, False),
                ("Queso Cheddar", 0.060, True),
                ("Lechuga", 0.020, True),
                ("Tomate", 0.030, True),
            ]
        ),
        # --- PIZZAS ---
        (
            "Pizza Margherita", None, "Pizza clásica con salsa de tomate, muzarella y albahaca",
            "https://images.unsplash.com/photo-1574071318508-1cdbab80d002?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 0.250, False),
                ("Salsa de tomate", 0.100, False),
                ("Muzarella", 0.200, True),
                ("Albahaca", 0.005, True),
            ]
        ),
        (
            "Pizza Pepperoni", None, "Pizza con pepperoni y muzarella extra",
            "https://images.unsplash.com/photo-1628840042765-356cda07504e?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 0.250, False),
                ("Salsa de tomate", 0.100, False),
                ("Muzarella", 0.200, True),
                ("Pepperoni", 0.080, True),
            ]
        ),
        (
            "Pizza Jamón y Morrones", None, "Pizza con jamón y morrones asados",
            "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=800",
            False, ["Pizzas"],
            [
                ("Harina", 0.250, False),
                ("Salsa de tomate", 0.100, False),
                ("Muzarella", 0.180, True),
                ("Jamón", 0.080, True),
            ]
        ),
        # --- EMPANADAS ---
        (
            "Empanada de Carne", None, "Empanada jugosa de carne cortada a cuchillo",
            "https://images.unsplash.com/photo-1601050690597-df0568f70950?w=800",
            False, ["Empanadas"],
            [
                ("Masa de empanada", 1, False),
                ("Carne vacuna", 0.080, False),
                ("Cebolla", 0.020, True),
                ("Huevo", 1, True),
            ]
        ),
        (
            "Empanada de Jamón y Queso", None, "Empanada con jamón cocido y queso derretido",
            "https://images.unsplash.com/photo-1549889450-0e0fb9c1d668?q=80&w=876&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            False, ["Empanadas"],
            [
                ("Masa de empanada", 1, False),
                ("Jamón", 0.050, False),
                ("Muzarella", 0.040, True),
            ]
        ),
        # --- SANDWICHES ---
        (
            "Sandwich de Jamón y Queso", None, "Sandwich en pan de miga con jamón, queso y mayonesa",
            "https://images.unsplash.com/photo-1528735602780-2552fd46c7af?w=800",
            False, ["Sandwiches"],
            [
                ("Pan de miga", 2, False),
                ("Jamón", 0.060, True),
                ("Muzarella", 0.040, True),
                ("Mayonesa", 0.020, True),
                ("Tomate", 0.030, True),
                ("Lechuga", 0.015, True),
            ]
        ),
        # --- POSTRES (terminados = costo base fijo) ---
        (
            "Brownie de Chocolate", 500, "Brownie húmedo con chocolate negro 70%",
            "https://images.unsplash.com/photo-1606313564200-e75d5e30476c?w=800",
            True, ["Postres"],
            []
        ),
        (
            "Mousse de Chocolate", None, "Mousse esponjosa con crema y chocolate",
            "https://images.unsplash.com/photo-1603032305813-be7441bc1037?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            False, ["Postres"],
            [
                ("Chocolate", 0.080, False),
                ("Crema", 0.100, False),
                ("Huevo", 2, False),
            ]
        ),
        # --- BEBIDAS (terminadas = costo base fijo) ---
        (
            "Coca Cola 500ml", 350, "Gaseosa Coca Cola botella personal",
            "https://images.unsplash.com/photo-1716800586014-fea19e9453fb?q=80&w=417&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            True, ["Bebidas"],
            []
        ),
        (
            "Agua con Gas 500ml", 180, "Agua mineral con gas",
            "https://images.unsplash.com/photo-1638688569176-5b6db19f9d2a?q=80&w=387&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
            True, ["Bebidas"],
            []
        ),
        (
            "Jugo de Naranja Natural", None, "Jugo exprimido al momento",
            "https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?w=800",
            False, ["Bebidas"],
            [
                ("Jugo de naranja", 0.300, False),
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
        session.add(Ajuste(clave="costo_envio", valor="50.00", descripcion="Costo de envío para los pedidos"))

    indice = session.exec(select(Ajuste).where(Ajuste.clave == "indice_ganancia")).first()
    if not indice:
        session.add(Ajuste(clave="indice_ganancia", valor="1.5", descripcion="Multiplicador de ganancia sobre el costo de ingredientes (ej: 1.5 = 50% de ganancia)"))

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