import { useMutation } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';
import type { LoginRequest, RegisterRequest } from '../types';
import { authApi } from '../api/authApi';

export function useLogin() {
  const login = useAuthStore((s) => s.login);
  const hasRole = useAuthStore((s) => s.hasRole);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: (creds: LoginRequest) => login(creds),
    onSuccess: () => {
      if (hasRole('CLIENT') && !hasRole('ADMIN') && !hasRole('STOCK') && !hasRole('PEDIDOS')) {
        navigate('/store');
      } else {
        navigate('/admin/dashboard');
      }
    },
    onError: () => {
      toast.error('Credenciales inválidas. Verificá tu email y contraseña.');
    },
  });
}

export function useRegister() {
  const login = useAuthStore((s) => s.login);
  const navigate = useNavigate();

  return useMutation({
    mutationFn: async (data: RegisterRequest) => {
      await authApi.register(data);
      await login({ email: data.email, password: data.password });
    },
    onSuccess: () => {
      navigate('/store');
      toast.success('Cuenta creada correctamente');
    },
    onError: (err: unknown) => {
      const msg =
        (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
      
      if (msg?.toLowerCase().includes('ya está registrado') || msg?.includes('400')) {
        toast.error('Este email ya tiene una cuenta asociada.');
      } else {
        toast.error('Error al registrarse. Revisá los datos e intentá de nuevo.');
      }
    },
  });
}
