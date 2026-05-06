import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { productosApi, type ProductosParams } from '../api/productosApi';

export function useProductos(params: ProductosParams = {}) {
  return useQuery({
    queryKey: ['productos', params],
    queryFn: () => productosApi.list(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

export function useProducto(id: number) {
  return useQuery({
    queryKey: ['productos', id],
    queryFn: () => productosApi.getById(id),
    enabled: !!id,
    staleTime: 1000 * 60,
  });
}

export function useToggleDisponibilidad() {
  const qc = useQueryClient();

  return useMutation({
    mutationFn: ({ id, disponible }: { id: number; disponible: boolean }) =>
      productosApi.toggleDisponibilidad(id, disponible),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos'] });
    },
  });
}
