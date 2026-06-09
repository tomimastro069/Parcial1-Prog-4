import { RegisterForm } from '../../features/auth/RegisterForm';

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-espresso via-bark to-walnut flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-tan/10 backdrop-blur mb-4 border border-gold/30">
            <span className="text-3xl"></span>
          </div>
          <h1 className="font-baskerville text-4xl font-bold text-tan tracking-[-0.01em]">Food store</h1>
          <div className="w-10 h-px bg-gold/60 mx-auto my-4" />
          <p className="eyebrow text-[#8B7355]">Creá tu cuenta</p>
        </div>

        <div className="bg-cream-soft rounded-2xl shadow-xl p-8 border border-line">
          <h2 className="font-baskerville text-xl font-bold text-coffee mb-6">Crear cuenta</h2>
          <RegisterForm />
        </div>
      </div>
    </div>
  );
}
