import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDireccion, type Direccion } from '../api/direccionesApi';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newDir: Direccion) => void;
}

export default function AddressFormModal({ isOpen, onClose, onSuccess }: AddressFormModalProps) {
  const queryClient = useQueryClient();
  const [newAddress, setNewAddress] = useState({
    alias: '',
    linea1: '',
    linea2: '',
    ciudad: '',
    provincia: '',
    codigo_postal: '',
    latitud: '',
    longitud: '',
    es_principal: false,
  });

  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Direccion, 'id' | 'usuario_id'>) => createDireccion(data),
    onSuccess: (newDir) => {
      // Invalidate queries from both Checkout and Profile to keep them fresh
      queryClient.invalidateQueries({ queryKey: ['misDirecciones'] });
      queryClient.invalidateQueries({ queryKey: ['misDireccionesPerfil'] });
      toast.success('Dirección creada');
      setNewAddress({
        alias: '',
        linea1: '',
        linea2: '',
        ciudad: '',
        provincia: '',
        codigo_postal: '',
        latitud: '',
        longitud: '',
        es_principal: false,
      });
      if (onSuccess) onSuccess(newDir);
      onClose();
    },
    onError: () => toast.error('Error al crear dirección'),
  });

  const handleAddAddress = (e: React.FormEvent) => {
    e.preventDefault();
    const payload: Omit<Direccion, 'id' | 'usuario_id'> = {
      alias: newAddress.alias || undefined,
      linea1: newAddress.linea1,
      linea2: newAddress.linea2 || undefined,
      ciudad: newAddress.ciudad,
      provincia: newAddress.provincia || undefined,
      codigo_postal: newAddress.codigo_postal || undefined,
      latitud: newAddress.latitud ? parseFloat(newAddress.latitud) : undefined,
      longitud: newAddress.longitud ? parseFloat(newAddress.longitud) : undefined,
      es_principal: newAddress.es_principal,
    };
    createAddressMutation.mutate(payload);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Nueva Dirección</h2>
        <form onSubmit={handleAddAddress} className="space-y-3">
          <input type="text" placeholder="Alias (Ej. Casa)(Opcional)" value={newAddress.alias} onChange={e => setNewAddress({ ...newAddress, alias: e.target.value })} className="w-full border rounded p-2" />
          <input type="text" placeholder="Línea 1 *" value={newAddress.linea1} onChange={e => setNewAddress({ ...newAddress, linea1: e.target.value })} required className="w-full border rounded p-2" />
          <input type="text" placeholder="Línea 2 (Opcional)" value={newAddress.linea2} onChange={e => setNewAddress({ ...newAddress, linea2: e.target.value })} className="w-full border rounded p-2" />
          <input type="text" placeholder="Ciudad *" value={newAddress.ciudad} onChange={e => setNewAddress({ ...newAddress, ciudad: e.target.value })} required className="w-full border rounded p-2" />
          <input type="text" placeholder="Provincia (Opcional)" value={newAddress.provincia} onChange={e => setNewAddress({ ...newAddress, provincia: e.target.value })} className="w-full border rounded p-2" />
          <input type="text" placeholder="Código Postal (Opcional)" value={newAddress.codigo_postal} onChange={e => setNewAddress({ ...newAddress, codigo_postal: e.target.value })} className="w-full border rounded p-2" />

          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.000001" placeholder="Latitud" value={newAddress.latitud} onChange={e => setNewAddress({ ...newAddress, latitud: e.target.value })} className="w-full border rounded p-2" />
            <input type="number" step="0.000001" placeholder="Longitud" value={newAddress.longitud} onChange={e => setNewAddress({ ...newAddress, longitud: e.target.value })} className="w-full border rounded p-2" />
          </div>

          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={newAddress.es_principal}
              onChange={(e) => setNewAddress({ ...newAddress, es_principal: e.target.checked })}
              className="form-checkbox h-4 w-4 text-[#2E75B6]"
            />
            <span className="text-sm">Dirección principal</span>
          </label>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-gray-600 bg-gray-200 rounded hover:bg-gray-300">Cancelar</button>
            <button type="submit" disabled={createAddressMutation.isPending} className="px-4 py-2 text-white bg-[#D32F2F] rounded hover:bg-red-800 disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
