import { Link } from 'react-router-dom';
import { useForm } from '@tanstack/react-form';
import { useRegister } from '../../hooks/useAuth';
import { Button } from '../../components/Button';

export function RegisterForm() {
  const register = useRegister();

  const form = useForm({
    defaultValues: {
      nombre: '',
      apellido: '',
      email: '',
      password: '',
      confirmarPassword: '',
    },
    onSubmit: async ({ value }) => {
      const { confirmarPassword: _, ...data } = value;
      void _;
      await register.mutateAsync(data);
    },
  });

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        form.handleSubmit();
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-2 gap-4">
        <form.Field
          name="nombre"
          validators={{
            onChange: ({ value }) =>
              !value || value.length < 2 ? 'Mínimo 2 caracteres' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Nombre</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
              />
              {field.state.meta.isTouched && field.state.meta.errors[0] && (
                <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>

        <form.Field
          name="apellido"
          validators={{
            onChange: ({ value }) =>
              !value || value.length < 2 ? 'Mínimo 2 caracteres' : undefined,
          }}
        >
          {(field) => (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Apellido</label>
              <input
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                onBlur={field.handleBlur}
                className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
              />
              {field.state.meta.isTouched && field.state.meta.errors[0] && (
                <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
              )}
            </div>
          )}
        </form.Field>
      </div>

      <form.Field
        name="email"
        validators={{
          onChange: ({ value }) =>
            !value
              ? 'Requerido'
              : !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
              ? 'Email inválido'
              : undefined,
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Email</label>
            <input
              type="email"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            />
            {field.state.meta.isTouched && field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="password"
        validators={{
          onChange: ({ value }) =>
            value.length < 8 ? 'Mínimo 8 caracteres' : undefined,
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Contraseña</label>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            />
            {field.state.meta.isTouched && field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <form.Field
        name="confirmarPassword"
        validators={{
          onChangeListenTo: ['password'],
          onChange: ({ value, fieldApi }) => {
            const pwd = fieldApi.form.getFieldValue('password');
            return value !== pwd ? 'Las contraseñas no coinciden' : undefined;
          },
        }}
      >
        {(field) => (
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Confirmar contraseña
            </label>
            <input
              type="password"
              value={field.state.value}
              onChange={(e) => field.handleChange(e.target.value)}
              onBlur={field.handleBlur}
              className="w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            />
            {field.state.meta.isTouched && field.state.meta.errors[0] && (
              <p className="mt-1 text-xs text-red-600">{field.state.meta.errors[0]}</p>
            )}
          </div>
        )}
      </form.Field>

      <Button type="submit" loading={register.isPending} className="w-full py-2.5 mt-2">
        Crear cuenta
      </Button>

      <p className="text-center text-sm text-gray-600">
        ¿Ya tenés cuenta?{' '}
        <Link to="/login" className="text-[#2E75B6] hover:underline font-medium">
          Iniciar sesión
        </Link>
      </p>
    </form>
  );
}
