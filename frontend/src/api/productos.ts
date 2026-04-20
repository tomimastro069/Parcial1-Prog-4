import apiClient from './client';
import type {
  Producto,
  ProductoCreate,
  ProductoUpdate,
  PaginationParams,
} from '../types';

const BASE = '/productos';

export const productosApi = {
  getAll: async (params?: PaginationParams): Promise<Producto[]> => {
    const { data } = await apiClient.get<Producto[]>(`${BASE}/`, {
      params: { offset: params?.offset ?? 0, limit: params?.limit ?? 100 },
    });
    return data;
  },

  getById: async (id: number): Promise<Producto> => {
    const { data } = await apiClient.get<Producto>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: ProductoCreate): Promise<Producto> => {
    const { data } = await apiClient.post<Producto>(`${BASE}/`, payload);
    return data;
  },

  update: async (id: number, payload: ProductoUpdate): Promise<Producto> => {
    const { data } = await apiClient.patch<Producto>(`${BASE}/${id}`, payload);
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
