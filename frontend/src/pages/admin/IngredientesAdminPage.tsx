import { useState } from 'react';
import { IngredientesTable } from '../../features/admin/ingredientes/IngredientesTable';
import { UnidadesTable } from '../../features/admin/ingredientes/UnidadesTable';

export default function IngredientesAdminPage() {
  const [activeTab, setActiveTab] = useState<'ingredientes' | 'unidades'>('ingredientes');

  return (
    <div className="space-y-6">
      <div className="flex space-x-1 bg-gray-100 p-1 rounded-lg w-fit">
        <button
          onClick={() => setActiveTab('ingredientes')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'ingredientes'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Ingredientes
        </button>
        <button
          onClick={() => setActiveTab('unidades')}
          className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
            activeTab === 'unidades'
              ? 'bg-white text-gray-900 shadow-sm'
              : 'text-gray-500 hover:text-gray-700'
          }`}
        >
          Unidades de medida
        </button>
      </div>

      {activeTab === 'ingredientes' ? <IngredientesTable /> : <UnidadesTable />}
    </div>
  );
}
