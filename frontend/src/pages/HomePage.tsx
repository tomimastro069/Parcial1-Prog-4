import { TagIcon, CubeIcon, BeakerIcon } from '@heroicons/react/24/outline';
import { Link } from 'react-router-dom';
import { useCategorias } from '../hooks/useCategorias';
import { useIngredientes } from '../hooks/useIngredientes';
import { useProductos } from '../hooks/useProductos';

export default function HomePage() {
  const { data: categorias } = useCategorias();
  const { data: ingredientes } = useIngredientes();
  const { data: productos } = useProductos();

  const stats = [
    {
      label: 'Categorías',
      count: categorias?.length ?? 0,
      icon: TagIcon,
      to: '/categorias',
    },
    {
      label: 'Ingredientes',
      count: ingredientes?.length ?? 0,
      icon: BeakerIcon,
      to: '/ingredientes',
    },
    {
      label: 'Productos',
      count: productos?.length ?? 0,
      icon: CubeIcon,
      to: '/productos',
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-1 text-sm text-gray-500">
          Resumen general del sistema de gestión
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat) => (
          <Link
            key={stat.label}
            to={stat.to}
            className="group bg-white rounded-lg shadow-sm border border-gray-200 p-6 flex flex-col hover:border-gray-300 hover:shadow-md transition-all"
          >
            <div className="flex items-start justify-between">
              <div>
                <p className="text-sm font-medium text-gray-500">
                  {stat.label}
                </p>
                <p className="mt-2 text-3xl font-semibold text-gray-900">
                  {stat.count}
                </p>
              </div>
              <div className="p-2 bg-gray-50 rounded-md border border-gray-100 group-hover:bg-slate-50 transition-colors">
                <stat.icon className="w-6 h-6 text-slate-600" />
              </div>
            </div>
            <p className="text-xs text-slate-500 mt-4 text-right opacity-0 group-hover:opacity-100 transition-opacity">
              Ver detalles &rarr;
            </p>
          </Link>
        ))}
      </div>

      {/* Quick info */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-4">
          Información del Proyecto
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">Frontend Component</span>
              <span className="text-sm font-medium text-gray-900">React + TS + Vite</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">Estilos UI</span>
              <span className="text-sm font-medium text-gray-900">Tailwind CSS (SaaS Light)</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">Gestor de Estado</span>
              <span className="text-sm font-medium text-gray-900">TanStack Query v5</span>
            </div>
          </div>
          <div className="space-y-3">
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">Backend System</span>
              <span className="text-sm font-medium text-gray-900">FastAPI + SQLModel</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-gray-100 last:border-0">
              <span className="text-sm text-gray-500">Base de Datos</span>
              <span className="text-sm font-medium text-gray-900">PostgreSQL</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
