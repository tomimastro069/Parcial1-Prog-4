import { useEffect } from 'react';
import { RouterProvider } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import toast, { Toaster, ToastBar } from 'react-hot-toast';
import { router } from './routes/AppRoutes';
import { initWebSocket, setUserGetters, disconnectWebSocket } from './services/wsService';
import { useAuthStore } from './store/authStore';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 2,
      refetchOnWindowFocus: false,
    },
  },
});

// Inicializar WS una sola vez fuera de React (no se ve afectado por StrictMode)
initWebSocket(queryClient);

function AppInner() {
  useEffect(() => {
    // Mantener los getters de usuario sincronizados
    const unsub = useAuthStore.subscribe(() => {
      setUserGetters(
        () => useAuthStore.getState().usuario?.id,
        () => {
          const hasRole = useAuthStore.getState().hasRole;
          return hasRole('ADMIN') || hasRole('PEDIDOS') || hasRole('STOCK');
        }
      );
    });
    // Setear valores iniciales
    setUserGetters(
      () => useAuthStore.getState().usuario?.id,
      () => {
        const hasRole = useAuthStore.getState().hasRole;
        return hasRole('ADMIN') || hasRole('PEDIDOS') || hasRole('STOCK');
      }
    );
    return () => unsub();
  }, []);

  return (
    <>
      <RouterProvider router={router} />
      <Toaster
        position="bottom-right"
        toastOptions={{
          duration: 3500,
          style: {
            background: '#ffffff',
            color: '#111827',
            border: '1px solid #e5e7eb',
            borderRadius: '8px',
            fontSize: '18px',
            padding: '20px',
            boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t} style={{ ...t.style, padding: 0, background: 'transparent', boxShadow: 'none' }}>
            {({ icon, message }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '12px 16px',
                borderRadius: '8px',
                background: t.style?.background || '#ffffff',
                color: t.style?.color || '#111827',
                border: (t.style?.border as string) || '1px solid #e5e7eb',
                boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
                fontSize: '18px',
              }}>
                {icon}
                <div style={{ flex: 1 }}>{message}</div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: t.style?.color || '#6b7280',
                    fontSize: '18px',
                    padding: '0 0 0 8px',
                    opacity: 0.6,
                  }}
                >
                  ✕
                </button>
              </div>
            )}
          </ToastBar>
        )}
      </Toaster>
    </>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppInner />
    </QueryClientProvider>
  );
}

export default App;
