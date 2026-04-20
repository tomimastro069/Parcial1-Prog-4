import apiClient from './client';
import type {
  Categoria,
  CategoriaCreate,
  CategoriaUpdate,
  PaginationParams,
} from '../types';

const BASE = '/categorias';

export const categoriasApi = {
  getAll: async (params?: PaginationParams): Promise<Categoria[]> => {
    const { data } = await apiClient.get<Categoria[]>(`${BASE}/`, {
      params: { offset: params?.offset ?? 0, limit: params?.limit ?? 100 },
    });
    return data;
  },

  getById: async (id: number): Promise<Categoria> => {
    const { data } = await apiClient.get<Categoria>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: CategoriaCreate): Promise<Categoria> => {
    const { data } = await apiClient.post<Categoria>(`${BASE}/`, payload);
    return data;
  },

  update: async (id: number, payload: CategoriaUpdate): Promise<Categoria> => {
    const { data } = await apiClient.patch<Categoria>(
      `${BASE}/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
