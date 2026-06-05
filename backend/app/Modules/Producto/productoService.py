import math
from sqlmodel import select, func
from fastapi import HTTPException, status
from decimal import Decimal
from app.Modules.Producto.Model.producto import Producto
from app.Modules.Producto.Model.productoCategoria import ProductoCategoria
from app.Modules.Producto.productoSchema import (
    ProductoCreate,
    ProductoUpdate,
    ProductoRead,
    CategoriaEnProducto,
    IngredienteEnProducto,
)
from app.Core.UnitOfWork.unit_of_work import UnitOfWork
from app.Modules.Auditoria.auditoria import Auditoria
from app.Modules.UnidadMedida.unidadMedida import UnidadMedida
from app.Core.ws_broadcast import broadcast_sync

class ProductoService:
    def __init__(self, uow: UnitOfWork):
        self.uow = uow
        self._indice_cache: float | None = None

    def _get_indice_ganancia(self) -> float:
        if self._indice_cache is not None:
            return self._indice_cache
        ajuste = self.uow.ajustes.get_by_clave("indice_ganancia")
        try:
            self._indice_cache = float(ajuste.valor) if ajuste else 1.5
        except (ValueError, AttributeError):
            self._indice_cache = 1.5
        return self._indice_cache

    def _calcular_stock(self, p: Producto, pis: list) -> int:
        """Calcula cuántas unidades se pueden fabricar según el stock de ingredientes."""
        if p.es_terminado:
            return p.stock_cantidad  # usa el stock manual del producto

        if not pis:
            return 0

        min_unidades = float('inf')
        for pi in pis:
            ing = self.uow.ingredientes.get(pi.ingrediente_id)
            if not ing or pi.cantidad <= 0:
                return 0
            if not ing.is_active:
                return 0  # ingrediente inactivo = sin stock
            unidades_posibles = int(ing.stock_actual / pi.cantidad)
            min_unidades = min(min_unidades, unidades_posibles)

        return int(min_unidades) if min_unidades != float('inf') else 0

    def _calcular_precio(self, p: Producto, pis: list) -> float:
        """Calcula el precio de venta al vuelo."""
        if p.es_terminado:
            # Producto terminado: precio_base × indice_ganancia
            return round(float(p.precio_base) * self._get_indice_ganancia(), 2)
        else:
            # Producto elaborado: Σ(precio_unitario_ing × cantidad) × indice_ganancia
            costo_total = 0.0
            for pi in pis:
                ing = self.uow.ingredientes.get(pi.ingrediente_id)
                if ing:
                    costo_total += float(ing.precio_unitario) * float(pi.cantidad)
            return round(costo_total * self._get_indice_ganancia(), 2)

    def _build_read(self, p: Producto) -> ProductoRead:
        """Construye el schema de lectura con datos de categorías e ingredientes."""
        pcs = self.uow.productos.list_categorias_rel(p.id)
        categorias = [
            CategoriaEnProducto(
                id=cat.id, 
                nombre=cat.nombre, 
                full_path=self.uow.categorias.get_full_path(cat.id)
            )
            for pc in pcs
            if (cat := self.uow.categorias.get(pc.categoria_id))
        ]

        pis = self.uow.productos.list_ingredientes_rel(p.id)
        ingredientes = []
        for pi in pis:
            ing = self.uow.ingredientes.get(pi.ingrediente_id)
            if ing:
                # Intentamos obtener el símbolo de la unidad de medida
                unidad_simbolo = "u"
                if ing.unidad_medida_id:
                    um = self.uow.session.get(UnidadMedida, ing.unidad_medida_id)
                    if um:
                        unidad_simbolo = um.simbolo
                
                ingrediente_read = IngredienteEnProducto(
                    id=ing.id,
                    nombre=ing.nombre,
                    unidad=unidad_simbolo,
                    cantidad=pi.cantidad,
                    es_alergeno=ing.es_alergeno,
                    descripcion=ing.descripcion,
                )
                ingredientes.append(ingrediente_read)

        precio_calculado = self._calcular_precio(p, pis)
        stock_calculado = self._calcular_stock(p, pis)

        return ProductoRead(
            id=p.id,
            nombre=p.nombre,
            precio=precio_calculado,
            descripcion=p.descripcion,
            imagen_url=p.imagenes_url[0] if p.imagenes_url else None,
            is_active=p.is_active,
            es_terminado=p.es_terminado,
            disponible=p.disponible and stock_calculado > 0,
            stock_calculado=stock_calculado,
            categorias=categorias,
            ingredientes=ingredientes,
        )

    def get_all_paginated(
        self,
        page: int = 1,
        size: int = 12,
        search: str | None = None,
        categoria_id: int | None = None,
        is_active: bool | None = None,
    ) -> dict:
        with self.uow:
            page = max(1, page)
            offset = max(0, (page - 1) * size)
            
            productos, total = self.uow.productos.search(
                search_term=search,
                categoria_id=categoria_id,
                offset=offset,
                limit=size,
                is_active=is_active
            )

            return {
                "items": [self._build_read(p) for p in productos],
                "total": total,
                "page": page,
                "size": size,
                "pages": max(1, math.ceil(total / size)),
            }

    def get_by_id(self, producto_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )
            return self._build_read(p)

    def _validar_categorias(self, categorias: list[int]) -> None:
        for cat_id in categorias:
            cat = self.uow.categorias.get(cat_id)
            if not cat or not cat.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Categoría con id {cat_id} no encontrada",
                )

    def _validar_ingredientes(self, ingredientes: list) -> None:
        for ing_input in ingredientes:
            ing = self.uow.ingredientes.get(ing_input.ingrediente_id)
            if not ing or not ing.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Ingrediente con id {ing_input.ingrediente_id} no encontrado",
                )

    def create(self, data: ProductoCreate, user_id: int) -> ProductoRead:
        with self.uow:
            self._validar_categorias(data.categorias)
            self._validar_ingredientes(data.ingredientes)

            if data.es_terminado and not data.precio_base:
                from fastapi import HTTPException, status as http_status
                raise HTTPException(
                    status_code=http_status.HTTP_400_BAD_REQUEST,
                    detail="Los productos terminados requieren un precio base."
                )

            p = Producto(
                nombre=data.nombre,
                precio_base=Decimal(str(data.precio_base)) if data.precio_base else Decimal("0"),
                descripcion=data.descripcion,
                es_terminado=data.es_terminado,
                imagenes_url=[data.imagen_url] if data.imagen_url else None,
            )
            self.uow.productos.add(p)

            for cat_id in data.categorias:
                rel = self.uow.productos.add_categoria_rel(producto_id=p.id, categoria_id=cat_id)
                p.producto_categorias.append(rel)

            for ing_input in data.ingredientes:
                ing = self.uow.ingredientes.get(ing_input.ingrediente_id)
                rel = self.uow.productos.add_ingrediente_rel(
                    producto_id=p.id,
                    ingrediente_id=ing_input.ingrediente_id,
                    cantidad=ing_input.cantidad,
                    unidad_medida_id=ing.unidad_medida_id
                )
                p.producto_ingredientes.append(rel)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_CREAR",
                modulo="PRODUCTOS",
                descripcion=f"Se creó el producto: {p.nombre}",
                metadata_info={"id": p.id, "precio": float(p.precio_base)}
            ))

            result = self._build_read(p)
        broadcast_sync("producto.actualizado", {"producto_id": p.id})
        return result

    def update(self, producto_id: int, data: ProductoUpdate, user_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )

            # Actualizar campos básicos
            campos_base = data.model_dump(exclude_unset=True, exclude={"categorias", "ingredientes", "imagen_url"})
            for key, val in campos_base.items():
                if key == "precio_base" and val is not None:
                    p.precio_base = Decimal(str(val))
                else:
                    setattr(p, key, val)

            if data.imagen_url is not None:
                p.imagenes_url = [data.imagen_url]

            # Sincronizar categorías
            if data.categorias is not None:
                self._validar_categorias(data.categorias)
                self.uow.productos.clear_categorias_rel(producto_id)
                p.producto_categorias = []
                for cat_id in data.categorias:
                    rel = self.uow.productos.add_categoria_rel(producto_id=producto_id, categoria_id=cat_id)
                    p.producto_categorias.append(rel)

            # Sincronizar ingredientes
            if data.ingredientes is not None:
                self._validar_ingredientes(data.ingredientes)
                self.uow.productos.clear_ingredientes_rel(producto_id)
                p.producto_ingredientes = []
                for ing_input in data.ingredientes:
                    ing = self.uow.ingredientes.get(ing_input.ingrediente_id)
                    rel = self.uow.productos.add_ingrediente_rel(
                        producto_id=producto_id,
                        ingrediente_id=ing_input.ingrediente_id,
                        cantidad=ing_input.cantidad,
                        unidad_medida_id=ing.unidad_medida_id
                    )
                    p.producto_ingredientes.append(rel)

            # AUDITORÍA
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_ACTUALIZAR",
                modulo="PRODUCTOS",
                descripcion=f"Se actualizó el producto: {p.nombre}",
                metadata_info={"id": p.id, "cambios": data.model_dump(exclude_unset=True)}
            ))
            broadcast_sync("precio.terminado.actualizado", {"producto_id": p.id})
            broadcast_sync("producto.actualizado", {"producto_id": p.id})
            return self._build_read(p)

    def delete(self, producto_id: int, user_id: int) -> None:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )
            
            # Auditoría antes de desactivar para tener el nombre
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_ELIMINAR",
                modulo="PRODUCTOS",
                descripcion=f"Se eliminó lógicamente el producto: {p.nombre}",
                metadata_info={"id": p.id}
            ))

            self.uow.productos.clear_categorias_rel(producto_id)
            self.uow.productos.clear_ingredientes_rel(producto_id)
            p.is_active = False

        broadcast_sync("producto.eliminado", {"producto_id": producto_id})

    def ajustar_stock(self, producto_id: int, cantidad: int, user_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p or not p.is_active:
                raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Producto no encontrado")
            if not p.es_terminado:
                raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Solo productos terminados tienen stock manual")
            p.stock_cantidad = max(0, p.stock_cantidad + cantidad)
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_STOCK",
                modulo="PRODUCTOS",
                descripcion=f"Stock ajustado en {cantidad:+} para '{p.nombre}'. Nuevo stock: {p.stock_cantidad}",
                metadata_info={"id": p.id, "ajuste": cantidad, "nuevo_stock": p.stock_cantidad}
            ))
            broadcast_sync("precio.terminado.actualizado", {"producto_id": p.id})
            return self._build_read(p)
            

    def activar(self, producto_id: int, user_id: int) -> ProductoRead:
        with self.uow:
            p = self.uow.productos.get(producto_id)
            if not p:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail=f"Producto con id {producto_id} no encontrado",
                )
            p.is_active = True
            self.uow.auditoria.add(Auditoria(
                user_id=user_id,
                accion="PRODUCTO_ACTIVAR",
                modulo="PRODUCTOS",
                descripcion=f"Se reactivó el producto: {p.nombre}",
                metadata_info={"id": p.id}
            ))
            result = self._build_read(p)
        broadcast_sync("producto.actualizado", {"producto_id": producto_id})
        return result
