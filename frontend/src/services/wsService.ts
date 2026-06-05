/**
 * WebSocket singleton — se conecta UNA sola vez independientemente de renders.
 * Los handlers se registran/desregistran desde los hooks.
 */
import { QueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

const WS_URL = import.meta.env.VITE_WS_URL || 'ws://localhost:8000/ws';
const API_URL = import.meta.env.VITE_API_URL ?? '';

const ESTADO_TOAST: Record<string, { label: string; style: { background: string; color: string; border: string } }> = {
  CONFIRMADO: {
    label: 'Tu pedido fue confirmado',
    style: { background: '#dbeafe', color: '#1e40af', border: '1px solid #bfdbfe' },
  },
  EN_PREP: {
    label: 'Tu pedido está en preparación',
    style: { background: '#ffedd5', color: '#9a3412', border: '1px solid #fed7aa' },
  },
  EN_CAMINO: {
    label: 'Tu pedido está en camino',
    style: { background: '#f3e8ff', color: '#6b21a8', border: '1px solid #e9d5ff' },
  },
  ENTREGADO: {
    label: 'Tu pedido fue entregado',
    style: { background: '#dcfce7', color: '#166534', border: '1px solid #bbf7d0' },
  },
  CANCELADO: {
    label: 'Tu pedido fue cancelado',
    style: { background: '#fee2e2', color: '#991b1b', border: '1px solid #fecaca' },
  },
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

function getToken(): string | null {
  try {
    const raw = localStorage.getItem('foodstore-auth');
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return parsed?.state?.accessToken || null;
  } catch { return null; }
}

function connect() {
  const token = getToken();
  if (!token) {
    // Sin token no intentamos conectar, reintentamos en 5s por si el usuario se loguea
    reconnectTimer = setTimeout(connect, 5000);
    return;
  }

  ws = new WebSocket(`${WS_URL}?token=${token}`);

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

async function syncCartStock() {
  try {
    const { useCartStore } = await import('../store/cartStore');
    const store = useCartStore.getState();
    const items = store.items;
    if (items.length === 0) return;

    // Fetch todos los productos de una para obtener stock actualizado
    const res = await fetch(`${API_URL}/api/v1/productos/?size=100&is_active=true`);
    if (!res.ok) return;
    const data = await res.json();
    const productos: Record<number, number> = {};
    for (const p of data.items) {
      productos[p.id] = p.stock_calculado;
    }

    for (const item of items) {
      const nuevoStock = productos[item.producto_id];
      if (nuevoStock !== undefined && nuevoStock !== item.stock) {
        store.updateStock(item.producto_id, nuevoStock);
      }
    }
  } catch { }
}

function handleEvent(event: string, data: any) {
  if (!qc) return;

  const isAdmin = getIsAdmin();
  const miId = getUsuarioId();

  switch (event) {
    case 'pedido.nuevo':
      qc.invalidateQueries({ queryKey: ['todosPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      qc.invalidateQueries({ queryKey: ['dashboardCategorias'] });
      qc.invalidateQueries({ queryKey: ['ingredientesSinStock'] });
      if (isAdmin) {
        toast('🔔 Nuevo pedido recibido', { duration: 4000, id: 'pedido-nuevo' });
      }
      break;

    case 'pedido.estado':
      qc.invalidateQueries({ queryKey: ['todosPedidos'] });
      qc.invalidateQueries({ queryKey: ['misPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardPedidos'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      qc.invalidateQueries({ queryKey: ['dashboardCategorias'] });
      qc.invalidateQueries({ queryKey: ['ingredientesSinStock'] });
      if (miId && data.usuario_id === miId && !isAdmin) {
        const info = ESTADO_TOAST[data.estado];
        if (info) toast(info.label, { duration: 5000, id: `estado-${data.pedido_id}-${data.estado}`, style: info.style });
      }
      break;

    case 'stock.actualizado':
      qc.invalidateQueries({ queryKey: ['ingredientes'] });
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['productos-admin'] });
      qc.invalidateQueries({ queryKey: ['ingredientesSinStock'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      qc.invalidateQueries({ queryKey: ['dashboardCategorias'] });
      // Ajustar cantidades del carrito según nuevo stock
      syncCartStock();
      break;

    case 'precios.actualizados':
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['productos-admin'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      if (isAdmin) toast('📊 Precios actualizados', { duration: 3000, id: 'precios' });
      break;

    case 'precio.terminado.actualizado':
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['productos-admin'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      if (isAdmin) toast('📊 Precio de terminado actualizado', { duration: 3000, id: 'precio-terminado' });
      break;

    case 'producto.actualizado':
    case 'producto.eliminado':
      qc.invalidateQueries({ queryKey: ['productos'] });
      qc.invalidateQueries({ queryKey: ['productos-admin'] });
      qc.invalidateQueries({ queryKey: ['dashboardProductos'] });
      qc.invalidateQueries({ queryKey: ['dashboardCategorias'] });
      break;

    case 'ajuste.actualizado':
      qc.invalidateQueries({ queryKey: ['ajusteCostoEnvio'] });
      qc.invalidateQueries({ queryKey: ['ajusteIndiceGanancia'] });
      // Si cambió el costo de envío, actualizar también el cartStore
      if (data.clave === 'costo_envio') {
        import('../store/cartStore').then(m => m.useCartStore.getState().fetchCostoEnvio());
      }
      break;
  }
}

export function disconnectWebSocket() {
  clearTimeout(reconnectTimer);
  ws?.close();
  ws = null;
}
