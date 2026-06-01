import axiosClient from './axiosClient';

export interface UploadResult {
  url: string;
  public_id: string;
}

export const uploadImagen = async (file: File): Promise<UploadResult> => {
  const formData = new FormData();
  formData.append('file', file);
  const { data } = await axiosClient.post('/api/v1/imagenes/upload', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return data;
};

export const deleteImagen = async (public_id: string): Promise<void> => {
  await axiosClient.delete('/api/v1/imagenes/delete', { data: { public_id } });
};
