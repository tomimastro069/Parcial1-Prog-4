import { RegisterForm } from '../../features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#1F3864] to-[#2E75B6] flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-white/10 backdrop-blur mb-4">
            <span className="text-3xl">🍔</span>
          </div>
          <h1 className="text-3xl font-bold text-white">Food Store</h1>
          <p className="text-blue-200 mt-1 text-sm">Creá tu cuenta</p>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Crear cuenta</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
