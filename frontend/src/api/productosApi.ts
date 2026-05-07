import axiosClient from './axiosClient';
import type { Producto, ProductoDetail, ProductoRead, ProductoCreate, ProductoUpdate, PaginatedResponse } from '../types';

export interface ProductosParams {
  page?: number;
  size?: number;
  search?: string;
  categoria_id?: number | null;
  disponible?: boolean;
}

export const productosApi = {
  list: (params: ProductosParams = {}) =>
    axiosClient
      .get<PaginatedResponse<Producto>>('/api/v1/productos', { params })
      .then((r) => r.data),

  getById: (id: number) =>
    axiosClient.get<ProductoDetail>(`/api/v1/productos/${id}`).then((r) => r.data),

  toggleDisponibilidad: (id: number, disponible: boolean) =>
    axiosClient
      .patch<Producto>(`/api/v1/productos/${id}/disponibilidad`, { disponible })
      .then((r) => r.data),

  listAdmin: (params: { page?: number; size?: number } = {}) =>
    axiosClient
      .get<PaginatedResponse<ProductoRead>>('/api/v1/productos', { params })
      .then((r) => r.data),

  create: (data: ProductoCreate) =>
    axiosClient.post<ProductoRead>('/api/v1/productos', data).then((r) => r.data),

  update: (id: number, data: ProductoUpdate) =>
    axiosClient.patch<ProductoRead>(`/api/v1/productos/${id}`, data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/productos/${id}`),
};
