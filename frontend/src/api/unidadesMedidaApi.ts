import axiosClient from './axiosClient';
import type { UnidadMedida, UnidadMedidaCreate } from '../types';

export const unidadesMedidaApi = {
  list: () =>
    axiosClient.get<UnidadMedida[]>('/api/v1/unidades-medida/').then((r) => r.data),
  
  create: (data: UnidadMedidaCreate) =>
    axiosClient.post<UnidadMedida>('/api/v1/unidades-medida/', data).then((r) => r.data),

  delete: (id: number) =>
    axiosClient.delete(`/api/v1/unidades-medida/${id}`),
};
