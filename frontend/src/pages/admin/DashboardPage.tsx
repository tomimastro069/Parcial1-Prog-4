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
import { descargarExcelMultiHoja } from '../../utils/exportarExcel';
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

  const [inputCosto, setInputCosto] = useState<string>('');
  const [guardandoCosto, setGuardandoCosto] = useState(false);

  useEffect(() => {
    if (costoEnvioData) {
      setInputCosto(costoEnvioData.valor);
    }
  }, [costoEnvioData]);

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
      // Fetch todo en paralelo
      const [pedRes, prodRes, catRes, ingRes] = await Promise.all([
        getTodosPedidos(1, 10000),
        productosApi.listAdmin({ page: 1, size: 10000 }),
        categoriasApi.list({ page: 1, size: 10000 }),
        ingredientesApi.list({ page: 1, size: 10000 }),
      ]);

      const pedidos = pedRes?.items ?? [];
      const productos: ProductoRead[] = (prodRes as any)?.items ?? [];
      const categorias: Categoria[] = (catRes as any)?.items ?? [];
      const ingredientes: Ingrediente[] = (ingRes as any)?.items ?? [];

      const fecha = new Date().toLocaleDateString('es-AR').replace(/\//g, '-');

      descargarExcelMultiHoja(
        [
          {
            nombre: 'Pedidos',
            filas: pedidos.map((p) => ({
              ID: p.id,
              Fecha: new Date(p.created_at).toLocaleString('es-AR'),
              Estado: ESTADO_DISPLAY[p.estado_codigo]?.label ?? p.estado_codigo,
              'Forma de pago': p.forma_pago_codigo,
              Subtotal: p.subtotal,
              'Costo envío': p.costo_envio,
              Total: p.total,
              Notas: p.notas ?? '',
            })),
          },
          {
            nombre: 'Productos',
            filas: productos.map((p) => ({
              Nombre: p.nombre,
              Precio: p.precio,
              Descripción: p.descripcion ?? '',
              Categorías: p.categorias.map((c) => c.nombre).join(', '),
              Ingredientes: p.ingredientes.map((i) => i.nombre).join(', '),
              Terminado: p.es_terminado ? 'Sí' : 'No',
              Estado: p.is_active ? 'Activo' : 'Inactivo',
            })),
          },
          {
            nombre: 'Categorías',
            filas: (() => {
              const padreMap = new Map(categorias.map((c) => [c.id, c.nombre]));
              return categorias.map((c) => ({
                Nombre: c.nombre.split(' / ').pop() ?? c.nombre,
                Descripción: c.descripcion ?? '',
                'Categoría padre': c.parent_id
                  ? (padreMap.get(c.parent_id)?.split(' / ').pop() ?? '')
                  : '',
                Estado: c.is_active ? 'Activa' : 'Inactiva',
              }));
            })(),
          },
          {
            nombre: 'Ingredientes',
            filas: ingredientes.map((i) => ({
              Nombre: i.nombre,
              Descripción: i.descripcion ?? '',
              Alérgeno: i.es_alergeno ? 'Sí' : 'No',
              Estado: i.is_active ? 'Activo' : 'Inactivo',
            })),
          },
        ],
        `reporte-foodstore-${fecha}`
      );

      toast.success(
        `Reporte generado: ${pedidos.length} pedidos, ${productos.length} productos`,
        { id: toastId }
      );
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
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Costo de Envío Card */}
        <div className="bg-white rounded-xl border border-gray-200 p-6 shadow-sm transition-all hover:shadow-md">
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

          <div className="space-y-4">
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
