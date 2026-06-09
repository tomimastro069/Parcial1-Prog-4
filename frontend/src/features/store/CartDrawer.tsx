import { Link } from 'react-router-dom';
import { XMarkIcon, TrashIcon } from '@heroicons/react/24/outline';
import { ShoppingBagIcon } from '@heroicons/react/24/solid';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { Button } from '../../components/Button';

export function CartDrawer() {
  const cartOpen = useUIStore((s) => s.cartOpen);
  const closeCart = useUIStore((s) => s.closeCart);
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const items = useCartStore((s) => s.items);
  const removeItem = useCartStore((s) => s.removeItem);
  const updateCantidad = useCartStore((s) => s.updateCantidad);
  const clearCart = useCartStore((s) => s.clearCart);
  const subtotal = useCartStore((s) => s.subtotal());
  const costoEnvio = useCartStore((s) => s.costoEnvio());
  const total = useCartStore((s) => s.total());

  return (
    <>
      {/* Overlay */}
      <div
        className={`fixed inset-0 bg-gray-900/40 z-40 transition-opacity duration-300 ${cartOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
          }`}
        onClick={closeCart}
      />

      {/* Drawer */}
      <div
        className={`fixed right-0 top-0 bottom-0 w-full max-w-sm bg-cream z-50 flex flex-col shadow-2xl transition-transform duration-300 ease-in-out ${cartOpen ? 'translate-x-0' : 'translate-x-full'
          }`}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-line">
          <div className="flex items-center gap-2">
            <ShoppingBagIcon className="w-5 h-5 text-walnut" />
            <h2 className="font-baskerville font-bold text-coffee">
              Carrito ({items.length})
            </h2>
          </div>
          <button
            onClick={closeCart}
            className="p-1.5 rounded-md text-gray-400 hover:text-gray-600 hover:bg-gray-100"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Items */}
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {items.length === 0 ? (
            <div className="text-center py-12">
              <ShoppingBagIcon className="w-12 h-12 text-gray-200 mx-auto mb-3" />
              <p className="text-gray-500 text-sm">Tu carrito está vacío</p>
            </div>
          ) : (
            items.map((item) => (
              <div
                key={item.producto_id}
                className="flex gap-3 bg-cream-soft border border-line rounded-lg p-3"
              >
                {/* Imagen */}
                <div className="w-14 h-14 rounded-md bg-gray-200 flex-shrink-0 overflow-hidden">
                  {item.imagen_url ? (
                    <img
                      src={item.imagen_url}
                      alt={item.nombre}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">

                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-bark truncate">{item.nombre}</p>
                  <p className="text-xs text-sand">
                    ${item.precio.toLocaleString('es-AR')} c/u
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    <button
                      onClick={() => updateCantidad(item.producto_id, item.cantidad - 1)}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100"
                    >
                      −
                    </button>
                    <span className="text-sm font-medium w-5 text-center">{item.cantidad}</span>
                    <button
                      onClick={() => updateCantidad(item.producto_id, item.cantidad + 1)}
                      disabled={item.cantidad >= (item.stock ?? Infinity)}
                      className="w-6 h-6 rounded border border-gray-300 flex items-center justify-center text-gray-600 hover:bg-gray-100 disabled:opacity-30 disabled:cursor-not-allowed"
                    >
                      +
                    </button>
                    {item.stock != null && item.cantidad >= item.stock && (
                      <span className="text-[10px] text-orange-600 font-medium">Máx.</span>
                    )}
                  </div>
                </div>

                {/* Precio + eliminar */}
                <div className="flex flex-col items-end justify-between">
                  <button
                    onClick={() => removeItem(item.producto_id)}
                    className="text-gray-400 hover:text-red-500"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                  <span className="font-baskerville text-sm font-bold text-walnut">
                    ${(item.precio * item.cantidad).toLocaleString('es-AR')}
                  </span>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Footer con totales */}
        {items.length > 0 && (
          <div className="border-t border-line p-4 space-y-4">
            <div className="space-y-1.5 text-sm">
              <div className="flex justify-between text-clay">
                <span>Subtotal</span>
                <span>${subtotal.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between text-clay">
                <span>Costo de envío</span>
                <span>${costoEnvio.toLocaleString('es-AR')}</span>
              </div>
              <div className="flex justify-between font-baskerville font-bold text-coffee text-base pt-1 border-t border-line">
                <span>Total</span>
                <span>${total.toLocaleString('es-AR')}</span>
              </div>
            </div>

            <div className="space-y-2">
              <Link to="/store/checkout" onClick={closeCart}>
                <Button variant="brand" className="w-full">Ir al checkout</Button>
              </Link>
              <button
                onClick={() =>
                  openConfirm(
                    'Vaciar carrito',
                    '¿Estás seguro que querés vaciar el carrito?',
                    clearCart
                  )
                }
                className="w-full text-sm text-sand hover:text-bark py-1.5"
              >
                Vaciar carrito
              </button>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
