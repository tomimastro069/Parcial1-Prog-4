import { useNavigate } from 'react-router-dom';

export default function CheckoutPending() {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="bg-white rounded-xl shadow-lg p-10 max-w-md w-full text-center">
        <div className="flex items-center justify-center w-20 h-20 rounded-full bg-yellow-100 mx-auto mb-6">
          <svg className="w-10 h-10 text-yellow-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Pago pendiente</h1>
        <p className="text-gray-500 mb-8">Tu pago está siendo procesado. Te notificaremos cuando sea confirmado.</p>
        <button
          onClick={() => navigate('/store/mis-pedidos')}
          className="w-full bg-yellow-500 hover:bg-yellow-600 text-white py-3 rounded-lg font-semibold transition-colors"
        >
          Ver mis pedidos
        </button>
      </div>
    </div>
  );
}
