import axiosClient from './axiosClient';
export interface Ajuste {
    clave: string;
    valor: string;
    descripcion?: string;
}
export const getAjuste = async (clave: string): Promise<Ajuste> => {
    const { data } = await axiosClient.get(`/api/v1/ajustes/${clave}`);
    return data;
};
export const updateAjuste = async (clave: string, valor: string): Promise<Ajuste> => {
    const { data } = await axiosClient.patch(`/api/v1/ajustes/${clave}`, { valor });
    return data;
};
