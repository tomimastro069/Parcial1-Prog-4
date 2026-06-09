import { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeftIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import { Skeleton } from '../../components/Skeleton';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useProducto } from '../../hooks/useProductos';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { data: producto, isLoading, isError } = useProducto(Number(id));

  const addItem = useCartStore((s) => s.addItem);
  const openCart = useUIStore((s) => s.openCart);

  const [cantidad, setCantidad] = useState(1);

  const items = useCartStore((s) => s.items);
  const enCarrito = items.find((i) => i.producto_id === producto?.id);
  const cantidadEnCarrito = enCarrito?.cantidad ?? 0;
  const stockDisponible = (producto?.stock_calculado ?? 0) - cantidadEnCarrito;

  const handleAgregar = () => {
    if (!producto) return;
    if (cantidad > stockDisponible) {
      return;
    }
    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad,
      stock: producto.stock_calculado,
      imagen_url: producto.imagen_url,
    });
    setCantidad(1);
    openCart();
  };

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8">
        <Skeleton className="h-64 w-full rounded-xl mb-6" />
        <Skeleton className="h-8 w-1/2 mb-3" />
        <Skeleton className="h-4 w-full mb-2" />
        <Skeleton className="h-4 w-3/4" />
      </div>
    );
  }

  if (isError || !producto) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-8 text-center">
        <p className="text-clay">No se encontró el producto.</p>
        <button onClick={() => navigate('/store')} className="mt-3 text-walnut hover:underline">
          Volver al catálogo
        </button>
      </div>
    );
  }

  const alergenosDelProducto = producto.ingredientes?.filter((ing) => ing.es_alergeno) ?? [];

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
      <button
        onClick={() => navigate('/store')}
        className="flex items-center gap-2 text-sm text-sand hover:text-bark mb-6"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver al menú
      </button>

      <div className="bg-cream-soft rounded-2xl shadow-sm border border-line overflow-hidden" style={{ animation: 'slideUp 0.3s ease-out' }}>
        <div className="md:flex">
          {/* Imagen */}
          <div className="md:w-96 h-64 md:h-auto bg-cream-deep flex-shrink-0">
            {producto.imagen_url ? (
              <img
                src={producto.imagen_url}
                alt={producto.nombre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="text-6xl">🍔</span>
              </div>
            )}
          </div>

          {/* Info */}
          <div className="flex-1 p-6 md:p-8">
            <div className="flex items-start justify-between gap-4">
              <h1 className="font-baskerville text-3xl font-bold text-coffee tracking-[-0.01em]">{producto.nombre}</h1>
              {!producto.is_active && (
                <Badge variant="sinstock">Sin stock</Badge>
              )}
            </div>

            {producto.descripcion && (
              <p className="font-baskerville italic text-clay mt-3 text-sm leading-relaxed">{producto.descripcion}</p>
            )}

            <div className="mt-4 font-baskerville text-3xl font-bold text-walnut">
              ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
            </div>

            {/* Alérgenos */}
            {alergenosDelProducto.length > 0 && (
              <div className="mt-4">
                <p className="text-xs font-semibold text-orange-600 uppercase tracking-wide mb-2">
                  ! Contiene alérgenos
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {alergenosDelProducto.map((ing) => (
                    <Badge key={ing.id} variant="alergeno">
                      {ing.nombre}
                    </Badge>
                  ))}
                </div>
              </div>
            )}

            {/* Ingredientes */}
            {producto.ingredientes && producto.ingredientes.length > 0 && (
              <div className="mt-5">
                <p className="text-sm font-medium text-bark mb-2">Ingredientes</p>
                <div className="flex flex-wrap gap-1.5">
                  {producto.ingredientes.map((ing) => (
                    <span
                      key={ing.id}
                      className={`inline-flex items-center gap-1 text-xs rounded-full px-2.5 py-1 ${ing.es_alergeno
                          ? 'bg-orange-50 text-orange-700 border border-orange-200'
                          : 'bg-cream-deep text-clay border border-line'
                        }`}
                    >
                      {ing.nombre}
                      {ing.es_alergeno && ' ! '}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Cantidad y botón */}
            <div className="mt-6 flex items-center gap-4">
              <div className="flex items-center gap-2 border border-line bg-cream rounded-lg px-3 py-2">
                <button
                  onClick={() => setCantidad((c) => Math.max(1, c - 1))}
                  className="text-clay hover:text-bark font-bold w-5 text-center"
                >
                  −
                </button>
                <span className="text-sm font-medium w-6 text-center text-bark">{cantidad}</span>
                <button
                  onClick={() => setCantidad((c) => Math.min(c + 1, stockDisponible))}
                  disabled={cantidad >= stockDisponible}
                  className="text-clay hover:text-bark font-bold w-5 text-center disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  +
                </button>
              </div>

              <Button
                variant="brand"
                onClick={handleAgregar}
                disabled={!producto.disponible || stockDisponible <= 0}
                size="lg"
                className="flex-1 gap-2"
              >
                <ShoppingCartIcon className="w-5 h-5" />
                {stockDisponible <= 0 && cantidadEnCarrito > 0
                  ? 'Stock máximo en carrito'
                  : `Agregar al carrito · $${(producto.precio * cantidad).toLocaleString('es-AR')}`}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
