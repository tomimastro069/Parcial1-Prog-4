import axiosClient from './axiosClient';
import type { Producto, ProductoDetail, PaginatedResponse } from '../types';

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
};
