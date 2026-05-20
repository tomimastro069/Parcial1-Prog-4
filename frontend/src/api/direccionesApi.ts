import axiosClient from './axiosClient';

export interface Direccion {
  id: number;
  usuario_id: number;
  alias?: string;
  linea1: string;
  linea2?: string;
  ciudad: string;
  provincia?: string;
  codigo_postal?: string;
  latitud?: number;
  longitud?: number;
  es_principal: boolean;
}

export const getMisDirecciones = async (): Promise<Direccion[]> => {
  const { data } = await axiosClient.get('/api/v1/direcciones/mis-direcciones');
  return data;
};

export const createDireccion = async (direccion: Omit<Direccion, 'id' | 'usuario_id'>): Promise<Direccion> => {
  const { data } = await axiosClient.post('/api/v1/direcciones/', direccion);
  return data;
};

export const deleteDireccion = async (id: number): Promise<void> => {
  await axiosClient.delete(`/api/v1/direcciones/${id}`);
};
