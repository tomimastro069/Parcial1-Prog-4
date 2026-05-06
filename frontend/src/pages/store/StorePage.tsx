import { ShoppingBagIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { CatalogoGrid } from '../../features/store/CatalogoGrid';
import { CartDrawer } from '../../features/store/CartDrawer';
import { ConfirmModal } from '../../components/ConfirmModal';
import { useCartStore } from '../../store/cartStore';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';

export default function StorePage() {
  const itemCount = useCartStore((s) => s.itemCount());
  const openCart = useUIStore((s) => s.openCart);
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-bold text-[#1F3864] text-lg hidden sm:block">Food Store</span>
          </div>

          <div className="flex items-center gap-3">
            {usuario && (
              <span className="text-sm text-gray-600 hidden sm:block">
                Hola, <strong>{usuario.nombre}</strong>
              </span>
            )}

            {/* Carrito */}
            <button
              onClick={openCart}
              className="relative p-2 rounded-lg hover:bg-gray-100 transition-colors"
            >
              <ShoppingCartIcon className="w-6 h-6 text-[#2E75B6]" />
              {itemCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-[#2E75B6] text-white text-xs rounded-full flex items-center justify-center font-bold">
                  {itemCount > 9 ? '9+' : itemCount}
                </span>
              )}
            </button>

            {/* Logout */}
            <button
              onClick={() => logout()}
              className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
              title="Cerrar sesión"
            >
              <ArrowRightOnRectangleIcon className="w-5 h-5" />
            </button>
          </div>
        </div>
      </header>

      {/* Contenido */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex items-center gap-3 mb-6">
          <ShoppingBagIcon className="w-7 h-7 text-[#2E75B6]" />
          <div>
            <h1 className="text-2xl font-bold text-[#1F3864]">Menú</h1>
            <p className="text-sm text-gray-500">Explorá nuestros productos</p>
          </div>
        </div>

        <CatalogoGrid />
      </main>

      <CartDrawer />
      <ConfirmModal />
    </div>
  );
}
