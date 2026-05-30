import { useNavigate } from 'react-router-dom';

export default function CheckoutFailure() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-red-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago rechazado</h1>
        <p className="text-gray-500 mb-8">No pudimos procesar tu pago. Podés intentarlo de nuevo.</p>
        <div className="flex flex-col gap-3">
          <button
            onClick={() => navigate('/store/mis-pedidos')}
            className="w-full bg-[#D32F2F] hover:bg-red-800 text-white py-3 rounded-lg font-semibold transition-colors"
          >
            Ver mis pedidos
          </button>
          <button
            onClick={() => navigate('/store')}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 py-3 rounded-lg font-semibold transition-colors"
          >
            Volver a la tienda
          </button>
        </div>
      </div>
    </div>
  );
}
