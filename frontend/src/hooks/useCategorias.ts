import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { categoriasApi } from '../api/categoriasApi';
import type { CategoriaCreate, CategoriaUpdate } from '../types';

const QK = 'categorias';

export function useCategorias(params: { page?: number; size?: number; is_active?: boolean | null; search?: string } = {}) {
  return useQuery({
    queryKey: [QK, params],
    queryFn: () => categoriasApi.list(params),
    staleTime: 1000 * 60 * 5,
  });
}

export function useActivarCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.activar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Categoría reactivada');
    },
    onError: () => toast.error('Error al reactivar categoría'),
  });
}

export function useCreateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: CategoriaCreate) => categoriasApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Categoría creada');
    },
    onError: () => toast.error('Error al crear categoría'),
  });
}

export function useUpdateCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: CategoriaUpdate }) =>
      categoriasApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Categoría actualizada');
    },
    onError: () => toast.error('Error al actualizar categoría'),
  });
}

export function useDeleteCategoria() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => categoriasApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Categoría eliminada');
    },
    onError: (err: unknown) => {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 409) {
        toast.error('No se puede eliminar: tiene productos asociados.');
      } else {
        toast.error('Error al eliminar categoría');
      }
    },
  });
}
