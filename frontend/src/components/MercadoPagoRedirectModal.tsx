import { useEffect, useRef } from 'react';
import { SparklesIcon } from '@heroicons/react/24/outline';

interface MercadoPagoRedirectModalProps {
  isOpen: boolean;
}

export default function MercadoPagoRedirectModal({ isOpen }: MercadoPagoRedirectModalProps) {
  const overlayRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      ref={overlayRef}
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm" style={{ animation: 'fadeIn 0.2s ease-out' }} />

      {/* Modal Box - Mucho más grande y centrado */}
      <div
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl p-12"
        style={{ animation: 'slideUp 0.3s ease-out' }}
      >
        <div className="flex flex-col items-center justify-center gap-6">
          {/* Icono con animación */}
          <div className="relative w-24 h-24">
            <div
              className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full blur-xl opacity-50"
              style={{ animation: 'pulse 2s ease-in-out infinite' }}
            />
            <div className="absolute inset-0 flex items-center justify-center bg-white rounded-full border-4 border-blue-500">
              <SparklesIcon className="w-12 h-12 text-blue-500" />
            </div>
          </div>

          {/* Título grande */}
          <h2 className="text-4xl font-bold text-gray-900 text-center">
            Redirigiendo a Mercado Pago
          </h2>

          {/* Subtítulo */}
          <p className="text-xl text-gray-600 text-center">
            Por favor espera mientras te llevamos a completar tu pago
          </p>

          {/* Loader animado */}
          <div className="flex gap-2 mt-4">
            <div
              className="w-4 h-4 bg-blue-500 rounded-full"
              style={{
                animation: 'bounce 1.4s infinite',
                animationDelay: '0s',
              }}
            />
            <div
              className="w-4 h-4 bg-blue-500 rounded-full"
              style={{
                animation: 'bounce 1.4s infinite',
                animationDelay: '0.2s',
              }}
            />
            <div
              className="w-4 h-4 bg-blue-500 rounded-full"
              style={{
                animation: 'bounce 1.4s infinite',
                animationDelay: '0.4s',
              }}
            />
          </div>
        </div>

        {/* Estilos de animación */}
        <style>{`
          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          @keyframes slideUp {
            from {
              transform: translateY(20px);
              opacity: 0;
            }
            to {
              transform: translateY(0);
              opacity: 1;
            }
          }

          @keyframes bounce {
            0%, 80%, 100% {
              transform: translateY(0);
              opacity: 1;
            }
            40% {
              transform: translateY(-10px);
              opacity: 0.7;
            }
          }

          @keyframes pulse {
            0%, 100% {
              opacity: 0.5;
              transform: scale(1);
            }
            50% {
              opacity: 1;
              transform: scale(1.1);
            }
          }
        `}</style>
      </div>
    </div>
  );
}
