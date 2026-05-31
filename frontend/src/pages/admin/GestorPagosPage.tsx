import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axiosClient from '../../api/axiosClient';
import { useDebounce } from '../../hooks/useDebounce';

interface PagoAdmin {
  id: number;
  pedido_id: number;
  usuario_id: number | null;
  usuario_nombre: string | null;
  usuario_email: string | null;
  payment_id: string;
  status: string;
  mp_status_detail: string | null;
  external_reference: string | null;
  amount: number;
  payment_method_id: string | null;
  created_at: string;
  updated_at: string;
}

const STATUS_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  success: { label: 'Aprobado',  badgeClass: 'bg-green-100 text-green-800 border border-green-200' },
  pending: { label: 'Pendiente', badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  failure: { label: 'Rechazado', badgeClass: 'bg-red-100 text-red-800 border border-red-200' },
};

const getPagos = async (page: number, size: number, usuario_id?: number, pedido_id?: number) => {
  const params: Record<string, any> = { page, size };
  if (usuario_id) params.usuario_id = usuario_id;
  if (pedido_id) params.pedido_id = pedido_id;
  const { data } = await axiosClient.get('/api/v1/admin/pagos/', { params });
  return data;
};

export default function GestorPagosPage() {
  const [page, setPage] = useState(1);
  const [buscarUsuario, setBuscarUsuario] = useState('');
  const [buscarPedido, setBuscarPedido] = useState('');
  const size = 15;

  const usuarioDebounced = useDebounce(buscarUsuario, 400);
  const pedidoDebounced = useDebounce(buscarPedido, 400);

  const usuarioId = usuarioDebounced.trim() !== '' ? Number(usuarioDebounced) : undefined;
  const pedidoId = pedidoDebounced.trim() !== '' ? Number(pedidoDebounced) : undefined;

  const { data, isLoading } = useQuery({
    queryKey: ['adminPagos', page, usuarioId, pedidoId],
    queryFn: () => getPagos(page, size, usuarioId, pedidoId),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Pagos Mercado Pago</h1>
          <p className="text-sm text-gray-500 mt-0.5">{data?.total ?? 0} pagos registrados</p>
        </div>
      </div>

      <div className="flex gap-3 mb-4">
        <input
          type="number"
          placeholder="Buscar por ID de usuario..."
          value={buscarUsuario}
          onChange={e => { setBuscarUsuario(e.target.value); setPage(1); }}
          className="w-52 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
        />
        <input
          type="number"
          placeholder="Buscar por ID de pedido..."
          value={buscarPedido}
          onChange={e => { setBuscarPedido(e.target.value); setPage(1); }}
          className="w-52 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
        />
      </div>

      <div className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
          </div>
        )}

        {!isLoading && data?.items.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            No hay pagos registrados todavía.
          </div>
        )}

        {!isLoading && data?.items.map((pago: PagoAdmin) => {
          const statusInfo = STATUS_DISPLAY[pago.status] ?? { label: pago.status, badgeClass: 'bg-gray-100 text-gray-700' };

          return (
            <div key={pago.id} className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
              {/* Encabezado */}
              <div className="px-5 py-3 flex flex-wrap gap-3 items-center justify-between border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-sm">Pago #{pago.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${statusInfo.badgeClass}`}>
                    {statusInfo.label}
                  </span>
                  {pago.mp_status_detail && (
                    <span className="text-xs text-gray-400 italic">{pago.mp_status_detail}</span>
                  )}
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(pago.created_at).toLocaleString('es-AR')}</span>
                  <span className="font-bold text-gray-900 text-base">${pago.amount.toFixed(2)}</span>
                </div>
              </div>

              {/* Detalle */}
              <div className="px-5 py-3 grid grid-cols-2 md:grid-cols-5 gap-4 text-xs text-gray-500">
                <div>
                  <span className="block font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Pedido</span>
                  <span className="text-gray-800 font-medium">#{pago.pedido_id}</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Usuario</span>
                  {pago.usuario_nombre ? (
                    <>
                      <span className="text-gray-800 font-medium block">#{pago.usuario_id} · {pago.usuario_nombre}</span>
                      <span className="text-gray-400">{pago.usuario_email}</span>
                    </>
                  ) : (
                    <span className="text-gray-400">—</span>
                  )}
                </div>
                <div>
                  <span className="block font-semibold text-gray-400 uppercase tracking-wide mb-0.5">MP Payment ID</span>
                  <span className="text-gray-700 font-mono break-all">{pago.payment_id}</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Medio de pago</span>
                  <span className="text-gray-800">{pago.payment_method_id ?? '—'}</span>
                </div>
                <div>
                  <span className="block font-semibold text-gray-400 uppercase tracking-wide mb-0.5">Última actualización</span>
                  <span className="text-gray-700">{new Date(pago.updated_at).toLocaleString('es-AR')}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Paginación */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">Página {page} de {data.pages}</span>
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
