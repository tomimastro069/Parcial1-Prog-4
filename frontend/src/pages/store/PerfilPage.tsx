import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { authApi } from '../../api/authApi';
import { getMisDirecciones, deleteDireccion } from '../../api/direccionesApi';
import Header from '../../components/Header';
import AddressFormModal from '../../components/AddressFormModal';
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
  const [showAddressModal, setShowAddressModal] = useState(false);

  useEffect(() => {
    if (user?.nombre) setEditName(user.nombre);
  }, [user]);

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

  const handleNameUpdate = () => {
    if (!user) return;
    useAuthStore.getState().setUsuario({ ...user, nombre: editName } as UserResponse);
    toast.success('Nombre actualizado');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
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
            <div className="mt-4">
              <button
                onClick={() => setShowAddressModal(true)}
                className="px-4 py-2 bg-[#2E75B6] text-white rounded hover:bg-[#1F3864]"
              >
                + Añadir Dirección
              </button>
            </div>
          </section>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/store')}
              className="px-4 py-2 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
            >
              Volver a la tienda
            </button>
          </div>

          <AddressFormModal
            isOpen={showAddressModal}
            onClose={() => setShowAddressModal(false)}
          />
        </>)}
      </div>
    </div>
  );
}
