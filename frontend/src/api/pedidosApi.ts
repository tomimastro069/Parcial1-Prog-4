import axiosClient from './axiosClient';

export interface DetallePedidoInput {
  producto_id: number;
  cantidad: number;
  personalizacion?: number[];
}

export interface PedidoCreatePayload {
  direccion_id?: number | null;
  forma_pago_codigo: string;
  notas?: string;
  detalles: DetallePedidoInput[];
}

export interface PedidoResponse {
  id: number;
  usuario_id: number;
  direccion_id: number | null;
  estado_codigo: string;
  forma_pago_codigo: string;
  subtotal: number;
  descuento: number;
  costo_envio: number;
  total: number;
  notas: string | null;
  created_at: string;
  updated_at: string;
  detalles: any[];
  historial: any[];
}

export interface PaginatedPedidos {
  items: PedidoResponse[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const getMisPedidos = async (page = 1, size = 12): Promise<PaginatedPedidos> => {
  const { data } = await axiosClient.get('/api/v1/pedidos/mis-pedidos', { params: { page, size } });
  return data;
};

export const getTodosPedidos = async (page = 1, size = 12): Promise<PaginatedPedidos> => {
  const { data } = await axiosClient.get('/api/v1/pedidos/', { params: { page, size } });
  return data;
};

export const createPedido = async (payload: PedidoCreatePayload): Promise<PedidoResponse> => {
  const { data } = await axiosClient.post('/api/v1/pedidos/', payload);
  return data;
};

export const updateEstadoPedido = async (pedidoId: number, nuevoEstado: string, motivo?: string): Promise<PedidoResponse> => {
  const { data } = await axiosClient.patch(`/api/v1/pedidos/${pedidoId}/estado`, {
    nuevo_estado_codigo: nuevoEstado,
    motivo
  });
  return data;
};

export const getEstadosPosibles = async (): Promise<{codigo: string; descripcion: string; orden: number; es_terminal: boolean}[]> => {
  const { data } = await axiosClient.get('/api/v1/pedidos/estados');
  return data;
};
