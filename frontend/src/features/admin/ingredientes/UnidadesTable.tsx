import { PlusIcon } from '@heroicons/react/24/outline';
import { useUnidades } from '../../../hooks/useUnidades';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { useState } from 'react';
import { UnidadModal } from './UnidadModal';

export function UnidadesTable() {
  const { data: unidades = [], isLoading } = useUnidades();
  const [modalOpen, setModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {unidadesFiltradas.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 font-medium text-gray-900">{u.nombre}</td>
                    <td className="px-6 py-4 text-gray-600">{u.simbolo}</td>
                    <td className="px-6 py-4 text-gray-600 capitalize">{u.tipo}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      
      <UnidadModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
}
