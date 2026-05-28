import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { HomeIcon, ClipboardDocumentListIcon, UserCircleIcon, ArrowRightOnRectangleIcon } from '@heroicons/react/24/outline';
import { ShoppingCartIcon } from '@heroicons/react/24/solid';
import { useAuthStore } from '../store/authStore';
import { useCartStore } from '../store/cartStore';
import { useUIStore } from '../store/uiStore';
import logoRestaurante from '../assets/restaurante.png';
export default function Header() {
  const navigate = useNavigate();
  const usuario = useAuthStore(s => s.usuario);
  const logout = useAuthStore(s => s.logout);
  const itemCount = useCartStore(s => s.itemCount());
  const openCart = useUIStore(s => s.openCart);

  return (
    <header className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-2xl">
            <img
              src={logoRestaurante}
              alt="Logo"
              className="w-[50px] h-[50px] object-contain"
            />
          </span>
          <span className="font-bold text-[#1F3864] text-lg hidden sm:block">Food Store</span>
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/store')} className="p-2 rounded-lg hover:bg-gray-100 transition-colors">
            <HomeIcon className="w-6 h-6 text-[#2E75B6]" />
          </button>
          {usuario && (
            <span className="text-sm text-gray-600 hidden sm:block">
              Hola, <strong>{usuario.nombre}</strong>
            </span>
          )}
          <Link
            to="/store/mis-pedidos"
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors hidden sm:flex items-center gap-2"
            title="Mis Pedidos"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 text-[#2E75B6]" />
            <span className="text-sm font-medium text-[#2E75B6]">Mis Pedidos</span>
          </Link>
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
          <button
            onClick={() => navigate('/store/perfil')}
            className="p-2 rounded-lg hover:bg-gray-100 transition-colors"
            title="Perfil"
          >
            <UserCircleIcon className="w-6 h-6 text-[#2E75B6]" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 transition-colors"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
