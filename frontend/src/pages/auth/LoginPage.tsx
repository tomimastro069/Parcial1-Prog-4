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
          <h1 className="text-3xl font-bold text-white">Food Store</h1>
          <p className="text-blue-200 mt-1 text-sm">Sistema de gestión de pedidos</p>
        </div>

        {/* Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Iniciar sesión</h2>
          <LoginForm />
        </div>
      </div>
    </div>
  );
}
