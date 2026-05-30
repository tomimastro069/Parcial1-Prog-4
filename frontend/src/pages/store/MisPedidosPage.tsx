import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { getMisPedidos } from '../../api/pedidosApi';
import { crearPreferenciaMP } from '../../api/mercadopagoApi';
import toast from 'react-hot-toast';


export default function MisPedidosPage() {
  const [page, setPage] = useState(1);
  const [pagandoId, setPagandoId] = useState<number | null>(null);
  const size = 12;

  const handlePagarMP = async (pedidoId: number) => {
    setPagandoId(pedidoId);
    try {
      const pref = await crearPreferenciaMP(pedidoId);
      window.location.href = pref.init_point;
    } catch (err: any) {
      toast.error(err.response?.data?.detail || 'Error al conectar con Mercado Pago');
      setPagandoId(null);
    }
  };

  const { data, isLoading, isError } = useQuery({
    queryKey: ['misPedidos', page],
    queryFn: () => getMisPedidos(page, size),
  });

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mis Pedidos</h1>

        {isLoading ? (
          <div className="text-center py-16 text-gray-500">Cargando pedidos...</div>
        ) : isError ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-red-500 mb-3">Error al cargar pedidos.</p>
            <p className="text-sm text-gray-500">Verificá que el servidor esté activo.</p>
          </div>
        ) : !data || data.items.length === 0 ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-gray-600">No realizaste ningún pedido todavía.</p>
          </div>
        ) : (
          <div className="space-y-6">
            {data.items.map((pedido, index) => (
              <div
                key={pedido.id}
                className="bg-white rounded-lg shadow border border-gray-200 overflow-hidden"
                style={{ animation: 'slideUp 0.3s ease-out both', animationDelay: `${index * 0.06}s` }}
              >
                <div className="bg-gray-100 px-6 py-4 border-b flex flex-wrap justify-between items-center gap-4">
                  <div>
                    <span className="text-sm text-gray-500">Pedido #{pedido.id}</span>
                    <p className="text-sm font-semibold text-gray-800">
                      Fecha: {new Date(pedido.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div>
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-[#FFF3E0] text-[#E65100]">
                      {pedido.estado_codigo}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <span className="text-sm text-gray-500">Total</span>
                      <p className="text-lg font-bold text-gray-900">${pedido.total.toFixed(2)}</p>
                    </div>
                    {pedido.estado_codigo === 'PENDIENTE' && pedido.forma_pago_codigo === 'MERCADOPAGO' && (
                      <button
                        onClick={() => handlePagarMP(pedido.id)}
                        disabled={pagandoId === pedido.id}
                        className="flex items-center gap-2 px-4 py-2 bg-[#009ee3] hover:bg-[#007db8] text-white text-sm font-semibold rounded-lg transition-colors disabled:opacity-60 shadow-sm"
                      >
                        {pagandoId === pedido.id ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                            Redirigiendo...
                          </>
                        ) : (
                          <>💳 Pagar con MP</>
                        )}
                      </button>
                    )}
                  </div>
                </div>
                
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Detalles</h4>
                    <ul className="space-y-2 text-sm text-gray-600">
                      {pedido.detalles.map((d: any) => (
                        <li key={d.producto_id} className="flex justify-between">
                          <span>{d.cantidad}x {d.nombre_snapshot}</span>
                          <span>${d.subtotal_snap.toFixed(2)}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-semibold text-gray-700 mb-2">Resumen</h4>
                    <ul className="space-y-1 text-sm text-gray-600">
                      <li>Forma de pago: <span className="font-medium">{pedido.forma_pago_codigo}</span></li>
                      <li>Entrega: <span className="font-medium">{pedido.direccion_id ? `Envío (ID: ${pedido.direccion_id})` : 'Retiro en local'}</span></li>
                      <li>Costo de envío: <span className="font-medium">${pedido.costo_envio.toFixed(2)}</span></li>
                    </ul>
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {data.pages > 1 && (
              <div className="flex justify-center items-center space-x-2 mt-8">
                <button
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Anterior
                </button>
                <span className="text-sm text-gray-600">
                  Página {page} de {data.pages}
                </span>
                <button
                  disabled={page === data.pages}
                  onClick={() => setPage(p => p + 1)}
                  className="px-3 py-1 border rounded hover:bg-gray-100 disabled:opacity-50"
                >
                  Siguiente
                </button>
              </div>
            )}
          </div>
        )}
    </div>
  );
}
