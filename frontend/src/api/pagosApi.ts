import axiosClient from './axiosClient';

export interface FormaPago {
  codigo: string;
  descripcion: string;
  habilitado: boolean;
}

export const getFormasPago = async (): Promise<FormaPago[]> => {
  const { data } = await axiosClient.get('/api/v1/pagos/');
  return data;
};
