import { useNavigate } from 'react-router-dom';
import { LoginForm } from '../../features/auth/LoginForm';
import { useAuthStore } from '../../store/authStore';

export default function LoginPage() {
  const loginDemo = useAuthStore((s) => s.loginDemo);
  const navigate = useNavigate();

  const handleDemo = (rol: 'CLIENT' | 'ADMIN') => {
    loginDemo(rol);
    navigate(rol === 'ADMIN' ? '/admin/dashboard' : '/store');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F3864] to-[#2E75B6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">🍔</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Food Store</h1>
          <p className="text-blue-200 mt-1 text-sm">Sistema de gestión de pedidos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar sesión</h2>
          <LoginForm />

          {/* Separador demo */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-white px-3 text-xs text-gray-400 uppercase tracking-wide">
                Acceso demo (sin backend)
              </span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => handleDemo('CLIENT')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-blue-200 hover:border-[#2E75B6] hover:bg-blue-50 transition-colors group"
            >
              <span className="text-2xl">👤</span>
              <span className="text-xs font-semibold text-[#2E75B6] group-hover:text-[#1F3864]">
                Cliente demo
              </span>
              <span className="text-[10px] text-gray-400">Ve el catálogo y carrito</span>
            </button>

            <button
              onClick={() => handleDemo('ADMIN')}
              className="flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 border-dashed border-blue-200 hover:border-[#2E75B6] hover:bg-blue-50 transition-colors group"
            >
              <span className="text-2xl">🛠️</span>
              <span className="text-xs font-semibold text-[#2E75B6] group-hover:text-[#1F3864]">
                Admin demo
              </span>
              <span className="text-[10px] text-gray-400">Panel de administración</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
