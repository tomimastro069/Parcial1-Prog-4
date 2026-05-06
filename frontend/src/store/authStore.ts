import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { UserResponse, LoginRequest } from '../types';
import { authApi } from '../api/authApi';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  usuario: UserResponse | null;
  isAuthenticated: boolean;

  login: (credentials: LoginRequest) => Promise<void>;
  loginDemo: (rol: 'CLIENT' | 'ADMIN') => void;
  logout: () => Promise<void>;
  setUsuario: (u: UserResponse) => void;
  hasRole: (role: string) => boolean;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      usuario: null,
      isAuthenticated: false,

      login: async (credentials) => {
        const data = await authApi.login(credentials);
        set({
          accessToken: data.access_token,
          refreshToken: data.refresh_token,
          isAuthenticated: true,
        });
        // Cargar datos del usuario tras login
        const usuario = await authApi.me();
        set({ usuario });
      },

      loginDemo: (rol) => {
        const isAdmin = rol === 'ADMIN';
        set({
          accessToken: 'demo-token',
          refreshToken: 'demo-refresh',
          isAuthenticated: true,
          usuario: {
            id: 1,
            nombre: isAdmin ? 'Admin' : 'Cliente',
            apellido: 'Demo',
            email: isAdmin ? 'admin@foodstore.com' : 'cliente@foodstore.com',
            roles: isAdmin ? ['ADMIN'] : ['CLIENT'],
            created_at: new Date().toISOString(),
          },
        });
      },

      logout: async () => {
        const { refreshToken } = get();
        try {
          if (refreshToken) await authApi.logout(refreshToken);
        } catch {
          // Si falla, limpiar de todas formas
        }
        set({ accessToken: null, refreshToken: null, usuario: null, isAuthenticated: false });
      },

      setUsuario: (usuario) => set({ usuario }),

      hasRole: (role) => get().usuario?.roles.includes(role) ?? false,
    }),
    {
      name: 'foodstore-auth',
      // Solo persistir tokens, no el objeto usuario completo
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
