import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi } from '../api/productos';
import type { ProductoCreate, ProductoUpdate, PaginationParams } from '../types';
import toast from 'react-hot-toast';

const QUERY_KEY = 'productos';

export function useProductos(params?: PaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => productosApi.getAll(params),
    staleTime: 1000 * 30,
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => productosApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoCreate) => productosApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Producto creado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al crear producto: ${message}`);
    },
  });
}

export function useUpdateProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productosApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Producto actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al actualizar producto: ${message}`);
    },
  });
}

export function useDeleteProducto() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Producto eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al eliminar producto: ${message}`);
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (typeof error === 'object' && error !== null && 'response' in error) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    return axiosError.response?.data?.detail || 'Error desconocido';
  }
  return 'Error de conexión';
}
