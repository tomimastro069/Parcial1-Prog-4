import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  PencilIcon, TrashIcon, PlusIcon, TagIcon, ArrowPathIcon,
  EyeIcon, TableCellsIcon, ListBulletIcon, ArrowDownTrayIcon,
} from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { TableRowSkeleton } from '../../../components/Skeleton';
import { CategoriaModal } from './CategoriaModal';
import { CategoriaArbol } from './CategoriaArbol';
import { useCategorias, useDeleteCategoria, useActivarCategoria } from '../../../hooks/useCategorias';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { Pagination } from '../../../components/Pagination';
import { categoriasApi } from '../../../api/categoriasApi';
import { descargarExcelDesdeServidor } from '../../../utils/exportarExcel';
import { useSort } from '../../../hooks/useSort';
import { SortableHeader } from '../../../components/SortableHeader';
import type { Categoria } from '../../../types';

const PAGE_SIZE = 10;

type Filtro = 'todos' | 'activos' | 'inactivos';
type Vista = 'tabla' | 'arbol';

const filtroToParam: Record<Filtro, boolean | null> = {
  todos: null,
  activos: true,
  inactivos: false,
};

export function CategoriasTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // RBAC: solo ADMIN puede crear/editar/eliminar categorías
  const hasRole = useAuthStore((s) => s.hasRole);
  const isAdmin = hasRole('ADMIN');

  // Vista: tabla o árbol
  const [vista, setVista] = useState<Vista>('tabla');
  const [exportando, setExportando] = useState(false);

  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  // Query paginada (para la tabla)
  const { data, isLoading, isError } = useCategorias({
    page,
    size: PAGE_SIZE,
    is_active: filtroToParam[filtro] ?? undefined,
    search: debouncedSearch || undefined,
  });

  const responseData = data as any;
  const categoriasRaw: Categoria[] = responseData?.items || [];
  const totalPages = responseData?.pages || 0;

  const { sorted: categorias, field: sortField, dir: sortDir, toggle: sortToggle } = useSort(categoriasRaw, 'nombre');

  // Query completa sin filtro (para el árbol)
  const { data: allCatData, isLoading: isLoadingAll } = useCategorias({ size: 1000 });
  const allCategorias: Categoria[] = (allCatData as any)?.items || [];

  const eliminar = useDeleteCategoria();
  const activar = useActivarCategoria();
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<Categoria | null>(null);
  const [defaultParentId, setDefaultParentId] = useState<number | null>(null);

  const handleEditar = (cat: Categoria) => {
    setEditando(cat);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  const handleNueva = () => {
    setEditando(null);
    setDefaultParentId(null);
    setModalOpen(true);
  };

  // Desde el árbol: nueva subcategoría con padre preseleccionado
  const handleNuevaSub = (parentId: number) => {
    setEditando(null);
    setDefaultParentId(parentId);
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

  const handleExportar = async () => {
    setExportando(true);
    try {
      await descargarExcelDesdeServidor('/api/v1/reportes/excel/categorias', 'categorias');
      toast.success('Categorías exportadas');
    } catch {
      toast.error('Error al exportar');
    } finally {
      setExportando(false);
    }
  };

  const handleFiltroChange = (nuevo: Filtro) => {
    setFiltro(nuevo);
    setSearchParams({ page: '1' });
  };

  const getNombrePadre = (parentId: number | null | undefined) => {
    if (!parentId || allCategorias.length === 0) return null;
    return allCategorias.find((c) => c.id === parentId)?.nombre ?? null;
  };

  const getNombreCorto = (nombre: string) => {
    const partes = nombre.split(' / ');
    return partes[partes.length - 1] || nombre;
  };

  return (
    <div>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Categorías</h1>
          <p className="text-sm text-gray-500 mt-0.5">Categorías jerárquicas del catálogo</p>
        </div>
        <div className="flex items-center gap-2">
          {!isAdmin && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <EyeIcon className="w-3.5 h-3.5" />
              Solo lectura
            </span>
          )}
          {/* Exportar Excel */}
          <Button
            onClick={handleExportar}
            disabled={exportando}
            className="gap-2 bg-green-600 hover:bg-green-700"
          >
            <ArrowDownTrayIcon className="w-4 h-4" />
            {exportando ? 'Exportando...' : 'Excel'}
          </Button>
          {/* Toggle vista tabla/árbol */}
          <div className="flex rounded-lg border border-gray-200 overflow-hidden">
            <button
              onClick={() => setVista('tabla')}
              title="Vista tabla"
              className={`p-2 transition-colors ${
                vista === 'tabla'
                  ? 'bg-[#1F3864] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <TableCellsIcon className="w-4 h-4" />
            </button>
            <button
              onClick={() => setVista('arbol')}
              title="Vista árbol"
              className={`p-2 transition-colors border-l border-gray-200 ${
                vista === 'arbol'
                  ? 'bg-[#1F3864] text-white'
                  : 'bg-white text-gray-500 hover:bg-gray-50'
              }`}
            >
              <ListBulletIcon className="w-4 h-4" />
            </button>
          </div>
          {isAdmin && (
            <Button onClick={handleNueva} className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Nueva categoría
            </Button>
          )}
        </div>
      </div>

      {/* ── Vista ÁRBOL ─────────────────────────────────────────────────────── */}
      {vista === 'arbol' && (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          {isLoadingAll ? (
            <div className="py-12 text-center text-sm text-gray-400">Cargando árbol...</div>
          ) : isError ? (
            <div className="py-12 text-center text-sm text-gray-500">Error al cargar categorías.</div>
          ) : (
            <CategoriaArbol
              categorias={allCategorias}
              isAdmin={isAdmin}
              onEdit={handleEditar}
              onDelete={handleEliminar}
              onActivar={handleActivar}
              onNuevaSub={handleNuevaSub}
            />
          )}
        </div>
      )}

      {/* ── Vista TABLA ─────────────────────────────────────────────────────── */}
      {vista === 'tabla' && (
        <>
          {/* Filtros y buscador */}
          <div className="flex flex-col sm:flex-row gap-4 mb-4 justify-between items-center">
            <div className="flex gap-2">
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
            <SearchBar
              placeholder="Buscar categorías..."
              onSearch={(term) => {
                setDebouncedSearch(term);
                setSearchParams((prev) => {
                  prev.set('page', '1');
                  return prev;
                });
              }}
            />
          </div>

          <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
            {isError ? (
              <div className="text-center py-12 text-gray-500">Error al cargar categorías.</div>
            ) : (
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200 bg-gray-50">
                    <SortableHeader label="Nombre" field="nombre" activeField={sortField as string} dir={sortDir} onSort={(f) => sortToggle(f as keyof Categoria)} />
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
                          <tr
                            key={cat.id}
                            className={`hover:bg-gray-50 transition-colors ${!cat.is_active ? 'opacity-60' : ''}`}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                <TagIcon className="w-4 h-4 text-[#4472C4] flex-shrink-0" />
                                <span className="font-medium text-gray-900">{getNombreCorto(cat.nombre)}</span>
                              </div>
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                              {cat.descripcion ?? <span className="text-gray-300">—</span>}
                            </td>
                            <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                              {padre ? (
                                <span className="text-xs bg-blue-50 text-blue-700 px-2 py-0.5 rounded-full">
                                  {getNombreCorto(padre)}
                                </span>
                              ) : (
                                <span className="text-gray-300">—</span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <span
                                className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                                  cat.is_active
                                    ? 'bg-green-50 text-green-700'
                                    : 'bg-red-50 text-red-600'
                                }`}
                              >
                                {cat.is_active ? 'Activa' : 'Inactiva'}
                              </span>
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-end gap-2">
                                {isAdmin ? (
                                  cat.is_active ? (
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
                                  )
                                ) : (
                                  <span className="text-xs text-gray-300">—</span>
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
        </>
      )}

      <CategoriaModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editando={editando}
        categorias={allCategorias}
        defaultParentId={defaultParentId}
      />
    </div>
  );
}
