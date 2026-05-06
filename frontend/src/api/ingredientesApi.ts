import axiosClient from './axiosClient';
import type { Ingrediente, IngredienteCreate, IngredienteUpdate } from '../types';

export const ingredientesApi = {
  list: (offset = 0, limit = 100) =>
    axiosClient
      .get<Ingrediente[]>('/api/v1/ingredientes', { params: { offset, limit } })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosClient.get<Ingrediente>(`/api/v1/ingredientes/${id}`).then((r) => r.data),

  create: (data: IngredienteCreate) =>
    axiosClient.post<Ingrediente>('/api/v1/ingredientes', data).then((r) => r.data),

  update: (id: number, data: IngredienteUpdate) =>
    axiosClient.patch<Ingrediente>(`/api/v1/ingredientes/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/ingredientes/${id}`),
};
