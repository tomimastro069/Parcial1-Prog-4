import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChartBarIcon, ShoppingBagIcon, CubeIcon,
  ClipboardDocumentListIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { getTodosPedidos } from '../../api/pedidosApi';
import { productosApi } from '../../api/productosApi';
import { categoriasApi } from '../../api/categoriasApi';
import { ingredientesApi } from '../../api/ingredientesApi';
import { getAjuste, updateAjuste } from '../../api/ajustesApi';
import { useAuthStore } from '../../store/authStore';
import { descargarExcelDesdeServidor } from '../../utils/exportarExcel';
import type { Categoria, ProductoRead, Ingrediente } from '../../types';

// ── Queries de resumen ────────────────────────────────────────────────────────

async function getProductosResumen() {
  const data = await productosApi.listAdmin({ page: 1, size: 1, is_active: true });
  return data as { total: number };
}

async function getCategoriasResumen() {
  const data = await categoriasApi.list({ page: 1, size: 1, is_active: true });
  return data as { total: number };
}

const ESTADO_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  PENDIENTE: { label: 'Pendiente', badgeClass: 'bg-yellow-100 text-yellow-800' },
  CONFIRMADO: { label: 'Aprobado', badgeClass: 'bg-blue-100 text-blue-800' },
  EN_PREP: { label: 'En proceso', badgeClass: 'bg-orange-100 text-orange-800' },
  EN_CAMINO: { label: 'En camino', badgeClass: 'bg-purple-100 text-purple-800' },
  ENTREGADO: { label: 'Entregado', badgeClass: 'bg-green-100 text-green-800' },
  CANCELADO: { label: 'Cancelado', badgeClass: 'bg-red-100 text-red-800' },
};

// ── Componente ────────────────────────────────────────────────────────────────

