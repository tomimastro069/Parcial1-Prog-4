import axiosClient from './axiosClient';

export interface UsuarioAdmin {
  id: number;
  nombre: string;
  apellido: string;
  email: string;
  rol: string;
  is_active: boolean;
  created_at: string;
}

export interface PaginatedUsuarios {
  items: UsuarioAdmin[];
  total: number;
  page: number;
  size: number;
  pages: number;
}

export const getUsuarios = async (page = 1, size = 15, search?: string): Promise<PaginatedUsuarios> => {
  const params: Record<string, any> = { page, size };
  if (search) params.search = search;
  const { data } = await axiosClient.get('/api/v1/usuarios/', { params });
  return data;
};

export const cambiarRol = async (id: number, rol: string): Promise<UsuarioAdmin> => {
  const { data } = await axiosClient.patch(`/api/v1/usuarios/${id}/rol`, { rol });
  return data;
};

export const toggleActivo = async (id: number): Promise<UsuarioAdmin> => {
  const { data } = await axiosClient.patch(`/api/v1/usuarios/${id}/toggle-activo`);
  return data;
};

export interface CrearUsuarioPayload {
  nombre: string;
  apellido: string;
  email: string;
  password: string;
  rol: string;
}

export const crearUsuario = async (payload: CrearUsuarioPayload): Promise<UsuarioAdmin> => {
  const { data } = await axiosClient.post('/api/v1/usuarios/', payload);
  return data;
};
