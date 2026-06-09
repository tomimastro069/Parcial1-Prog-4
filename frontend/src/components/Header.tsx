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
    <header className="sticky top-0 z-30 bg-cream/95 backdrop-blur border-b border-line shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        <button onClick={() => navigate('/')} className="flex items-center gap-2.5 cursor-pointer">
          <span className="text-2xl">
            <img
              src={logoRestaurante}
              alt="Logo"
              className="w-[50px] h-[50px] object-contain"
            />
          </span>
          <span className="font-baskerville font-bold text-coffee text-lg hidden sm:block tracking-[-0.01em]">Food Store</span>
        </button>
        <div className="flex items-center gap-3">
          <button onClick={() => navigate('/store')} className="p-2 rounded-lg hover:bg-cream-deep transition-colors">
            <HomeIcon className="w-6 h-6 text-walnut" />
          </button>
          {usuario && (
            <span className="text-sm text-clay hidden sm:block">
              Hola, <strong className="text-bark">{usuario.nombre}</strong>
            </span>
          )}
          <Link
            to="/store/mis-pedidos"
            className="p-2 rounded-lg hover:bg-cream-deep transition-colors hidden sm:flex items-center gap-2"
            title="Mis Pedidos"
          >
            <ClipboardDocumentListIcon className="w-6 h-6 text-walnut" />
            <span className="text-sm font-medium text-walnut">Mis Pedidos</span>
          </Link>
          <button
            onClick={openCart}
            className="relative p-2 rounded-lg hover:bg-cream-deep transition-colors"
          >
            <ShoppingCartIcon className="w-6 h-6 text-walnut" />
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-walnut text-tan text-xs rounded-full flex items-center justify-center font-bold">
                {itemCount > 9 ? '9+' : itemCount}
              </span>
            )}
          </button>
          <button
            onClick={() => navigate('/store/perfil')}
            className="p-2 rounded-lg hover:bg-cream-deep transition-colors"
            title="Perfil"
          >
            <UserCircleIcon className="w-6 h-6 text-walnut" />
          </button>
          <button
            onClick={logout}
            className="p-2 rounded-lg text-sand hover:text-bark hover:bg-cream-deep transition-colors"
            title="Cerrar sesión"
          >
            <ArrowRightOnRectangleIcon className="w-5 h-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
