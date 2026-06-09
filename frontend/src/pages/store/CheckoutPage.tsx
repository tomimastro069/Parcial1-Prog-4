import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation, useQuery } from '@tanstack/react-query';
import { useCartStore } from '../../store/cartStore';
import { getMisDirecciones } from '../../api/direccionesApi';
import AddressFormModal from '../../components/AddressFormModal';
import { getFormasPago } from '../../api/pagosApi';
import { createPedido } from '../../api/pedidosApi';
import MercadoPagoRedirectModal from '../../components/MercadoPagoRedirectModal';
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

  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showMercadoPagoModal, setShowMercadoPagoModal] = useState(false);

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
    onSuccess: async (data) => {
      toast.success(`Pedido #${data.id} creado con éxito!`);
      clearCart();

      if (data.forma_pago_codigo === 'MERCADOPAGO') {
        setShowMercadoPagoModal(true);
        try {
          const { crearPreferenciaMP } = await import('../../api/mercadopagoApi');
          const pref = await crearPreferenciaMP(data.id);
          window.location.href = pref.init_point;
        } catch (err: any) {
          const msg = err.response?.data?.detail || 'Error al conectar con Mercado Pago';
          setShowMercadoPagoModal(false);
          toast.error(msg);
          navigate('/store/mis-pedidos');
        }
      } else {
        navigate('/store/mis-pedidos');
      }
    },
    onError: (error: any) => {
      const msg = error.response?.data?.detail || 'Error al procesar el pedido';
      toast.error(msg);
    }
  });

  const costoEnvioValor = useCartStore(s => s.costoEnvioValor);

  if (items.length === 0) {
    return (
      <div className="py-10 flex flex-col items-center justify-center">
        <h2 className="font-baskerville text-2xl font-bold mb-4 text-coffee">Tu carrito está vacío</h2>
        <button onClick={() => navigate('/store')} className="bg-walnut hover:bg-walnut-soft text-tan px-6 py-2 rounded shadow transition-colors">
          Volver a la tienda
        </button>
      </div>
    );
  }
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
      <p className="eyebrow mb-2">Casi listo</p>
      <h1 className="font-baskerville text-3xl font-bold text-coffee mb-8 tracking-[-0.01em]">Finalizar compra</h1>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Seccion Detalles del Usuario */}
        <div className="col-span-2 space-y-6" style={{ animation: 'slideUp 0.3s ease-out' }}>

          {/* Direcciones */}
          <div className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm">
            <h2 className="font-baskerville text-xl font-bold mb-4 text-coffee">Tipo de entrega</h2>
            <div className="space-y-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="radio"
                  name="entrega"
                  className="form-radio accent-walnut text-walnut"
                  checked={selectedDireccion === null}
                  onChange={() => {
                    setSelectedDireccion(null);
                    setSelectedFormaPago('');
                  }}
                />
                <span>Retiro en local</span>
              </label>

              {isLoadingDirs ? (
                <p className="text-sm text-gray-500">Cargando direcciones...</p>
              ) : (
                <>
                  {direcciones?.map(dir => (
                    <label key={dir.id} className="flex items-center space-x-3 cursor-pointer">
                      <input
                        type="radio"
                        name="entrega"
                        className="form-radio accent-walnut text-walnut"
                        checked={selectedDireccion === dir.id}
                        onChange={() => {
                          setSelectedDireccion(dir.id);
                          setSelectedFormaPago('');
                        }}
                      />
                      <span>
                        Envío a: {dir.alias ? `[${dir.alias}] ` : ''}{dir.linea1}, {dir.ciudad}
                      </span>
                    </label>
                  ))}
                  <button
                    type="button"
                    onClick={() => setShowAddressModal(true)}
                    className="text-sm text-walnut hover:underline font-medium mt-2 block"
                  >
                    + Añadir nueva dirección
                  </button>
                </>
              )}
            </div>
          </div>

          {/* Forma de Pago */}
          <div className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm">
            <h2 className="font-baskerville text-xl font-bold mb-4 text-coffee">Forma de pago</h2>
            {isLoadingPagos ? (
              <p className="text-sm text-gray-500">Cargando formas de pago...</p>
            ) : (
              <div className="space-y-4">
                {formasPago?.filter(f => f.habilitado).filter(f => {
                  // Si es envío a domicilio, no permitir efectivo
                  if (selectedDireccion !== null && f.codigo === 'EFECTIVO') return false;
                  return true;
                }).map(forma => (
                  <label key={forma.codigo} className="flex items-center space-x-3 cursor-pointer">
                    <input
                      type="radio"
                      name="pago"
                      className="form-radio accent-walnut text-walnut"
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
          <div className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm">
            <h2 className="font-baskerville text-xl font-bold mb-4 text-coffee">Notas para el pedido (opcional)</h2>
            <textarea
              className="w-full border border-line bg-cream rounded p-3 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none"
              rows={3}
              placeholder="Aclaraciones, punto de referencia..."
              value={notas}
              onChange={e => setNotas(e.target.value)}
            />
          </div>

        </div>

        {/* Resumen del pedido */}
        <div className="col-span-1">
          <div className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm sticky top-20">
            <h2 className="font-baskerville text-xl font-bold mb-4 text-coffee">Resumen</h2>

            <div className="max-h-60 overflow-y-auto mb-4 border-b border-line pb-4 space-y-3">
              {items.map((item, idx) => (
                <div key={idx} className="flex justify-between text-sm">
                  <span className="text-clay font-medium">
                    {item.cantidad}x {item.nombre}
                  </span>
                  <span className="text-bark font-semibold">
                    ${(item.precio * item.cantidad).toFixed(2)}
                  </span>
                </div>
              ))}
            </div>

            <div className="space-y-2 text-sm text-clay mb-4 border-b border-line pb-4">
              <div className="flex justify-between">
                <span>Subtotal ({itemCount} ítems)</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span>Costo de envío</span>
                <span>${costoEnvio.toFixed(2)}</span>
              </div>
            </div>

            <div className="flex justify-between font-baskerville text-lg font-bold text-coffee mb-6">
              <span>Total</span>
              <span>${total.toFixed(2)}</span>
            </div>

            <button
              type="submit"
              disabled={createMutation.isPending}
              className="w-full bg-walnut hover:bg-walnut-soft text-tan py-3 rounded-lg font-inconsolata font-semibold tracking-[0.08em] uppercase shadow-md transition-colors disabled:opacity-50"
            >
              {createMutation.isPending ? 'Procesando...' : 'Confirmar Pedido'}
            </button>
          </div>
        </div>
      </form>

      <AddressFormModal
        isOpen={showAddressModal}
        onClose={() => setShowAddressModal(false)}
        onSuccess={(newDir) => setSelectedDireccion(newDir.id)}
      />

      <MercadoPagoRedirectModal isOpen={showMercadoPagoModal} />
    </div>
  );
}
