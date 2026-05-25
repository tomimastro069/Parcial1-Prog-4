import { PlusIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useUnidades, useDeleteUnidad } from '../../../hooks/useUnidades';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { useState } from 'react';
import { UnidadModal } from './UnidadModal';

export function UnidadesTable() {
  const { data: unidades = [], isLoading } = useUnidades();
  const deleteUnidad = useDeleteUnidad();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [confirmId, setConfirmId] = useState<number | null>(null);

  function handleDelete() {
    if (confirmId === null) return;
    deleteUnidad.mutate(confirmId, { onSettled: () => setConfirmId(null) });
  }

  const unidadesFiltradas = unidades.filter(u => 
    u.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    u.simbolo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    u.tipo.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium text-gray-900">Unidades de medida</h2>
        <Button onClick={() => setModalOpen(true)} className="gap-2">
          <PlusIcon className="w-5 h-5" />
          Nueva unidad
        </Button>
      </div>

      <div className="flex mb-4">
        <SearchBar 
          placeholder="Buscar unidades..." 
          onSearch={(term) => setSearchTerm(term)}
          debounceMs={200}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500">Cargando unidades...</div>
        ) : unidadesFiltradas.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            {searchTerm ? 'No se encontraron unidades para esa búsqueda' : 'No hay unidades registradas'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 border-b border-gray-200 text-gray-600">
                <tr>
                  <th className="px-6 py-4 font-medium">Nombre</th>
                  <th className="px-6 py-4 font-medium">Símbolo</th>
                  <th className="px-6 py-4 font-medium">Tipo</th>
                  <th className="px-6 py-4 font-medium"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unidadesFiltradas.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{u.simbolo}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{u.tipo}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => setConfirmId(u.id)}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Eliminar"
                      >
                        <TrashIcon className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <UnidadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />

      {confirmId !== null && (
        <div className="fixed inset-0 bg-gray-900/40 z-50 flex items-center justify-center" style={{ animation: 'fadeIn 0.15s ease-out' }}>
          <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-sm mx-4" style={{ animation: 'slideUp 0.15s ease-out' }}>
            <h3 className="text-base font-semibold text-gray-900 mb-2">Eliminar unidad de medida</h3>
            <p className="text-sm text-gray-500 mb-5">Esta acción no se puede deshacer. ¿Confirmas?</p>
            <div className="flex justify-end gap-3">
              <button
                onClick={() => setConfirmId(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={handleDelete}
                disabled={deleteUnidad.isPending}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 disabled:opacity-60 rounded-lg transition-colors"
              >
                {deleteUnidad.isPending ? 'Eliminando...' : 'Eliminar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
