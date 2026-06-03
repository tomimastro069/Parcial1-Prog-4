import { useEffect, useRef } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { useAuthStore } from '../store/authStore';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

const ESTADO_LABELS: Record<string, string> = {
  CONFIRMADO: ' Tu pedido fue confirmado',
  EN_PREP: ' Tu pedido está en preparación',
  EN_CAMINO: ' Tu pedido está en camino',
  ENTREGADO: ' Tu pedido fue entregado',
  CANCELADO: ' Tu pedido fue cancelado :c',
};

export function useWebSocket() {
  const qc = useQueryClient();
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectTimeout = useRef<ReturnType<typeof setTimeout>>();

  // Leemos el usuario fuera del effect para acceder siempre al valor actual
  const usuarioRef = useRef(useAuthStore.getState().usuario);
  const hasRoleRef = useRef(useAuthStore.getState().hasRole);

  useEffect(() => {
    // Suscribirse a cambios del store para mantener la referencia actualizada
    const unsub = useAuthStore.subscribe((s) => {
      usuarioRef.current = s.usuario;
      hasRoleRef.current = s.hasRole;
    });

    function connect() {
      const ws = new WebSocket(WS_URL);
      wsRef.current = ws;

      ws.onopen = () => console.log('[WS] Conectado');

      ws.onmessage = (e) => {
        try {
          const { event, data } = JSON.parse(e.data);
          handleEvent(event, data);
        } catch { }
      };

      ws.onclose = () => {
        console.log('[WS] Desconectado — reconectando en 3s...');
        reconnectTimeout.current = setTimeout(connect, 3000);
      };

      ws.onerror = () => ws.close();
    }

    function handleEvent(event: string, data: any) {
      const isAdmin = hasRoleRef.current('ADMIN') || hasRoleRef.current('PEDIDOS') || hasRoleRef.current('STOCK');
      const miId = usuarioRef.current?.id;

      switch (event) {
        case 'pedido.nuevo':
          qc.invalidateQueries({ queryKey: ['todosPedidos'] });
          qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
          // Solo notificar a admins/pedidos, no al cliente que lo creó
          if (isAdmin) {
            toast('🔔 Nuevo pedido recibido', { duration: 4000 });
          }
          break;

        case 'pedido.estado':
          qc.invalidateQueries({ queryKey: ['todosPedidos'] });
          qc.invalidateQueries({ queryKey: ['misPedidos'] });
          qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
          // Notificar al cliente dueño del pedido
          if (miId && data.usuario_id === miId) {
            const label = ESTADO_LABELS[data.estado];
            if (label) toast(label, { duration: 5000 });
          }
          break;

        case 'stock.actualizado':
          qc.invalidateQueries({ queryKey: ['ingredientes'] });
          qc.invalidateQueries({ queryKey: ['productos'] });
          qc.invalidateQueries({ queryKey: ['productos-admin'] });
          qc.invalidateQueries({ queryKey: ['ingredientesSinStock'] });
          break;

        case 'precios.actualizados':
          qc.invalidateQueries({ queryKey: ['productos'] });
          qc.invalidateQueries({ queryKey: ['productos-admin'] });
          if (isAdmin) toast('📊 Precios actualizados', { duration: 3000 });
          break;

        case 'ajuste.actualizado':
          qc.invalidateQueries({ queryKey: ['ajusteCostoEnvio'] });
          qc.invalidateQueries({ queryKey: ['ajusteIndiceGanancia'] });
          break;
      }
    }

    connect();

    return () => {
      unsub();
      clearTimeout(reconnectTimeout.current);
      wsRef.current?.close();
    };
  }, [qc]);
}
