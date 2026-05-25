import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { unidadesMedidaApi } from '../api/unidadesMedidaApi';

const QK = 'unidades-medida';

export function useUnidades() {
  return useQuery({
    queryKey: [QK],
    queryFn: () => unidadesMedidaApi.list(),
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
}

export function useCreateUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: { nombre: string; simbolo: string; tipo: string }) => unidadesMedidaApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Unidad creada exitosamente');
    },
    onError: () => toast.error('Error al crear la unidad de medida'),
  });
}

export function useDeleteUnidad() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => unidadesMedidaApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [QK] });
      toast.success('Unidad eliminada');
    },
    onError: () => toast.error('Error al eliminar la unidad de medida'),
  });
}
