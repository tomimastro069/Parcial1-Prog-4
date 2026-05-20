import { ArrowRightOnRectangleIcon, ClipboardDocumentListIcon, ShoppingBagIcon, ShoppingCartIcon } from '@heroicons/react/24/outline';
import Header from '../../components/Header';
import { Link } from 'react-router-dom';
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
      <Header />

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
