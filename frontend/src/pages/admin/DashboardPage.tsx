import { ChartBarIcon, ShoppingBagIcon, UsersIcon, CubeIcon } from '@heroicons/react/24/outline';

const kpis = [
  { label: 'Pedidos hoy', value: '—', icon: ShoppingBagIcon, color: 'bg-blue-50 text-blue-600' },
  { label: 'Ingresos hoy', value: '—', icon: ChartBarIcon, color: 'bg-green-50 text-green-600' },
  { label: 'Productos activos', value: '—', icon: CubeIcon, color: 'bg-purple-50 text-purple-600' },
  { label: 'Usuarios activos', value: '—', icon: UsersIcon, color: 'bg-amber-50 text-amber-600' },
];

export default function DashboardPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#1F3864]">Dashboard</h1>
        <p className="text-sm text-gray-500 mt-0.5">Resumen de actividad del sistema</p>
      </div>

      {/* KPIs */}
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

      {/* Info placeholder */}
      <div className="bg-white rounded-xl border border-gray-200 p-6">
        <h2 className="text-base font-semibold text-gray-900 mb-2">
          Panel de administración
        </h2>
        <p className="text-sm text-gray-500">
          Usá el menú lateral para gestionar categorías, ingredientes, productos, pedidos y stock.
          El dashboard con métricas reales se conecta al endpoint{' '}
          <code className="bg-gray-100 px-1.5 py-0.5 rounded text-xs">GET /api/v1/admin/dashboard</code>.
        </p>
      </div>
    </div>
  );
}
