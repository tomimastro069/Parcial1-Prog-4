import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { ingredientesApi } from '../api/ingredientesApi';
import type { IngredienteCreate, IngredienteUpdate } from '../types';

const QK = 'ingredientes';

export function useIngredientes(params: { page?: number; size?: number; is_active?: boolean | null } = {}) {
  return useQuery({
    queryKey: [QK, params],
    queryFn: () => ingredientesApi.list(params),
    staleTime: 1000 * 60,
  });
}

export function useActivarIngrediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientesApi.activar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Ingrediente reactivado');
    },
    onError: () => toast.error('Error al reactivar ingrediente'),
  });
}

export function useCreateIngrediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: IngredienteCreate) => ingredientesApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Ingrediente creado');
    },
    onError: () => toast.error('Error al crear ingrediente'),
  });
}

export function useUpdateIngrediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: IngredienteUpdate }) =>
      ingredientesApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Ingrediente actualizado');
    },
    onError: () => toast.error('Error al actualizar ingrediente'),
  });
}

export function useDeleteIngrediente() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => ingredientesApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Ingrediente eliminado');
    },
    onError: () => toast.error('Error al eliminar ingrediente'),
  });
}
