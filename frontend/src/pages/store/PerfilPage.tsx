import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { authApi } from '../../api/authApi';
import { getMisDirecciones, createDireccion, deleteDireccion, type Direccion } from '../../api/direccionesApi';
import { useAuthStore } from '../../store/authStore';
import type { UserResponse } from '../../types';

export default function PerfilPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Load logged‑in user data
  const { data: user, isLoading: loadingUser, isError: errorUser } = useQuery({
    queryKey: ['userMe'],
    queryFn: authApi.me,
  });

  // Load user's addresses (after user is known)
  const { data: direcciones, isLoading: loadingDirs, isError: errorDirs } = useQuery({
    queryKey: ['misDireccionesPerfil'],
    queryFn: getMisDirecciones,
    enabled: !!user,
  });

  // Edit user name
  const [editName, setEditName] = useState('');
  useEffect(() => {
    if (user?.nombre) setEditName(user.nombre);
  }, [user]);

  // Full address form state matching backend model
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

  // Mutation to create address
  const createAddressMutation = useMutation({
    mutationFn: (data: Omit<Direccion, 'id' | 'usuario_id'>) => createDireccion(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misDireccionesPerfil'] });
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
      toast.success('Dirección creada');
    },
    onError: () => toast.error('Error al crear dirección'),
  });

  const deleteAddressMutation = useMutation({
    mutationFn: (id: number) => deleteDireccion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['misDireccionesPerfil'] });
      toast.success('Dirección eliminada');
    },
    onError: () => toast.error('Error al eliminar dirección'),
  });

  const handleDelete = (id: number) => {
    deleteAddressMutation.mutate(id);
  };

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

  const handleNameUpdate = () => {
    if (!user) return;
    useAuthStore.getState().setUsuario({ ...user, nombre: editName } as UserResponse);
    toast.success('Nombre actualizado');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-6">Mi Perfil</h1>

        {(loadingUser || loadingDirs) ? (
          <div className="text-center py-16 text-gray-500">Cargando datos...</div>
        ) : errorUser ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-red-500 mb-2">Error al cargar la información del usuario.</p>
            <p className="text-sm text-gray-500">Verificá que el servidor esté activo.</p>
          </div>
        ) : (<>
        {/* User data */}
        <section className="bg-white p-6 rounded-lg shadow mb-8">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Datos del Usuario</h2>
          <p>
            <span className="font-medium">Email:</span> {user?.email}
          </p>
          <p className="mt-2">
            <span className="font-medium">Nombre:</span>
            <input
              type="text"
              value={editName}
              onChange={(e) => setEditName(e.target.value)}
              className="ml-2 border border-gray-300 rounded px-2 py-1"
            />
            <button
              onClick={handleNameUpdate}
              className="ml-2 px-3 py-1 bg-[#2E75B6] text-white rounded hover:bg-[#1F3864]"
            >
              Guardar
            </button>
          </p>
        </section>
        {/* Addresses */}
        <section className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-xl font-semibold text-gray-800 mb-4">Direcciones Guardadas</h2>
          {errorDirs ? (
            <p className="text-red-500">Error al cargar direcciones.</p>
          ) : (
            <ul className="space-y-2">
              {direcciones?.map((dir) => (
                <li key={dir.id} className="border-b pb-2 flex justify-between items-center">
                  <p className="font-medium">
                    {dir.alias ? `${dir.alias}: ` : ''}{dir.linea1}, {dir.ciudad}
                  </p>
                  <button
                    onClick={() => handleDelete(dir.id)}
                    className="text-red-500 hover:underline"
                  >
                    Eliminar
                  </button>
                </li>
              ))}
            </ul>
          )}
          {/* New address form */}
          <form onSubmit={handleAddAddress} className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Alias (opcional)"
              value={newAddress.alias}
              onChange={(e) => setNewAddress({ ...newAddress, alias: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Línea 1"
              value={newAddress.linea1}
              onChange={(e) => setNewAddress({ ...newAddress, linea1: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Línea 2 (opcional)"
              value={newAddress.linea2}
              onChange={(e) => setNewAddress({ ...newAddress, linea2: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Ciudad"
              value={newAddress.ciudad}
              onChange={(e) => setNewAddress({ ...newAddress, ciudad: e.target.value })}
              required
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Provincia (opcional)"
              value={newAddress.provincia}
              onChange={(e) => setNewAddress({ ...newAddress, provincia: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="text"
              placeholder="Código Postal (opcional)"
              value={newAddress.codigo_postal}
              onChange={(e) => setNewAddress({ ...newAddress, codigo_postal: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="number"
              step="0.000001"
              placeholder="Latitud (opcional)"
              value={newAddress.latitud}
              onChange={(e) => setNewAddress({ ...newAddress, latitud: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <input
              type="number"
              step="0.000001"
              placeholder="Longitud (opcional)"
              value={newAddress.longitud}
              onChange={(e) => setNewAddress({ ...newAddress, longitud: e.target.value })}
              className="w-full border border-gray-300 rounded px-2 py-1"
            />
            <label className="flex items-center space-x-2">
              <input
                type="checkbox"
                checked={newAddress.es_principal}
                onChange={(e) => setNewAddress({ ...newAddress, es_principal: e.target.checked })}
                className="form-checkbox h-4 w-4 text-[#2E75B6]"
              />
              <span className="text-sm">Dirección principal</span>
            </label>
            <button
              type="submit"
              className="px-4 py-2 bg-[#2E75B6] text-white rounded hover:bg-[#1F3864]"
            >
              Añadir Dirección
            </button>
          </form>
        </section>
        <div className="mt-6 flex justify-end">
          <button
            onClick={() => navigate('/store')}
            className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
          >
            Volver a la tienda
          </button>
        </div>
        </>)}
    </div>
  );
}
