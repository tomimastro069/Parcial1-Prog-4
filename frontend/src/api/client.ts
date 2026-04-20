import axios from 'axios';

// ─── Cliente base de Axios ──────────────────────────────────────────────────
// La URL base es configurable. En desarrollo usa el proxy de Vite (/api).
// En producción, cambiar a la URL del backend desplegado.
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000,
});

// ─── Interceptor de Request: log en consola ─────────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `🚀 [API Request] ${config.method?.toUpperCase()} ${config.baseURL}${config.url}`,
      config.data ? config.data : ''
    );
    return config;
  },
  (error) => {
    console.error('❌ [API Request Error]', error);
    return Promise.reject(error);
  }
);

// ─── Interceptor de Response: log en consola ────────────────────────────────
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `✅ [API Response] ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`,
      response.data
    );
    return response;
  },
  (error) => {
    const detail =
      error.response?.data?.detail || error.message || 'Error desconocido';
    console.error(
      `❌ [API Error] ${error.response?.status || 'NETWORK'} ${error.config?.method?.toUpperCase()} ${error.config?.url}`,
      detail
    );
    return Promise.reject(error);
  }
);

export default apiClient;
