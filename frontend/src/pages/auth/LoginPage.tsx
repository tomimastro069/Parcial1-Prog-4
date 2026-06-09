import { Link, useNavigate } from 'react-router-dom';
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
    <div className="min-h-screen bg-gradient-to-br from-espresso via-bark to-walnut flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <p className="font-baskerville italic text-sand text-sm mb-1">bienvenido a</p>
          <h1 className="font-baskerville text-4xl font-bold text-tan tracking-[-0.01em]">Food store</h1>
          <div className="w-10 h-px bg-gold/60 mx-auto my-4" />
          <p className="eyebrow text-[#8B7355]">Sistema de pedidos</p>
        </div>

        {/* Card */}
        <div className="bg-cream-soft rounded-2xl shadow-xl p-8 border border-line">
          <h2 className="font-baskerville text-xl font-bold text-coffee mb-6">Iniciar sesión</h2>
          <LoginForm />
        </div>

        <div className="text-center mt-6">
          <Link
            to="/menu"
            className="inline-flex items-center gap-2 font-inconsolata tracking-[0.08em] uppercase text-sm text-tan/80 hover:text-tan transition-colors"
          >
            <span>←</span> Volver al menú
          </Link>
        </div>
      </div>
    </div>
  );
}
