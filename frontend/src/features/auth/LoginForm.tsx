import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useLogin } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

export function LoginForm() {
  const login = useLogin();
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');

  const form = useForm({
    defaultValues: { email: '', password: '' },
    onSubmit: async ({ value }) => {
      try {
        setError('');
        await login.mutateAsync(value);
      } catch (e: any) {
        const detail = e.response?.data?.detail;
        if (e.response?.status === 403 && detail === 'Usuario inactivo') {
          setError('Tu cuenta está desactivada. Contactá a un administrador para reactivarla.');
        } else {
          setError(typeof detail === 'string' ? detail : 'Credenciales incorrectas');
        }
      }
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-5"
    >
      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'El email es requerido'
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? 'Email inválido'
              : undefined,
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Email
            </label>
            <input
              type="email"
              autoComplete="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              placeholder="tu@email.com"
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none transition"
            />
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'La contraseña es requerida'
              : value.length < 8
              ? 'Mínimo 8 caracteres'
              : undefined,
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Contraseña
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                autoComplete="current-password"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                placeholder="••••••••"
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm pr-10 focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none transition"
              />
              <button
                type="button"
                onClick={() => setShowPassword((p) => !p)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                )}
              </button>
            </div>
            {field.state.meta.isTouched && field.state.meta.errors.length > 0 && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-lg px-4 py-3">
          {error}
        </div>
      )}

      <Button
        type="submit"
        loading={login.isPending}
        className="w-full py-2.5"
      >
        Iniciar sesión
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿No tenés cuenta?{' '}
        <Link to="/register" className="text-[#2E75B6] hover:underline font-medium">
          Registrate
        </Link>
      </p>
    </form>
  );
}
