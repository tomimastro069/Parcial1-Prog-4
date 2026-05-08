import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, TagIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import { TableRowSkeleton } from '../../../components/Skeleton';
import { CategoriaModal } from './CategoriaModal';
import { useCategorias, useDeleteCategoria, useActivarCategoria } from '../../../hooks/useCategorias';
import { useUIStore } from '../../../store/uiStore';
import { Pagination } from '../../../components/Pagination';
import type { Categoria } from '../../../types';

const PAGE_SIZE = 10;

type Filtro = 'todos' | 'activos' | 'inactivos';

const filtroToParam: Record<Filtro, boolean | null> = {
  todos: null,
  activos: true,
  inactivos: false,
};

export function CategoriasTable() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [filtro, setFiltro] = useState<Filtro>('todos');

  const { data, isLoading, isError } = useCategorias({
    page,
    size: PAGE_SIZE,
    is_active: filtroToParam[filtro] ?? undefined,
  });

  const responseData = data as any;
  const categorias: Categoria[] = responseData?.items || [];
  const totalPages = responseData?.pages || 0;

  const { data: allCatData } = useCategorias({ size: 1000, is_active: true });
  const allCategorias: Categoria[] = (allCatData as any)?.items || [];

  const eliminar = useDeleteCategoria();
  const activar = useActivarCategoria();
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);

  const handleEditar = (cat: Categoria) => {
    setEditando(cat);
    setModalOpen(true);
  };

  const handleNueva = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const handleEliminar = (cat: Categoria) => {
    openConfirm(
      'Eliminar categoría',
      `¿Estás seguro que querés eliminar "${cat.nombre}"? Si tiene productos activos no se podrá eliminar.`,
      () => eliminar.mutate(cat.id)
    );
  };

  const handleActivar = (cat: Categoria) => {
    openConfirm(
      'Reactivar categoría',
      `¿Querés reactivar "${cat.nombre}"?`,
      () => activar.mutate(cat.id)
    );
  };

  const handleFiltroChange = (nuevo: Filtro) => {
    setFiltro(nuevo);
    setSearchParams({ page: '1' });
  };

  const getNombrePadre = (parentId: number | null | undefined) => {
    if (!parentId || allCategorias.length === 0) return null;
    return allCategorias.find((c) => c.id === parentId)?.nombre ?? null;
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">Categorías jerárquicas del catálogo</p>
        </div>
        <Button onClick={handleNueva} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Nueva categoría
        </Button>
      </div>

      {/* Filtro de estado */}
      <div className="flex gap-2 mb-4">
        {(['todos', 'activos', 'inactivos'] as Filtro[]).map((f) => (
          <button
            key={f}
            onClick={() => handleFiltroChange(f)}
            className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
              filtro === f
                ? 'bg-[#1F3864] text-white'
                : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
            }`}
          >
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {isError ? (
          <div className="text-center py-12 text-gray-500">Error al cargar categorías.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden sm:table-cell">Categoría padre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 4 }).map((_, i) => (
                    <TableRowSkeleton key={i} cols={5} />
                  ))
                : categorias?.map((cat) => {
                    const padre = getNombrePadre(cat.parent_id);
                    return (
                      <tr key={cat.id} className={`hover:bg-gray-50 transition-colors ${!cat.is_active ? 'opacity-60' : ''}`}>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <TagIcon className="w-4 h-4 text-[#4472C4] flex-shrink-0" />
                            <span className="font-medium text-gray-900">{cat.nombre}</span>
                          </div>
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                          {cat.descripcion ?? <span className="text-gray-300">—</span>}
                        </td>
                        <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                          {padre ? (
                            <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                              {padre}
                            </span>
                          ) : (
                            <span className="text-gray-300">—</span>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                            cat.is_active
                              ? 'bg-green-50 text-green-700'
                              : 'bg-red-50 text-red-600'
                          }`}>
                            {cat.is_active ? 'Activa' : 'Inactiva'}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex justify-end gap-2">
                            {cat.is_active ? (
                              <>
                                <button
                                  onClick={() => handleEditar(cat)}
                                  className="p-1.5 rounded-md text-gray-500 hover:text-[#2E75B6] hover:bg-blue-50 transition-colors"
                                  title="Editar"
                                >
                                  <PencilIcon className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleEliminar(cat)}
                                  className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => handleActivar(cat)}
                                className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                                title="Reactivar"
                              >
                                <ArrowPathIcon className="w-4 h-4" />
                              </button>
                            )}
                          </div>
                        </td>
                      </tr>
                    );
                  })}
            </tbody>
          </table>
        )}

        {!isLoading && categorias?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No hay categorías en este filtro.</p>
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

      <CategoriaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editando={editando}
        categorias={allCategorias}
      />
    </div>
  );
}
