import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import toast from 'react-hot-toast';

import { authApi } from '../../api/authApi';
import { getMisDirecciones, deleteDireccion, type Direccion } from '../../api/direccionesApi';
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

  // Edit user profile data
  const [editName, setEditName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editCelular, setEditCelular] = useState('');
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [selectedAddressToEdit, setSelectedAddressToEdit] = useState<Direccion | undefined>(undefined);

  useEffect(() => {
    if (user?.nombre) setEditName(user.nombre);
    if (user?.apellido) setEditLastName(user.apellido);
    if (user?.celular) setEditCelular(user.celular);
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
    useAuthStore.getState().setUsuario({ ...user, nombre: editName, apellido: editLastName } as UserResponse);
    toast.success('Datos actualizados');
  };

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <p className="eyebrow mb-2">Tu cuenta</p>
      <h1 className="font-baskerville text-3xl font-bold text-coffee mb-6 tracking-[-0.01em]">Mi perfil</h1>

        {(loadingUser || loadingDirs) ? (
          <div className="text-center py-16 text-gray-500">Cargando datos...</div>
        ) : errorUser ? (
          <div className="bg-white p-8 rounded-lg shadow text-center">
            <p className="text-red-500 mb-2">Error al cargar la información del usuario.</p>
            <p className="text-sm text-gray-500">Verificá que el servidor esté activo.</p>
          </div>
        ) : (<>
          {/* User data */}
          <section className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm mb-8">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-baskerville text-xl font-bold text-coffee">Datos personales</h2>
              {!isEditingProfile ? (
                <button
                  onClick={() => setIsEditingProfile(true)}
                  className="text-walnut text-sm hover:underline font-semibold"
                >
                  Editar Perfil
                </button>
              ) : (
                <div className="flex space-x-4">
                  <button
                    onClick={() => {
                      setEditName(user?.nombre || '');
                      setEditLastName(user?.apellido || '');
                      setEditCelular(user?.celular || '');
                      setIsEditingProfile(false);
                    }}
                    className="text-gray-500 text-sm hover:underline font-semibold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={() => {
                      handleNameUpdate();
                      setIsEditingProfile(false);
                    }}
                    className="text-walnut text-sm hover:underline font-semibold"
                  >
                    Guardar
                  </button>
                </div>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="border border-line rounded-lg p-4 bg-cream shadow-sm relative">
                <span className="block text-xs font-semibold text-sand uppercase tracking-wider mb-1">Nombre</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editName}
                    placeholder="Tu nombre"
                    onChange={(e) => setEditName(e.target.value)}
                    className="w-full border-b-2 border-walnut bg-transparent focus:outline-none text-bark py-1 font-medium text-lg"
                    autoFocus
                  />
                ) : (
                  <p className="text-bark font-medium text-lg truncate" title={user?.nombre || ''}>
                    {user?.nombre || 'Sin nombre'}
                  </p>
                )}
              </div>

              <div className="border border-line rounded-lg p-4 bg-cream shadow-sm relative">
                <span className="block text-xs font-semibold text-sand uppercase tracking-wider mb-1">Apellido</span>
                {isEditingProfile ? (
                  <input
                    type="text"
                    value={editLastName}
                    placeholder="Tu apellido"
                    onChange={(e) => setEditLastName(e.target.value)}
                    className="w-full border-b-2 border-walnut bg-transparent focus:outline-none text-bark py-1 font-medium text-lg"
                  />
                ) : (
                  <p className="text-bark font-medium text-lg truncate" title={user?.apellido || ''}>
                    {user?.apellido || 'Sin apellido'}
                  </p>
                )}
              </div>

              <div className="border border-line rounded-lg p-4 bg-cream shadow-sm">
                <span className="block text-xs font-semibold text-sand uppercase tracking-wider mb-1">Correo Electrónico</span>
                <p className="text-bark font-medium text-lg truncate" title={user?.email}>{user?.email}</p>
                {isEditingProfile && (
                  <p className="text-xs text-gray-400 mt-1">El email no se puede modificar.</p>
                )}
              </div>

              <div className="border border-line rounded-lg p-4 bg-cream shadow-sm relative">
                <span className="block text-xs font-semibold text-sand uppercase tracking-wider mb-1">Celular</span>
                {isEditingProfile ? (
                  <input
                    type="tel"
                    value={editCelular}
                    placeholder="+54 9 11 1234-5678"
                    onChange={(e) => setEditCelular(e.target.value)}
                    className="w-full border-b-2 border-walnut bg-transparent focus:outline-none text-bark py-1 font-medium text-lg"
                  />
                ) : (
                  <p className="text-bark font-medium text-lg">
                    {user?.celular || <span className="text-sand text-sm">Sin celular</span>}
                  </p>
                )}
              </div>

              <div className="border border-line rounded-lg p-4 bg-cream shadow-sm">
                <span className="block text-xs font-semibold text-sand uppercase tracking-wider mb-1">Rol de Usuario</span>
                <div className="mt-1">
                  <span className="inline-block bg-walnut text-tan text-xs px-2 py-1 rounded font-semibold tracking-wide uppercase">
                    {user?.roles?.[0]}
                  </span>
                </div>
              </div>
            </div>
          </section>
          {/* Addresses */}
          <section className="bg-cream-soft border border-line p-6 rounded-lg shadow-sm">
            <h2 className="font-baskerville text-xl font-bold text-coffee mb-4">Mis direcciones</h2>
            {errorDirs ? (
              <p className="text-red-500">Error al cargar direcciones.</p>
            ) : direcciones?.length === 0 ? (
              <p className="text-gray-500 mb-4">Aún no tenés direcciones guardadas.</p>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {direcciones?.map((dir) => (
                  <div key={dir.id} className={`border rounded-lg p-5 relative transition-shadow hover:shadow-md ${dir.es_principal ? 'border-walnut bg-cream' : 'border-line bg-cream'} shadow-sm flex flex-col justify-between`}>
                    <div>
                      {dir.es_principal && (
                        <span className="absolute top-3 right-3 text-xs font-semibold text-tan bg-walnut px-2 py-1 rounded shadow-sm">Principal</span>
                      )}
                      <h3 className="font-baskerville font-bold text-coffee text-lg mb-1">{dir.alias || 'Dirección de entrega'}</h3>
                      <p className="text-bark text-sm mt-2">
                        {dir.linea1} {dir.linea2 && `, ${dir.linea2}`}
                      </p>
                      <p className="text-clay text-sm">
                        {dir.ciudad} {dir.provincia && `, ${dir.provincia}`}
                      </p>
                      {dir.codigo_postal && <p className="text-sand text-xs mt-1">CP: {dir.codigo_postal}</p>}
                    </div>

                    <div className="mt-5 flex space-x-4 border-t border-line pt-3">
                      <button
                        onClick={() => {
                          setSelectedAddressToEdit(dir);
                          setShowAddressModal(true);
                        }}
                        className="text-walnut text-sm hover:underline font-semibold"
                      >
                        Editar
                      </button>
                      <button
                        onClick={() => handleDelete(dir.id)}
                        className="text-red-500 text-sm hover:underline font-semibold"
                      >
                        Eliminar
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
            <div className="mt-6 border-t border-line pt-4">
              <button
                onClick={() => {
                  setSelectedAddressToEdit(undefined);
                  setShowAddressModal(true);
                }}
                className="px-5 py-2.5 bg-walnut text-tan font-inconsolata font-semibold tracking-[0.08em] uppercase text-sm rounded-sm shadow hover:bg-walnut-soft transition-colors"
              >
                + Añadir dirección
              </button>
            </div>
          </section>
          <div className="mt-6 flex justify-end">
            <button
              onClick={() => navigate('/store')}
              className="px-4 py-2 bg-cream-deep text-bark rounded-sm hover:bg-line transition-colors"
            >
              Volver a la tienda
            </button>
          </div>

          <AddressFormModal
            isOpen={showAddressModal}
            initialData={selectedAddressToEdit}
            onClose={() => setShowAddressModal(false)}
          />
        </>)}
    </div>
  );
}
