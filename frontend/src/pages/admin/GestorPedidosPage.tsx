import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getTodosPedidos, updateEstadoPedido } from '../../api/pedidosApi';
import { useAuthStore } from '../../store/authStore';
import { useDebounce } from '../../hooks/useDebounce';
import Modal from '../../components/Modal';
import toast from 'react-hot-toast';
import { ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import { descargarExcelDesdeServidor } from '../../utils/exportarExcel';

// ─── Configuración de estados ────────────────────────────────────────────────

const ESTADO_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  PENDIENTE:  { label: 'Pendiente',   badgeClass: 'bg-yellow-100 text-yellow-800 border border-yellow-200' },
  CONFIRMADO: { label: 'Aprobado',    badgeClass: 'bg-blue-100 text-blue-800 border border-blue-200'    },
  EN_PREP:    { label: 'En proceso',  badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200' },
  EN_CAMINO:  { label: 'En camino',   badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200' },
  ENTREGADO:  { label: 'Entregado',   badgeClass: 'bg-green-100 text-green-800 border border-green-200'  },
  CANCELADO:  { label: 'Cancelado',   badgeClass: 'bg-red-100 text-red-800 border border-red-200'      },
};

// Transiciones válidas por estado: [{ estado, label, clases }]
const TRANSICIONES: Record<string, { estado: string; label: string; btnClass: string }[]> = {
  PENDIENTE: [
    { estado: 'CONFIRMADO', label: 'Aprobar',   btnClass: 'bg-blue-600 hover:bg-blue-700 text-white' },
    { estado: 'CANCELADO',  label: 'Cancelar',  btnClass: 'bg-red-600 hover:bg-red-700 text-white'   },
  ],
  CONFIRMADO: [
    { estado: 'EN_PREP',   label: 'Iniciar prep.', btnClass: 'bg-orange-500 hover:bg-orange-600 text-white' },
    { estado: 'CANCELADO', label: 'Cancelar',      btnClass: 'bg-red-600 hover:bg-red-700 text-white'       },
  ],
  EN_PREP: [
    { estado: 'EN_CAMINO', label: 'Enviar', btnClass: 'bg-purple-600 hover:bg-purple-700 text-white' },
  ],
  EN_CAMINO: [
    { estado: 'ENTREGADO', label: 'Marcar entregado', btnClass: 'bg-green-600 hover:bg-green-700 text-white' },
  ],
};

// ─── Componente ──────────────────────────────────────────────────────────────

export default function GestorPedidosPage() {
  const queryClient = useQueryClient();
  const hasRole = useAuthStore((s) => s.hasRole);
  const isAdmin = hasRole('ADMIN');

  const [page, setPage] = useState(1);
  const size = 10;
  const [exportando, setExportando] = useState(false);
  const [filtroEstado, setFiltroEstado] = useState<string | undefined>(undefined);
  const [busquedaId, setBusquedaId] = useState('');

  const handleExportar = async () => {
    setExportando(true);
    try {
      await descargarExcelDesdeServidor('/api/v1/reportes/excel/pedidos', 'pedidos');
      toast.success('Pedidos exportados');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  // Modal de cancelación
  const [cancelModal, setCancelModal] = useState<{ open: boolean; pedidoId: number | null }>({
    open: false,
    pedidoId: null,
  });
  const [motivoCancelacion, setMotivoCancelacion] = useState('');

  // ── Server State ────────────────────────────────────────────────────────────
  // useQuery para el listado de pedidos (invalidado tras cada cambio)
  const busquedaIdDebounced = useDebounce(busquedaId, 400);
  const pedidoIdBusqueda = busquedaIdDebounced ? Number(busquedaIdDebounced) : undefined;

  const { data: pedidosData, isLoading } = useQuery({
    queryKey: ['todosPedidos', page, filtroEstado, pedidoIdBusqueda],
    queryFn: () => getTodosPedidos(page, size, filtroEstado, pedidoIdBusqueda),
  });

  // useMutation para actualizar estado — invalida la caché al completar
  const updateEstadoMutation = useMutation({
    mutationFn: ({ id, nuevoEstado, motivo }: { id: number; nuevoEstado: string; motivo?: string }) =>
      updateEstadoPedido(id, nuevoEstado, motivo),
    onSuccess: () => {
      toast.success('Estado actualizado');
      // invalidateQueries: fuerza re-fetch de la lista de pedidos
      queryClient.invalidateQueries({ queryKey: ['todosPedidos'] });
      setCancelModal({ open: false, pedidoId: null });
      setMotivoCancelacion('');
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.detail || 'Error al actualizar el estado');
    },
  });

  // ── Handlers ────────────────────────────────────────────────────────────────
  const handleTransicion = (pedidoId: number, nuevoEstado: string) => {
    if (nuevoEstado === 'CANCELADO') {
      setCancelModal({ open: true, pedidoId });
      return;
    }
    updateEstadoMutation.mutate({ id: pedidoId, nuevoEstado });
  };

  const handleConfirmarCancelacion = () => {
    if (!cancelModal.pedidoId) return;
    updateEstadoMutation.mutate({
      id: cancelModal.pedidoId,
      nuevoEstado: 'CANCELADO',
      motivo: motivoCancelacion.trim() || 'Sin motivo especificado',
    });
  };

  // Filtra los estados a mostrar según el rol: PEDIDOS no puede cancelar
  const getTransiciones = (estadoCodigo: string) => {
    const opts = TRANSICIONES[estadoCodigo] ?? [];
    if (!isAdmin) return opts.filter((t) => t.estado !== 'CANCELADO');
    return opts;
  };

  // ── Render ──────────────────────────────────────────────────────────────────
  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Gestor de Pedidos</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Seguimiento y avance de estados en tiempo real
          </p>
        </div>
        <button
          onClick={handleExportar}
          disabled={exportando}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {exportando ? 'Exportando...' : 'Excel'}
        </button>
      </div>

      {/* Buscador por ID */}
      <div className="mb-4">
        <input
          type="number"
          placeholder="Buscar por N° de pedido..."
          value={busquedaId}
          onChange={e => { setBusquedaId(e.target.value); setPage(1); }}
          className="w-48 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
        />
      </div>

      {/* Filtro por estado */}
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          onClick={() => { setFiltroEstado(undefined); setPage(1); }}
          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            !filtroEstado
              ? 'bg-[#1F3864] text-white'
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
          Todos
        </button>
        {Object.entries(ESTADO_DISPLAY).map(([codigo, info]) => (
          <button
            key={codigo}
            onClick={() => { setFiltroEstado(codigo); setPage(1); }}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filtroEstado === codigo
                ? 'bg-[#1F3864] text-white'
                : `${info.badgeClass} hover:opacity-80`
            }`}
          >
            {info.label}
          </button>
        ))}
      </div>

      {/* Lista de pedidos tipo "kanban card" */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {(() => {
          const items = pedidosData?.items ?? [];

          if (items.length === 0) return (
            <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
              {busquedaId ? `No se encontró el pedido #${busquedaId}.` : 'No hay pedidos registrados.'}
            </div>
          );

          return items.map((pedido) => {
          const estadoInfo = ESTADO_DISPLAY[pedido.estado_codigo] ?? {
            label: pedido.estado_codigo,
            badgeClass: 'bg-gray-100 text-gray-700',
          };
          const transiciones = getTransiciones(pedido.estado_codigo);
          const esTerminal = pedido.estado_codigo === 'ENTREGADO' || pedido.estado_codigo === 'CANCELADO';

          return (
            <div
              key={pedido.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden shadow-sm"
            >
              {/* Encabezado */}
              <div className="px-5 py-3 flex flex-wrap gap-3 items-center justify-between border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <span className="font-bold text-gray-900 text-sm">Pedido #{pedido.id}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${estadoInfo.badgeClass}`}>
                    {estadoInfo.label}
                  </span>
                </div>
                <div className="flex items-center gap-4 text-xs text-gray-500">
                  <span>{new Date(pedido.created_at).toLocaleString('es-AR')}</span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    pedido.forma_pago_codigo === 'MERCADOPAGO'
                      ? 'bg-blue-100 text-blue-700'
                      : pedido.forma_pago_codigo === 'EFECTIVO'
                      ? 'bg-green-100 text-green-700'
                      : 'bg-gray-100 text-gray-600'
                  }`}>
                    {pedido.forma_pago_codigo === 'MERCADOPAGO' ? '💳 Mercado Pago' : pedido.forma_pago_codigo === 'EFECTIVO' ? '💵 Efectivo' : pedido.forma_pago_codigo}
                  </span>
                  <span className="font-bold text-gray-900 text-base">${pedido.total.toFixed(2)}</span>
                </div>
              </div>

              {/* Ítems del pedido */}
              {pedido.detalles && pedido.detalles.length > 0 && (
                <div className="px-5 py-2 flex flex-wrap gap-2 border-b border-gray-100">
                  {pedido.detalles.map((d: any, idx: number) => (
                    <span
                      key={idx}
                      className="bg-gray-100 text-gray-700 text-xs px-2 py-0.5 rounded-md"
                    >
                      {d.cantidad}× {d.nombre_snapshot}
                    </span>
                  ))}
                </div>
              )}

              {/* Pie: info + acciones */}
              <div className="px-5 py-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="text-xs text-gray-400 space-x-3">
                  <span>
                    Pago:{' '}
                    <span className="font-medium text-gray-600">{pedido.forma_pago_codigo}</span>
                  </span>
                  <span>
                    {pedido.direccion_id ? 'Envío a domicilio' : 'Retiro en local'}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  {transiciones.map((t) => (
                    <button
                      key={t.estado}
                      onClick={() => handleTransicion(pedido.id, t.estado)}
                      disabled={updateEstadoMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${t.btnClass}`}
                    >
                      {t.label}
                    </button>
                  ))}
                  {esTerminal && (
                    <span className="text-xs text-gray-400 italic">Estado final</span>
                  )}
                </div>
              </div>
            </div>
          );
        });
        })()}
      </div>

      {/* Paginación */}
      {pedidosData && pedidosData.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {pedidosData.pages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pedidosData.pages, p + 1))}
            disabled={page === pedidosData.pages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}

      {/* Modal de cancelación */}
      <Modal
        isOpen={cancelModal.open}
        onClose={() => setCancelModal({ open: false, pedidoId: null })}
        title={`Cancelar pedido #${cancelModal.pedidoId}`}
        size="sm"
      >
        <div className="space-y-4">
          <p className="text-sm text-gray-600">
            Esta acción es irreversible. El pedido pasará al estado <strong>Cancelado</strong>.
          </p>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Motivo de cancelación <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <textarea
              className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-red-500/20 focus:border-red-500 outline-none resize-none"
              rows={3}
              placeholder="Escribí el motivo..."
              value={motivoCancelacion}
              onChange={(e) => setMotivoCancelacion(e.target.value)}
            />
          </div>
          <div className="flex justify-end gap-3 pt-1">
            <button
              onClick={() => {
                setCancelModal({ open: false, pedidoId: null });
                setMotivoCancelacion('');
              }}
              className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
            >
              No, volver
            </button>
            <button
              onClick={handleConfirmarCancelacion}
              disabled={updateEstadoMutation.isPending}
              className="px-4 py-2 text-sm bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50"
            >
              {updateEstadoMutation.isPending ? 'Cancelando...' : 'Sí, cancelar pedido'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