export default function DashboardPage() {
  const usuario = useAuthStore((s) => s.usuario);
  const [exportando, setExportando] = useState(false);

  const { data: pedidosData } = useQuery({
    queryKey: ['dashboardPedidos'],
    queryFn: () => getTodosPedidos(1, 5),
  });

  // Ajuste de costo de envío
  const { data: costoEnvioData, refetch: refetchCostoEnvio } = useQuery({
    queryKey: ['ajusteCostoEnvio'],
    queryFn: () => getAjuste('costo_envio'),
  });

  const { data: indiceGananciaData, refetch: refetchIndice } = useQuery({
    queryKey: ['ajusteIndiceGanancia'],
    queryFn: () => getAjuste('indice_ganancia'),
  });

  const [inputCosto, setInputCosto] = useState<string>('');
  const [guardandoCosto, setGuardandoCosto] = useState(false);
  const [inputIndice, setInputIndice] = useState<string>('');
  const [guardandoIndice, setGuardandoIndice] = useState(false);

  useEffect(() => {
    if (costoEnvioData) setInputCosto(costoEnvioData.valor);
  }, [costoEnvioData]);

  useEffect(() => {
    if (indiceGananciaData) setInputIndice(indiceGananciaData.valor);
  }, [indiceGananciaData]);

  const { data: productosData } = useQuery({
    queryKey: ['dashboardProductos'],
    queryFn: getProductosResumen,
  });

  const { data: categoriasData } = useQuery({
    queryKey: ['dashboardCategorias'],
    queryFn: getCategoriasResumen,
  });

  const kpis = [
    {
      label: 'Total de pedidos',
      value: pedidosData?.total ?? '—',
      icon: ShoppingBagIcon,
      color: 'bg-blue-50 text-blue-600',
    },
    {
      label: 'Productos activos',
      value: productosData?.total ?? '—',
      icon: CubeIcon,
      color: 'bg-purple-50 text-purple-600',
    },
    {
      label: 'Categorías activas',
      value: categoriasData?.total ?? '—',
      icon: ChartBarIcon,
      color: 'bg-green-50 text-green-600',
    },
    {
      label: 'Últimos pedidos',
      value: pedidosData?.items.length ?? '—',
      icon: ClipboardDocumentListIcon,
      color: 'bg-amber-50 text-amber-600',
    },
  ];

  // ── Reporte general multi-hoja ─────────────────────────────────────────────
  const handleExportarReporte = async () => {
    setExportando(true);
    const toastId = toast.loading('Generando reporte...');
    try {
      const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');
      await descargarExcelDesdeServidor('/api/v1/reportes/excel/general', `reporte-foodstore-${fecha}`);
      toast.success('Reporte generado correctamente', { id: toastId });
    } catch {
      toast.error('Error al generar el reporte', { id: toastId });
    } finally {
      setExportando(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* ── Header ────────────────────────────────────────────────────────── */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Dashboard</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            Bienvenido, {usuario?.nombre}. Resumen de actividad del sistema.
          </p>
        </div>
        <button
          onClick={handleExportarReporte}
          disabled={exportando}
          className="flex items-center gap-2 px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 shadow-sm"
        >
          <ArrowDownTrayIcon className="w-4 h-4" />
          {exportando ? 'Generando...' : 'Reporte General Excel'}
        </button>
      </div>

      {/* ── KPIs ──────────────────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="bg-white rounded-xl border border-gray-200 p-5">
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-gray-600">{kpi.label}</span>
              <div className={`p-2 rounded-lg ${kpi.color}`}>
                <kpi.icon className="w-5 h-5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-gray-900">{kpi.value}</p>
          </div>
        ))}
      </div>

      {/* ── Últimos pedidos ───────────────────────────────────────────────── */}
      {pedidosData && pedidosData.items.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between">
            <h2 className="text-base font-semibold text-gray-900">Últimos pedidos</h2>
            <span className="text-xs text-gray-400">Total: {pedidosData.total}</span>
          </div>
          <table className="w-full text-sm">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">ID</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Fecha</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">Pago</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-600">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {pedidosData.items.map((pedido) => {
                const est = ESTADO_DISPLAY[pedido.estado_codigo] ?? {
                  label: pedido.estado_codigo,
                  badgeClass: 'bg-gray-100 text-gray-700',
                };
                return (
                  <tr key={pedido.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3 font-medium text-gray-900">#{pedido.id}</td>
                    <td className="px-4 py-3 text-gray-500 text-xs">
                      {new Date(pedido.created_at).toLocaleString('es-AR')}
                    </td>
                    <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                      {pedido.forma_pago_codigo}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${est.badgeClass}`}>
                        {est.label}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-gray-900">
                      ${pedido.total.toFixed(2)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Ajustes de Envío ──────────────────────────────────────────────── */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Costo de Envío Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md flex flex-col">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-blue-50 text-blue-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 18.75a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h6m-9 0H3.375a1.125 1.125 0 0 1-1.125-1.125V14.25m17.25 4.5a1.5 1.5 0 0 1-3 0m3 0a1.5 1.5 0 0 0-3 0m3 0h1.125c.621 0 1.129-.504 1.09-1.124l-.321-5.128a2.25 2.25 0 0 0-1.585-2.06l-4.436-1.396a2.25 2.25 0 0 0-2.316.718L12.75 10.5m-1.5 9h-3.75M12.75 10.5h-1.5V6.75A2.25 2.25 0 0 0 9 4.5H3.75A2.25 2.25 0 0 0 1.5 6.75v7.5c0 .621.504 1.125 1.125 1.125h9.75" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Costo de Envío</h2>
              <p className="text-xs text-gray-500">Definí cuánto sale el envío a domicilio</p>
            </div>
          </div>

          <div className="flex-1 flex flex-col gap-4">
            <div>
              <label htmlFor="costo-envio" className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Valor del Envío ($)
              </label>
              <div className="relative rounded-lg shadow-sm">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="costo-envio"
                  id="costo-envio"
                  step="0.01"
                  min="0"
                  className="block w-full rounded-lg border border-gray-300 pl-7 pr-3 py-2 text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:ring-blue-500 text-sm"
                  placeholder="0.00"
                  value={inputCosto}
                  onChange={(e) => setInputCosto(e.target.value)}
                />
              </div>
            </div>

            <button
              type="button"
              disabled={guardandoCosto || inputCosto === ''}
              style={{ marginTop: 'auto' }}
              onClick={async () => {
                setGuardandoCosto(true);
                const toastId = toast.loading('Guardando costo de envío...');
                try {
                  await updateAjuste('costo_envio', inputCosto);
                  await refetchCostoEnvio();
                  toast.success('Costo de envío actualizado con éxito', { id: toastId });
                } catch (error: any) {
                  const msg = error.response?.data?.detail || 'Error al actualizar el costo';
                  toast.error(msg, { id: toastId });
                } finally {
                  setGuardandoCosto(false);
                }
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors disabled:opacity-50"
            >
              {guardandoCosto ? 'Guardando...' : 'Actualizar Costo'}
            </button>
          </div>
        </div>

        {/* Índice de Ganancia Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
          <div className="flex items-center gap-3 mb-4">
            <div className="p-2.5 bg-green-50 text-green-600 rounded-lg">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 18 9 11.25l4.306 4.306a11.95 11.95 0 0 1 5.814-5.518l2.74-1.22m0 0-5.94-2.281m5.94 2.28-2.28 5.941" />
              </svg>
            </div>
            <div>
              <h2 className="text-base font-semibold text-gray-900">Índice de Ganancia</h2>
              <p className="text-xs text-gray-500">Multiplicador sobre el costo de ingredientes</p>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider">
                  Ganancia sobre el costo
                </label>
                <div className="flex items-center gap-2">
                  <span className="text-2xl font-bold text-green-600">
                    {inputIndice ? `${((parseFloat(inputIndice) - 1) * 100).toFixed(0)}%` : '—'}
                  </span>
                  <span className="text-xs text-gray-400">
                    (×{inputIndice || '—'})
                  </span>
                </div>
              </div>

              {/* Slider estilo YouTube */}
              <div className="relative py-2">
                <input
                  type="range"
                  min="1"
                  max="4"
                  step="0.05"
                  value={inputIndice || '1'}
                  onChange={(e) => setInputIndice(parseFloat(e.target.value).toFixed(2))}
                  className="w-full h-2 rounded-full appearance-none cursor-pointer [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4 [&::-webkit-slider-thumb]:h-4 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-green-600 [&::-webkit-slider-thumb]:cursor-pointer [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-4 [&::-moz-range-thumb]:rounded-full [&::-moz-range-thumb]:bg-green-600 [&::-moz-range-thumb]:border-0 [&::-moz-range-thumb]:cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, #16a34a ${((parseFloat(inputIndice || '1') - 1) / 3) * 100}%, #e5e7eb ${((parseFloat(inputIndice || '1') - 1) / 3) * 100}%)`
                  }}
                />
                <div className="flex justify-between text-xs text-gray-400 mt-1">
                  <span>0%</span>
                  <span>50%</span>
                  <span>100%</span>
                  <span>150%</span>
                  <span>200%</span>
                  <span>300%</span>
                </div>
              </div>

              {/* Input numérico manual */}
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs text-gray-500">Ajuste fino:</span>
                <input
                  type="number"
                  step="0.01"
                  min="1"
                  max="10"
                  className="w-24 rounded-lg border border-gray-300 px-3 py-1.5 text-sm focus:border-green-500 focus:ring-green-500 focus:outline-none"
                  value={inputIndice}
                  onChange={(e) => setInputIndice(e.target.value)}
                />
                <span className="text-xs text-gray-400">× multiplicador</span>
              </div>
            </div>

            <button
              type="button"
              disabled={guardandoIndice || inputIndice === ''}
              onClick={async () => {
                const val = parseFloat(inputIndice);
                if (isNaN(val) || val < 1) {
                  toast.error('El índice debe ser mayor o igual a 1');
                  return;
                }
                setGuardandoIndice(true);
                const toastId = toast.loading('Guardando índice de ganancia...');
                try {
                  await updateAjuste('indice_ganancia', inputIndice);
                  await refetchIndice();
                  toast.success('Índice de ganancia actualizado', { id: toastId });
                } catch (error: any) {
                  toast.error(error.response?.data?.detail || 'Error al actualizar', { id: toastId });
                } finally {
                  setGuardandoIndice(false);
                }
              }}
              className="w-full flex justify-center py-2 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 transition-colors disabled:opacity-50"
            >
              {guardandoIndice ? 'Guardando...' : 'Actualizar Índice'}
            </button>
          </div>
        </div>

        {/* Info y Exportación Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md flex flex-col justify-between">
          <div>
            <h2 className="text-base font-semibold text-gray-900 mb-1">Exportación</h2>
            <p className="text-sm text-gray-500 leading-relaxed">
              El botón <strong>Reporte General Excel</strong> descarga un archivo con cuatro hojas:
              Pedidos, Productos, Categorías e Ingredientes. También podés exportar cada módulo
              individualmente desde su propia pantalla.
            </p>
          </div>
          <div className="mt-4 pt-4 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-400">
            <span>Última sincronización de datos: recién</span>
          </div>
        </div>
      </div>
    </div>
  );
}
