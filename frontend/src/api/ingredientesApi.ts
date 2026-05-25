import axiosClient from './axiosClient';
import type { Ingrediente, IngredienteCreate, IngredienteUpdate, PaginatedResponse } from '../types';

export const ingredientesApi = {
  list: (params: { page?: number; size?: number; is_active?: boolean | null; search?: string } = {}) =>
    axiosClient
      .get<PaginatedResponse<Ingrediente>>('/api/v1/ingredientes/', { params })
      .then((r) => r.data),

  activar: (id: number) =>
    axiosClient.patch<Ingrediente>(`/api/v1/ingredientes/${id}/activar`).then((r) => r.data),

  getById: (id: number) =>
    axiosClient.get<Ingrediente>(`/api/v1/ingredientes/${id}`).then((r) => r.data),

  create: (data: IngredienteCreate) =>
    axiosClient.post<Ingrediente>('/api/v1/ingredientes/', data).then((r) => r.data),

  update: (id: number, data: IngredienteUpdate) =>
    axiosClient.patch<Ingrediente>(`/api/v1/ingredientes/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/ingredientes/${id}`),
};
