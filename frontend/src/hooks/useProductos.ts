import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { productosApi, type ProductosParams } from '../api/productosApi';
import type { ProductoCreate, ProductoUpdate } from '../types';

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

export function useProductosAdmin(params: { page?: number; size?: number; is_active?: boolean | null; search?: string } = {}) {
  return useQuery({
    queryKey: ['productos-admin', params],
    queryFn: () => productosApi.listAdmin(params),
    staleTime: 1000 * 60,
    placeholderData: (prev) => prev,
  });
}

export function useActivarProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.activar(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos-admin'], exact: false });
      toast.success('Producto reactivado');
    },
    onError: () => toast.error('Error al reactivar producto'),
  });
}

export function useCreateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: ProductoCreate) => productosApi.create(data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos-admin'], exact: false });
      toast.success('Producto creado');
    },
    onError: () => toast.error('Error al crear producto'),
  });
}

export function useUpdateProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: number; data: ProductoUpdate }) =>
      productosApi.update(id, data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos-admin'], exact: false });
      toast.success('Producto actualizado');
    },
    onError: () => toast.error('Error al actualizar producto'),
  });
}

export function useDeleteProducto() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => productosApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['productos-admin'], exact: false });
      toast.success('Producto eliminado');
    },
    onError: () => toast.error('Error al eliminar producto'),
  });
}
