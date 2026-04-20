import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ingredientesApi } from '../api/ingredientes';
import type { IngredienteCreate, IngredienteUpdate, PaginationParams } from '../types';
import toast from 'react-hot-toast';

const QUERY_KEY = 'ingredientes';

export function useIngredientes(params?: PaginationParams) {
  return useQuery({
    queryKey: [QUERY_KEY, params],
    queryFn: () => ingredientesApi.getAll(params),
    staleTime: 1000 * 30,
  });
}

export function useIngrediente(id: number) {
  return useQuery({
    queryKey: [QUERY_KEY, id],
    queryFn: () => ingredientesApi.getById(id),
    enabled: !!id,
  });
}

export function useCreateIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: IngredienteCreate) => ingredientesApi.create(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Ingrediente creado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al crear ingrediente: ${message}`);
    },
  });
}

export function useUpdateIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      ingredientesApi.update(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Ingrediente actualizado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al actualizar ingrediente: ${message}`);
    },
  });
}

export function useDeleteIngrediente() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: [QUERY_KEY] });
      toast.success('Ingrediente eliminado exitosamente');
    },
    onError: (error: unknown) => {
      const message = getErrorMessage(error);
      toast.error(`Error al eliminar ingrediente: ${message}`);
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
