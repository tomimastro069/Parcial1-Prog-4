import { useNavigate } from 'react-router-dom';

export default function CheckoutFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-cream-soft border border-line rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="font-baskerville text-2xl font-bold text-coffee mb-2">Pago rechazado</h1>
        <p className="text-clay mb-8">No pudimos procesar tu pago. Podés intentarlo de nuevo.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/store/mis-pedidos')}
            className="w-full bg-walnut hover:bg-walnut-soft text-tan py-3 rounded-sm font-inconsolata font-semibold tracking-[0.08em] uppercase transition-colors"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate('/store')}
            className="w-full border border-line bg-cream hover:bg-cream-deep text-bark py-3 rounded-sm font-semibold transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
