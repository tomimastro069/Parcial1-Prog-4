import { useNavigate } from 'react-router-dom';

export default function CheckoutSuccess() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-cream">
      <div className="bg-cream-soft border border-line rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
        <h1 className="font-baskerville text-2xl font-bold text-coffee mb-2">¡Pago aprobado!</h1>
        <p className="text-clay mb-8">Tu pedido fue confirmado y está siendo procesado.</p>
        <button
          onClick={() => navigate('/store/mis-pedidos')}
          className="w-full bg-green-600 hover:bg-green-700 text-white py-3 rounded-sm font-semibold transition-colors"
        >
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
}
