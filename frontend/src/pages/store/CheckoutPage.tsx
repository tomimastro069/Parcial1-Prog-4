import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import { getMisDirecciones } from '../../api/direccionesApi';
import { getFormasPago } from '../../api/pagosApi';
import { createPedido } from '../../api/pedidosApi';
import toast from 'react-hot-toast';

export default function CheckoutPage() {
  const navigate = useNavigate();
  const items = useCartStore(s => s.items);
  const subtotal = useCartStore(s => s.subtotal());
  const itemCount = useCartStore(s => s.itemCount());
  const clearCart = useCartStore(s => s.clearCart);

  const [selectedDireccion, setSelectedDireccion] = useState<number | null>(null);
  const [selectedFormaPago, setSelectedFormaPago] = useState<string>('');
  const [notas, setNotas] = useState('');

  useEffect(() => {
    useCartStore.getState().fetchCostoEnvio();
  }, []);

  const { data: direcciones, isLoading: isLoadingDirs } = useQuery({
    queryKey: ['misDirecciones'],
    queryFn: getMisDirecciones,
  });

  const { data: formasPago, isLoading: isLoadingPagos } = useQuery({
    queryKey: ['formasPago'],
    queryFn: getFormasPago,
  });

  const createMutation = useMutation({
    mutationFn: createPedido,
    onSuccess: (data) => {
      toast.success(`Pedido #${data.id} creado con éxito!`);
      clearCart();
      navigate('/store/mis-pedidos');
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Error al procesar el pedido';
      toast.error(msg);
    }
  });

  if (items.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">Tu carrito está vacío</h2>
        <button onClick={() => navigate('/store')} className="bg-[#D32F2F] text-white px-6 py-2 rounded shadow">
          Volver a la tienda
        </button>
      </div>
    );
  }

  const costoEnvioValor = useCartStore(s => s.costoEnvioValor);
  const costoEnvio = selectedDireccion ? costoEnvioValor : 0;
  const total = subtotal + costoEnvio;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFormaPago) {
      toast.error('Por favor seleccioná una forma de pago');
      return;
    }

    createMutation.mutate({
      direccion_id: selectedDireccion,
      forma_pago_codigo: selectedFormaPago,
      notas: notas,
      detalles: items.map(i => ({
        producto_id: i.producto_id,
        cantidad: i.cantidad,
        personalizacion: i.personalizacion || []
      }))
    });
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Finalizar Compra</h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Seccion Detalles del Usuario */}
          <div className="col-span-2 space-y-6" style={{ animation: 'slideUp 0.3s ease-out' }}>

            {/* Direcciones */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Tipo de Entrega</h2>
              <div className="space-y-4">
                <label className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="entrega"
                    className="form-radio text-[#D32F2F]"
                    checked={selectedDireccion === null}
                    onChange={() => setSelectedDireccion(null)}
                  />
                  <span>Retiro en local</span>
                </label>

                {isLoadingDirs ? (
                  <p className="text-sm text-gray-500">Cargando direcciones...</p>
                ) : (
                  direcciones?.map(dir => (
                    <label key={dir.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="entrega"
                        className="form-radio text-[#D32F2F]"
                        checked={selectedDireccion === dir.id}
                        onChange={() => setSelectedDireccion(dir.id)}
                      />
                      <span>
                        Envío a: {dir.alias ? `[${dir.alias}] ` : ''}{dir.linea1}, {dir.ciudad}
                      </span>
                    </label>
                  ))
                )}
              </div>
            </div>

            {/* Forma de Pago */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Forma de Pago</h2>
              {isLoadingPagos ? (
                <p className="text-sm text-gray-500">Cargando formas de pago...</p>
              ) : (
                <div className="space-y-4">
                  {formasPago?.filter(f => f.habilitado).map(forma => (
                    <label key={forma.codigo} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="pago"
                        className="form-radio text-[#D32F2F]"
                        value={forma.codigo}
                        checked={selectedFormaPago === forma.codigo}
                        onChange={(e) => setSelectedFormaPago(e.target.value)}
                      />
                      <span>{forma.descripcion}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>

            {/* Notas */}
            <div className="bg-white p-6 rounded-lg shadow">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Notas para el Pedido (Opcional)</h2>
              <textarea
                className="w-full border border-gray-300 rounded p-3 focus:ring-[#D32F2F] focus:border-[#D32F2F]"
                rows={3}
                placeholder="Aclaraciones, punto de referencia..."
                value={notas}
                onChange={e => setNotas(e.target.value)}
              />
            </div>

          </div>

          {/* Resumen del pedido */}
          <div className="col-span-1">
            <div className="bg-white p-6 rounded-lg shadow sticky top-6">
              <h2 className="text-xl font-semibold mb-4 text-gray-800">Resumen</h2>

              <div className="max-h-60 overflow-y-auto mb-4 border-b pb-4 space-y-3">
                {items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-sm">
                    <span className="text-gray-600 font-medium">
                      {item.cantidad}x {item.nombre}
                    </span>
                    <span className="text-gray-900 font-semibold">
                      ${(item.precio * item.cantidad).toFixed(2)}
                    </span>
                  </div>
                ))}
              </div>

              <div className="space-y-2 text-sm text-gray-600 mb-4 border-b pb-4">
                <div className="flex justify-between">
                  <span>Subtotal ({itemCount} ítems)</span>
                  <span>${subtotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between">
                  <span>Costo de envío</span>
                  <span>${costoEnvio.toFixed(2)}</span>
                </div>
              </div>

              <div className="flex justify-between text-lg font-bold text-gray-900 mb-6">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>

              <button
                type="submit"
                disabled={createMutation.isPending}
                className="w-full bg-[#D32F2F] hover:bg-red-800 text-white py-3 rounded-lg font-semibold shadow-md transition-colors disabled:opacity-50"
              >
                {createMutation.isPending ? 'Procesando...' : 'Confirmar Pedido'}
              </button>
            </div>
          </div>
        </form>
    </div>
  );
}
