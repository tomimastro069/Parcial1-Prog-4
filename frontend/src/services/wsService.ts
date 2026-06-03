/**
 * WebSocket singleton — se conecta UNA sola vez independientemente de renders.
 * Los handlers se registran/desregistran desde los hooks.
 */
import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';

const ESTADO_LABELS: Record<string, string> = {
  CONFIRMADO: 'Tu pedido fue confirmado ✅',
  EN_PREP:    'Tu pedido está en preparación 👨‍🍳',
  EN_CAMINO:  'Tu pedido está en camino 🛵',
  ENTREGADO:  'Tu pedido fue entregado 🎉',
  CANCELADO:  'Tu pedido fue cancelado ❌',
};

let ws: WebSocket | null = null;
let qc: QueryClient | null = null;
let reconnectTimer: ReturnType<typeof setTimeout>;

// Callbacks para obtener el estado actual del usuario (se setean desde el hook)
let getUsuarioId: () => number | undefined = () => undefined;
let getIsAdmin: () => boolean = () => false;

export function initWebSocket(queryClient: QueryClient) {
  if (ws && ws.readyState !== WebSocket.CLOSED) return; // ya conectado
  qc = queryClient;
  connect();
}

export function setUserGetters(
  userId: () => number | undefined,
  isAdmin: () => boolean
) {
  getUsuarioId = userId;
  getIsAdmin = isAdmin;
}

function connect() {
  ws = new WebSocket(WS_URL);

  ws.onopen = () => console.log('[WS] Conectado');

  ws.onmessage = (e) => {
    try {
      const { event, data } = JSON.parse(e.data);
      handleEvent(event, data);
    } catch { }
  };

  ws.onclose = () => {
    console.log('[WS] Desconectado — reconectando en 3s...');
    reconnectTimer = setTimeout(connect, 3000);
  };

  ws.onerror = () => ws?.close();
}

function handleEvent(event: string, data: any) {
  if (!qc) return;

  const isAdmin = getIsAdmin();
  const miId = getUsuarioId();

  switch (event) {
    case 'pedido.nuevo':
      qc.invalidateQueries({ queryKey: ['todosPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
      if (isAdmin) {
        toast('🔔 Nuevo pedido recibido', { duration: 4000, id: 'pedido-nuevo' });
      }
      break;

    case 'pedido.estado':
      qc.invalidateQueries({ queryKey: ['todosPedidos'] });
      qc.invalidateQueries({ queryKey: ['misPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
      if (miId && data.usuario_id === miId && !isAdmin) {
        const label = ESTADO_LABELS[data.estado];
        if (label) toast(label, { duration: 5000, id: `estado-${data.pedido_id}-${data.estado}` });
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
      if (isAdmin) toast('📊 Precios actualizados', { duration: 3000, id: 'precios' });
      break;

    case 'ajuste.actualizado':
      qc.invalidateQueries({ queryKey: ['ajusteCostoEnvio'] });
      qc.invalidateQueries({ queryKey: ['ajusteIndiceGanancia'] });
      break;
  }
}

export function disconnectWebSocket() {
  clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
}
