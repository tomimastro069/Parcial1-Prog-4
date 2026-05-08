import axiosClient from './axiosClient';
import type { Categoria, CategoriaCreate, CategoriaUpdate, PaginatedResponse } from '../types';

export const categoriasApi = {
  list: (params: { page?: number; size?: number; is_active?: boolean | null } = {}) =>
    axiosClient.get<PaginatedResponse<Categoria>>('/api/v1/categorias', { params }).then((r) => r.data),

  activar: (id: number) =>
    axiosClient.patch<Categoria>(`/api/v1/categorias/${id}/activar`).then((r) => r.data),


  getById: (id: number) =>
    axiosClient.get<Categoria>(`/api/v1/categorias/${id}`).then((r) => r.data),

  create: (data: CategoriaCreate) =>
    axiosClient.post<Categoria>('/api/v1/categorias', data).then((r) => r.data),

  update: (id: number, data: CategoriaUpdate) =>
    axiosClient.patch<Categoria>(`/api/v1/categorias/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/categorias/${id}`),
};
