import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { categoriasApi } from '../api/categorias';
import type { CategoriaCreate, CategoriaUpdate, PaginationParams } from '../types';
import toast from 'react-hot-toast';

const QUERY_KEY = 'categorias';

export function useCategorias(params?: PaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => categoriasApi.getAll(params),
    staleTime: 1000 * 30, // 30 seconds
  });
}

export function useCategoria(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => categoriasApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => categoriasApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Categoría creada exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al crear categoría: ${message}`);
    },
  });
}

export function useUpdateCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      categoriasApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Categoría actualizada exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al actualizar categoría: ${message}`);
    },
  });
}

export function useDeleteCategoria() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Categoría eliminada exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al eliminar categoría: ${message}`);
    },
  });
}

function getErrorMessage(error: unknown): string {
  if (
    typeof error === 'object' &&
    error !== null &&
    'response' in error
  ) {
    const axiosError = error as { response?: { data?: { detail?: string } } };
    return axiosError.response?.data?.detail || 'Error desconocido';
  }
  return 'Error de conexión';
}
