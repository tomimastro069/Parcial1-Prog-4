import axiosClient from './axiosClient';

export interface PreferenciaResponse {
  preference_id: string;
  init_point: string;
}

export const crearPreferenciaMP = async (pedidoId: number): Promise<PreferenciaResponse> => {
  const { data } = await axiosClient.post('/api/v1/mercadopago/crear-preferencia', {
    pedido_id: pedidoId,
  });
  return data;
};
