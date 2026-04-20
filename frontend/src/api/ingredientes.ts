import apiClient from './client';
import type {
  Ingrediente,
  IngredienteCreate,
  IngredienteUpdate,
  PaginationParams,
} from '../types';

const BASE = '/ingredientes';

export const ingredientesApi = {
  getAll: async (params?: PaginationParams): Promise<Ingrediente[]> => {
    const { data } = await apiClient.get<Ingrediente[]>(`${BASE}/`, {
      params: { offset: params?.offset ?? 0, limit: params?.limit ?? 100 },
    });
    return data;
  },

  getById: async (id: number): Promise<Ingrediente> => {
    const { data } = await apiClient.get<Ingrediente>(`${BASE}/${id}`);
    return data;
  },

  create: async (payload: IngredienteCreate): Promise<Ingrediente> => {
    const { data } = await apiClient.post<Ingrediente>(`${BASE}/`, payload);
    return data;
  },

  update: async (
    id: number,
    payload: IngredienteUpdate
  ): Promise<Ingrediente> => {
    const { data } = await apiClient.patch<Ingrediente>(
      `${BASE}/${id}`,
      payload
    );
    return data;
  },

  delete: async (id: number): Promise<void> => {
    await apiClient.delete(`${BASE}/${id}`);
  },
};
