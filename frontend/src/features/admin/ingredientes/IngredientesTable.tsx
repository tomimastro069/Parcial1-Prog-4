import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, ArrowPathIcon, ArrowDownTrayIcon, EyeIcon } from '@heroicons/react/24/outline';
import { descargarExcelDesdeServidor } from '../../../utils/exportarExcel';
import toast from 'react-hot-toast';
import { Badge } from '../../../components/Badge';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { TableRowSkeleton } from '../../../components/Skeleton';
import { IngredienteModal } from './IngredienteModal';
import { useIngredientes, useDeleteIngrediente, useActivarIngrediente } from '../../../hooks/useIngredientes';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Pagination } from '../../../components/Pagination';
import { ingredientesApi } from '../../../api/ingredientesApi';
import { useSort } from '../../../hooks/useSort';
import { SortableHeader } from '../../../components/SortableHeader';
import type { Ingrediente } from '../../../types';

const PAGE_SIZE = 10;

type Filtro = 'todos' | 'activos' | 'inactivos';

const filtroToParam: Record<Filtro, boolean | null> = {
  todos: null,
  activos: true,
  inactivos: false,
};

export function IngredientesTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // RBAC: ADMIN y STOCK pueden escribir; PEDIDOS solo lectura
  const hasRole = useAuthStore((s) => s.hasRole);
  const canWrite = hasRole('ADMIN') || hasRole('STOCK');

  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useIngredientes({
    page,
    size: PAGE_SIZE,
    is_active: filtroToParam[filtro] ?? undefined,
    search: debouncedSearch || undefined,
  });

  const responseData = data as any;
  const ingredientesRaw: Ingrediente[] = responseData?.items || [];
  const totalPages = responseData?.pages || 0;

  const { sorted: ingredientes, field: sortField, dir: sortDir, toggle: sortToggle } = useSort(ingredientesRaw, 'nombre');

  const eliminar = useDeleteIngrediente();
  const activar = useActivarIngrediente();
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Ingrediente | null>(null);
  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    setExportando(true);
    try {
      await descargarExcelDesdeServidor('/api/v1/reportes/excel/ingredientes', 'ingredientes');
      toast.success('Ingredientes exportados');
    } catch (e) {
      console.error('Error al exportar:', e);
      toast.error('Error al exportar.');
    } finally {
      setExportando(false);
    }
  };

  const handleEditar = (ing: Ingrediente) => {
    setEditando(ing);
    setModalOpen(true);
  };

  const handleNuevo = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const handleEliminar = (ing: Ingrediente) => {
    openConfirm(
      'Eliminar ingrediente',
      `¿Estás seguro que querés eliminar "${ing.nombre}"?`,
      () => eliminar.mutate(ing.id)
    );
  };

  const handleActivar = (ing: Ingrediente) => {
    openConfirm(
      'Reactivar ingrediente',
      `¿Querés reactivar "${ing.nombre}"?`,
      () => activar.mutate(ing.id)
    );
  };

  const handleFiltroChange = (nuevo: Filtro) => {
    setFiltro(nuevo);
    setSearchParams({ page: '1' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Ingredientes</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión de ingredientes e información de alérgenos</p>
        </div>
        <div className="flex gap-2 items-center">
          {!canWrite && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <EyeIcon className="w-3.5 h-3.5" />
              Solo lectura
            </span>
          )}
          <Button
            onClick={handleExportar}
            disabled={exportando}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {exportando ? 'Exportando...' : 'Excel'}
          </Button>
          {canWrite && (
            <Button onClick={handleNuevo} className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Nuevo ingrediente
            </Button>
          )}
        </div>
      </div>

      {/* Filtro de estado y buscador */}
      <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-center">
        <div className="flex gap-2">
          {(['todos', 'activos', 'inactivos'] as Filtro[]).map((f) => (
            <button
              key={f}
              onClick={() => handleFiltroChange(f)}
              className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${filtro === f
                ? 'bg-[#1F3864] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                }`}
            >
              {f.charAt(0).toUpperCase() + f.slice(1)}
            </button>
          ))}
        </div>
        <SearchBar
          placeholder="Buscar ingredientes..."
          onSearch={(term) => {
            setDebouncedSearch(term);
            setSearchParams(prev => {
              prev.set('page', '1');
              return prev;
            });
          }}
        />
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="text-center py-12 text-gray-500">
            Error al cargar los ingredientes.
          </div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <SortableHeader label="Nombre" field="nombre" activeField={sortField as string} dir={sortDir} onSort={(f) => sortToggle(f as keyof Ingrediente)} />
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Alérgeno</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => (
                  <TableRowSkeleton key={i} cols={5} />
                ))
                : ingredientes?.map((ing) => (
                  <tr key={ing.id} className={`hover:bg-gray-50 transition-colors ${!ing.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{ing.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {ing.descripcion ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      {ing.es_alergeno ? (
                        <Badge variant="alergeno">
                          ⚠️ Alérgeno
                        </Badge>
                      ) : (
                        <Badge variant="gray">Sin alérgeno</Badge>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${ing.is_active
                        ? 'bg-green-50 text-green-700'
                        : 'bg-red-50 text-red-600'
                        }`}>
                        {ing.is_active ? 'Activo' : 'Inactivo'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {canWrite ? (
                          ing.is_active ? (
                            <>
                              <button
                                onClick={() => handleEditar(ing)}
                                className="p-1.5 rounded-md text-gray-500 hover:text-[#2E75B6] hover:bg-blue-50 transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleEliminar(ing)}
                                className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                title="Eliminar"
                              >
                                <TrashIcon className="w-4 h-4" />
                              </button>
                            </>
                          ) : (
                            <button
                              onClick={() => handleActivar(ing)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                              title="Reactivar"
                            >
                              <ArrowPathIcon className="w-4 h-4" />
                            </button>
                          )
                        ) : (
                          <span className="text-xs text-gray-300">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {!isLoading && ingredientes?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No hay ingredientes en este filtro.</p>
          </div>
        )}

        {!isLoading && !isError && totalPages > 1 && (
          <div className="mt-6 flex justify-center">
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={(newPage) => setSearchParams({ page: String(newPage) })}
            />
          </div>
        )}
      </div>

      <IngredienteModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editando={editando}
      />
    </div>
  );
}
