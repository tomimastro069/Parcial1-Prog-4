import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodosPedidos, updateEstadoPedido, getEstadosPosibles } from '../../api/pedidosApi';
import toast from 'react-hot-toast';

export default function GestorPedidosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const size = 10;

  // useQuery para el listado de pedidos (Server State)
  const { data: pedidosData, isLoading: isLoadingPedidos } = useQuery({
    queryKey: ['todosPedidos', page],
    queryFn: () => getTodosPedidos(page, size),
  });

  const { data: estadosData } = useQuery({
    queryKey: ['estadosPosibles'],
    queryFn: getEstadosPosibles,
  });

  // useMutation para editar el estado. Acá invalidamos la caché para que el listado se refresque automáticamente.
  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, nuevoEstado, motivo }: { id: number; nuevoEstado: string; motivo?: string }) =>
      updateEstadoPedido(id, nuevoEstado, motivo),
    onSuccess: () => {
      toast.success('Estado actualizado correctamente');
      // Invalidation: Esto provoca que useQuery con la key ['todosPedidos'] vuelva a buscar datos
      queryClient.invalidateQueries({ queryKey: ['todosPedidos'] });
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Error al actualizar el estado';
      toast.error(msg);
    }
  });

  const handleEstadoChange = (pedidoId: number, nuevoEstado: string, es_terminal: boolean) => {
    // Si cancela, pide motivo. Para un flujo real puede ser un modal, aquí usamos un prompt básico por simplicidad
    let motivo;
    if (nuevoEstado === 'CANCELADO') {
      motivo = window.prompt('Motivo de cancelación:');
      if (!motivo) return; // Canceló el prompt
    }
    
    updateEstadoMutation.mutate({ id: pedidoId, nuevoEstado, motivo });
  };

  if (isLoadingPedidos) return <div className="p-8">Cargando gestor de pedidos...</div>;

  return (
    <div className="bg-white rounded-lg shadow p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Gestor de Pedidos</h1>
      </div>

      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Cliente (ID)</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado Actual</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {pedidosData?.items.map((pedido) => (
              <tr key={pedido.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">#{pedido.id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {new Date(pedido.created_at).toLocaleString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{pedido.usuario_id}</td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                  ${pedido.total.toFixed(2)}
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                    {pedido.estado_codigo}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  {/* Select para cambiar el estado */}
                  <select
                    className="border-gray-300 rounded-md shadow-sm text-sm focus:ring-[#D32F2F] focus:border-[#D32F2F]"
                    value={pedido.estado_codigo}
                    onChange={(e) => {
                      const est = estadosData?.find(x => x.codigo === e.target.value);
                      handleEstadoChange(pedido.id, e.target.value, est?.es_terminal || false);
                    }}
                    disabled={
                      // Si el estado actual ya es terminal, no dejamos cambiar (ej. Entregado / Cancelado)
                      estadosData?.find(e => e.codigo === pedido.estado_codigo)?.es_terminal ||
                      updateEstadoMutation.isPending
                    }
                  >
                    {estadosData?.map((est) => (
                      <option key={est.codigo} value={est.codigo} disabled={pedido.estado_codigo === est.codigo}>
                        {est.descripcion}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {pedidosData && pedidosData.pages > 1 && (
        <div className="flex items-center justify-between border-t border-gray-200 bg-white px-4 py-3 sm:px-6 mt-4">
          <div className="hidden sm:flex sm:flex-1 sm:items-center sm:justify-between">
            <div>
              <p className="text-sm text-gray-700">
                Mostrando <span className="font-medium">{(page - 1) * size + 1}</span> a{' '}
                <span className="font-medium">{Math.min(page * size, pedidosData.total)}</span> de{' '}
                <span className="font-medium">{pedidosData.total}</span> resultados
              </p>
            </div>
            <div>
              <nav className="isolate inline-flex -space-x-px rounded-md shadow-sm" aria-label="Pagination">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="relative inline-flex items-center rounded-l-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Anterior
                </button>
                <button
                  onClick={() => setPage((p) => Math.min(pedidosData.pages, p + 1))}
                  disabled={page === pedidosData.pages}
                  className="relative inline-flex items-center rounded-r-md px-2 py-2 text-gray-400 ring-1 ring-inset ring-gray-300 hover:bg-gray-50 focus:z-20 focus:outline-offset-0 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </nav>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
