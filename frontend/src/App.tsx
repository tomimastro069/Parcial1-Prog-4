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
          // Contenedor externo invisible: todo el estilo va en el div interno
          style: {
            background: 'transparent',
            boxShadow: 'none',
            border: 'none',
            borderRadius: 0,
            padding: 0,
            margin: 0,
            color: '#1A1510',
            fontSize: '18px',
          },
        }}
      >
        {(t) => (
          <ToastBar toast={t} style={{ ...t.style, padding: 0, background: 'transparent', boxShadow: 'none' }}>
            {({ icon, message }) => (
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '14px 18px',
                borderRadius: '18px',
                background: '#FBF8F0',
                color: '#1A1510',
                border: '1px solid #E2D4AE',
                boxShadow: '0 10px 24px -8px rgb(28 23 16 / 0.22)',
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
                    color: t.style?.color || '#7A6848',
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
