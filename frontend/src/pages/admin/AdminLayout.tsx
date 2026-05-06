import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import {
  HomeIcon,
  TagIcon,
  BeakerIcon,
  Bars3Icon,
  XMarkIcon,
  ArrowRightOnRectangleIcon,
} from '@heroicons/react/24/outline';
import { useUIStore } from '../../store/uiStore';
import { useAuthStore } from '../../store/authStore';
import { ConfirmModal } from '../../components/ConfirmModal';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: HomeIcon, end: true },
  { to: '/admin/categorias', label: 'Categorías', icon: TagIcon },
  { to: '/admin/ingredientes', label: 'Ingredientes', icon: BeakerIcon },
];

export default function AdminLayout() {
  const sidebarOpen = useUIStore((s) => s.sidebarOpen);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const closeSidebar = useUIStore((s) => s.closeSidebar);
  const usuario = useAuthStore((s) => s.usuario);
  const logout = useAuthStore((s) => s.logout);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-gray-900/50 z-40 lg:hidden"
          onClick={closeSidebar}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 w-64 bg-[#1F3864] flex flex-col transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Logo */}
        <div className="px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2">
            <span className="text-2xl">🍔</span>
            <span className="font-bold text-white text-lg">Food Store</span>
          </div>
          <button
            onClick={closeSidebar}
            className="lg:hidden text-white/60 hover:text-white"
          >
            <XMarkIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.end}
              onClick={closeSidebar}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 py-2.5 text-sm font-medium rounded-lg transition-colors ${
                  isActive
                    ? 'bg-white/15 text-white'
                    : 'text-white/70 hover:bg-white/10 hover:text-white'
                }`
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </nav>

        {/* User footer */}
        <div className="border-t border-white/10 p-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-white/20 flex items-center justify-center text-white text-sm font-semibold">
              {usuario?.nombre?.[0]?.toUpperCase() ?? 'A'}
            </div>
            <div className="min-w-0">
              <p className="text-sm font-medium text-white truncate">
                {usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Admin'}
              </p>
              <p className="text-xs text-white/50 truncate">{usuario?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 text-xs text-white/60 hover:text-white transition-colors w-full"
          >
            <ArrowRightOnRectangleIcon className="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="sticky top-0 z-30 h-14 bg-white border-b border-gray-200 flex items-center px-4 lg:hidden shadow-sm">
          <button
            onClick={toggleSidebar}
            className="p-2 -ml-2 text-gray-500 hover:text-gray-700"
          >
            <Bars3Icon className="w-6 h-6" />
          </button>
          <span className="font-semibold text-[#1F3864] ml-2">🍔 Food Store Admin</span>
        </header>

        <main className="flex-1 p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>

      <ConfirmModal />
    </div>
  );
}
