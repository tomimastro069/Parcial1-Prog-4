import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { getUsuarios, cambiarRol, toggleActivo, crearUsuario, UsuarioAdmin } from '../../api/usuariosApi';
import { useDebounce } from '../../hooks/useDebounce';
import toast from 'react-hot-toast';

const ROL_DISPLAY: Record<string, { label: string; badgeClass: string }> = {
  ADMIN:   { label: 'Admin',    badgeClass: 'bg-red-100 text-red-800 border border-red-200' },
  PEDIDOS: { label: 'Pedidos',  badgeClass: 'bg-purple-100 text-purple-800 border border-purple-200' },
  STOCK:   { label: 'Stock',    badgeClass: 'bg-orange-100 text-orange-800 border border-orange-200' },
  CLIENT:  { label: 'Cliente',  badgeClass: 'bg-gray-100 text-gray-700 border border-gray-200' },
};

const ROLES = ['ADMIN', 'PEDIDOS', 'STOCK', 'CLIENT'];

export default function GestorUsuariosPage() {
  const queryClient = useQueryClient();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ nombre: '', apellido: '', email: '', password: '', rol: 'CLIENT' });
  const size = 15;

  const searchDebounced = useDebounce(search, 400);

  const { data, isLoading } = useQuery({
    queryKey: ['usuarios', page, searchDebounced],
    queryFn: () => getUsuarios(page, size, searchDebounced || undefined),
  });

  const rolMutation = useMutation({
    mutationFn: ({ id, rol }: { id: number; rol: string }) => cambiarRol(id, rol),
    onSuccess: () => {
      toast.success('Rol actualizado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al cambiar rol'),
  });

  const crearMutation = useMutation({
    mutationFn: crearUsuario,
    onSuccess: () => {
      toast.success('Usuario creado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
      setShowModal(false);
      setForm({ nombre: '', apellido: '', email: '', password: '', rol: 'CLIENT' });
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error al crear usuario'),
  });

  const toggleMutation = useMutation({
    mutationFn: (id: number) => toggleActivo(id),
    onSuccess: (updated) => {
      toast.success(updated.is_active ? 'Usuario activado' : 'Usuario desactivado');
      queryClient.invalidateQueries({ queryKey: ['usuarios'] });
    },
    onError: (e: any) => toast.error(e.response?.data?.detail || 'Error'),
  });

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Gestor de Usuarios</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {data?.total ?? 0} usuarios registrados
          </p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="px-4 py-2 bg-[#1F3864] hover:bg-[#162a4e] text-white text-sm font-medium rounded-lg transition-colors shadow-sm"
        >
          + Nuevo usuario
        </button>
      </div>

      {/* Buscador */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Buscar por email..."
          value={search}
          onChange={e => { setSearch(e.target.value); setPage(1); }}
          className="w-64 px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
        />
      </div>

      {/* Lista */}
      <div className="space-y-3">
        {isLoading && (
          <div className="flex justify-center py-10">
            <div className="w-6 h-6 border-2 border-[#1F3864] border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        {!isLoading && data?.items.length === 0 && (
          <div className="bg-white rounded-xl border border-gray-200 p-10 text-center text-gray-400">
            No se encontraron usuarios.
          </div>
        )}

        {!isLoading && data?.items.map((usuario: UsuarioAdmin) => {
          const rolInfo = ROL_DISPLAY[usuario.rol] ?? { label: usuario.rol, badgeClass: 'bg-gray-100 text-gray-700' };

          return (
            <div
              key={usuario.id}
              className={`bg-white rounded-xl border overflow-hidden shadow-sm transition-opacity ${
                !usuario.is_active ? 'opacity-60 border-gray-200' : 'border-gray-200'
              }`}
            >
              {/* Encabezado */}
              <div className="px-5 py-3 flex flex-wrap gap-3 items-center justify-between border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-full bg-[#1F3864]/10 flex items-center justify-center text-[#1F3864] text-sm font-bold">
                    {usuario.nombre[0].toUpperCase()}
                  </div>
                  <div>
                    <span className="font-bold text-gray-900 text-sm">
                      {usuario.nombre} {usuario.apellido}
                    </span>
                    <p className="text-xs text-gray-500">{usuario.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${rolInfo.badgeClass}`}>
                    {rolInfo.label}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                    usuario.is_active
                      ? 'bg-green-100 text-green-700 border border-green-200'
                      : 'bg-red-100 text-red-700 border border-red-200'
                  }`}>
                    {usuario.is_active ? 'Activo' : 'Inactivo'}
                  </span>
                  <span className="text-xs text-gray-400">
                    #{usuario.id} · {new Date(usuario.created_at).toLocaleDateString('es-AR')}
                  </span>
                </div>
              </div>

              {/* Acciones */}
              <div className="px-5 py-3 flex flex-wrap gap-2 items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-400 mr-1">Cambiar rol:</span>
                  {ROLES.filter(r => r !== usuario.rol).map(r => (
                    <button
                      key={r}
                      onClick={() => rolMutation.mutate({ id: usuario.id, rol: r })}
                      disabled={rolMutation.isPending}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${ROL_DISPLAY[r].badgeClass} hover:opacity-80`}
                    >
                      {ROL_DISPLAY[r].label}
                    </button>
                  ))}
                </div>

                <button
                  onClick={() => toggleMutation.mutate(usuario.id)}
                  disabled={toggleMutation.isPending}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors disabled:opacity-50 ${
                    usuario.is_active
                      ? 'bg-red-50 text-red-700 border border-red-200 hover:bg-red-100'
                      : 'bg-green-50 text-green-700 border border-green-200 hover:bg-green-100'
                  }`}
                >
                  {usuario.is_active ? 'Desactivar' : 'Activar'}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal nuevo usuario */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-gray-900/50">
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
            <h2 className="text-lg font-bold text-[#1F3864] mb-4">Nuevo usuario</h2>
            <div className="space-y-3">
              {[
                { label: 'Nombre', key: 'nombre', type: 'text' },
                { label: 'Apellido', key: 'apellido', type: 'text' },
                { label: 'Email', key: 'email', type: 'email' },
                { label: 'Contraseña', key: 'password', type: 'password' },
              ].map(({ label, key, type }) => (
                <div key={key}>
                  <label className="block text-xs font-medium text-gray-600 mb-1">{label}</label>
                  <input
                    type={type}
                    value={(form as any)[key]}
                    onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
                    className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
                  />
                </div>
              ))}
              <div>
                <label className="block text-xs font-medium text-gray-600 mb-1">Rol</label>
                <select
                  value={form.rol}
                  onChange={e => setForm(f => ({ ...f, rol: e.target.value }))}
                  className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#1F3864]/30 focus:border-[#1F3864]"
                >
                  {ROLES.map(r => (
                    <option key={r} value={r}>{ROL_DISPLAY[r].label}</option>
                  ))}
                </select>
              </div>
            </div>
            <div className="flex justify-end gap-3 mt-5">
              <button
                onClick={() => setShowModal(false)}
                className="px-4 py-2 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button
                onClick={() => crearMutation.mutate(form)}
                disabled={crearMutation.isPending || !form.nombre || !form.apellido || !form.email || !form.password}
                className="px-4 py-2 text-sm bg-[#1F3864] text-white rounded-lg hover:bg-[#162a4e] disabled:opacity-50"
              >
                {crearMutation.isPending ? 'Creando...' : 'Crear usuario'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Paginación */}
      {data && data.pages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Anterior
          </button>
          <span className="text-sm text-gray-600">
            Página {page} de {data.pages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(data.pages, p + 1))}
            disabled={page === data.pages}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50"
          >
            Siguiente
          </button>
        </div>
      )}
    </div>
  );
}
