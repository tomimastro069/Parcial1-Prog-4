import { useParams, Link } from 'react-router-dom';
import { ArrowLeftIcon, TagIcon, CubeIcon } from '@heroicons/react/24/outline';
import { useProducto } from '../hooks/useProductos';
import LoadingSpinner from '../components/LoadingSpinner';
import ErrorMessage from '../components/ErrorMessage';

export default function ProductoDetallePage() {
  const { id } = useParams<{ id: string }>();
  const productoId = Number(id);
  const { data: producto, isLoading, isError, refetch } = useProducto(productoId);

  if (isLoading) return <LoadingSpinner text="Consultando registro..." />;
  if (isError) return <ErrorMessage message="No hay información." onRetry={refetch} />;
  if (!producto) return <ErrorMessage message="Dato vacío." />;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <Link
        to="/productos"
        className="inline-flex items-center gap-2 text-gray-500 hover:text-gray-900 text-sm font-medium py-2 transition-colors"
      >
        <ArrowLeftIcon className="w-4 h-4" />
        Volver a la tabla
      </Link>

      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden shadow-sm">
        {/* Cabecera solida y limpia */}
        <div className="px-6 py-8 border-b border-gray-200 bg-gray-50 flex items-start justify-between">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 bg-white border border-gray-200 rounded-md flex items-center justify-center shadow-sm">
              <CubeIcon className="w-7 h-7 text-gray-400" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">
                {producto.nombre}
              </h1>
              <p className="text-sm text-gray-500 font-mono mt-1">
                Ref ID: #{producto.id}
              </p>
            </div>
          </div>
          <div className="text-right">
             <span className="block text-sm text-gray-500 uppercase tracking-widest">Valor Unitario</span>
             <span className="block text-3xl font-bold text-slate-900 mt-1">${producto.precio.toFixed(2)}</span>
          </div>
        </div>

        {/* Info adicional */}
        <div className="p-6 space-y-8">
          {producto.descripcion && (
            <div>
              <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">
                Descripción Comercial
              </h3>
              <p className="text-gray-600 text-sm leading-relaxed">
                {producto.descripcion}
              </p>
            </div>
          )}

          <div>
            <h3 className="text-sm font-semibold text-gray-900 border-b border-gray-100 pb-2 mb-3">
              Filiación
            </h3>
            {producto.categoria ? (
              <div className="inline-flex items-center gap-3 px-4 py-3 rounded-md bg-gray-50 border border-gray-200">
                <TagIcon className="w-5 h-5 text-gray-400" />
                <div>
                  <p className="text-sm font-semibold text-gray-900">
                    {producto.categoria.nombre}
                  </p>
                  {producto.categoria.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      {producto.categoria.descripcion}
                    </p>
                  )}
                </div>
              </div>
            ) : (
              <p className="text-gray-500 text-sm italic">Ítem no categorizado.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
