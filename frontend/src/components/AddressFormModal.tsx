import React, { useState, useEffect } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';
import { createDireccion, updateDireccion, type Direccion } from '../api/direccionesApi';

interface AddressFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: (newDir: Direccion) => void;
  initialData?: Direccion;
}

export default function AddressFormModal({ isOpen, onClose, onSuccess, initialData }: AddressFormModalProps) {
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

  useEffect(() => {
    if (initialData && isOpen) {
      setNewAddress({
        alias: initialData.alias || '',
        linea1: initialData.linea1 || '',
        linea2: initialData.linea2 || '',
        ciudad: initialData.ciudad || '',
        provincia: initialData.provincia || '',
        codigo_postal: initialData.codigo_postal || '',
        latitud: initialData.latitud?.toString() || '',
        longitud: initialData.longitud?.toString() || '',
        es_principal: initialData.es_principal || false,
      });
    } else if (isOpen && !initialData) {
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
    }
  }, [initialData, isOpen]);

  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Direccion, 'id' | 'usuario_id'>) => createDireccion(data),
    onSuccess: (newDir) => {
      // Invalidate queries from both Checkout and Profile to keep them fresh
      queryClient.invalidateQueries({ queryKey: ['misDirecciones'] });
      queryClient.invalidateQueries({ queryKey: ['misDireccionesPerfil'] });
      toast.success('Dirección creada');
      if (onSuccess) onSuccess(newDir);
      onClose();
    },
    onError: () => toast.error('Error al crear dirección'),
  });

  const updateAddressMutation = useMutation({
    mutationFn: (data: { id: number, payload: Partial<Omit<Direccion, 'id' | 'usuario_id'>> }) => updateDireccion(data.id, data.payload),
    onSuccess: (updatedDir) => {
      queryClient.invalidateQueries({ queryKey: ['misDirecciones'] });
      queryClient.invalidateQueries({ queryKey: ['misDireccionesPerfil'] });
      toast.success('Dirección actualizada');
      if (onSuccess) onSuccess(updatedDir);
      onClose();
    },
    onError: () => toast.error('Error al actualizar dirección'),
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
    
    if (initialData) {
      updateAddressMutation.mutate({ id: initialData.id, payload });
    } else {
      createAddressMutation.mutate(payload);
    }
  };

  if (!isOpen) return null;

  const isPending = createAddressMutation.isPending || updateAddressMutation.isPending;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-cream-soft border border-line rounded-lg shadow-lg p-6 w-full max-w-md">
        <h2 className="font-baskerville text-xl font-bold mb-4 text-coffee">{initialData ? 'Editar dirección' : 'Nueva dirección'}</h2>
        <form onSubmit={handleAddAddress} className="space-y-3">
          <input type="text" placeholder="Alias (Ej. Casa)(Opcional)" value={newAddress.alias} onChange={e => setNewAddress({ ...newAddress, alias: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          <input type="text" placeholder="Línea 1 *" value={newAddress.linea1} onChange={e => setNewAddress({ ...newAddress, linea1: e.target.value })} required className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          <input type="text" placeholder="Línea 2 (Opcional)" value={newAddress.linea2} onChange={e => setNewAddress({ ...newAddress, linea2: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          <input type="text" placeholder="Ciudad *" value={newAddress.ciudad} onChange={e => setNewAddress({ ...newAddress, ciudad: e.target.value })} required className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          <input type="text" placeholder="Provincia (Opcional)" value={newAddress.provincia} onChange={e => setNewAddress({ ...newAddress, provincia: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          <input type="text" placeholder="Código Postal (Opcional)" value={newAddress.codigo_postal} onChange={e => setNewAddress({ ...newAddress, codigo_postal: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />

          <div className="grid grid-cols-2 gap-2">
            <input type="number" step="0.000001" placeholder="Latitud" value={newAddress.latitud} onChange={e => setNewAddress({ ...newAddress, latitud: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
            <input type="number" step="0.000001" placeholder="Longitud" value={newAddress.longitud} onChange={e => setNewAddress({ ...newAddress, longitud: e.target.value })} className="w-full border border-line bg-cream rounded p-2 focus:ring-2 focus:ring-walnut/20 focus:border-walnut focus:outline-none" />
          </div>

          <label className="flex items-center space-x-2 mt-2">
            <input
              type="checkbox"
              checked={newAddress.es_principal}
              onChange={(e) => setNewAddress({ ...newAddress, es_principal: e.target.checked })}
              className="form-checkbox h-4 w-4 accent-walnut text-walnut"
            />
            <span className="text-sm text-clay">Dirección principal</span>
          </label>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={onClose} className="px-4 py-2 text-bark bg-cream-deep rounded hover:bg-line transition-colors">Cancelar</button>
            <button type="submit" disabled={isPending} className="px-4 py-2 text-tan bg-walnut rounded hover:bg-walnut-soft transition-colors disabled:opacity-50">Guardar</button>
          </div>
        </form>
      </div>
    </div>
  );
}
