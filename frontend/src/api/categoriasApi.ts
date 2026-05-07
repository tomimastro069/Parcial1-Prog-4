import axiosClient from './axiosClient';
import type { Categoria, CategoriaCreate, CategoriaUpdate } from '../types';

export const categoriasApi = {
  list: () =>
    axiosClient.get<Categoria[]>('/api/v1/categorias').then((r) => r.data),

  getById: (id: number) =>
    axiosClient.get<Categoria>(`/api/v1/categorias/${id}`).then((r) => r.data),

  create: (data: CategoriaCreate) =>
    axiosClient.post<Categoria>('/api/v1/categorias', data).then((r) => r.data),

  update: (id: number, data: CategoriaUpdate) =>
    axiosClient.patch<Categoria>(`/api/v1/categorias/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/categorias/${id}`),
};
