import axios from 'axios';

const BASE_URL = import.meta.env.VITE_API_URL ?? 'http://localhost:8000';

const axiosClient = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
  timeout: 10000,
  withCredentials: true,
});

// Inyectar Bearer token en cada request
axiosClient.interceptors.request.use((config) => {
  // Importación dinámica para evitar circular dependency con el store
  const raw = localStorage.getItem('foodstore-auth');
  if (raw) {
    try {
      const parsed = JSON.parse(raw);
      const token: string | null = parsed?.state?.accessToken ?? null;
      if (token) config.headers.Authorization = `Bearer ${token}`;
    } catch {
      // token corrupto, ignorar
    }
  }
  return config;
});

// Manejar 401 → limpiar sesión
axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('foodstore-auth');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;
