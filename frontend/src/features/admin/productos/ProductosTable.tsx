import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, ArrowPathIcon } from '@heroicons/react/24/outline';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { TableRowSkeleton } from '../../../components/Skeleton';
import { Pagination } from '../../../components/Pagination';
import { ProductoModal } from './ProductoModal';
import { useProductosAdmin, useDeleteProducto, useActivarProducto } from '../../../hooks/useProductos';
import { useUIStore } from '../../../store/uiStore';
import type { ProductoRead } from '../../../types';

const PAGE_SIZE = 10;

type Filtro = 'todos' | 'activos' | 'inactivos';

const filtroToParam: Record<Filtro, boolean | null> = {
  todos: null,
  activos: true,
  inactivos: false,
};

export function ProductosTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [debouncedSearch, setDebouncedSearch] = useState('');

  const { data, isLoading, isError } = useProductosAdmin({
    page,
    size: PAGE_SIZE,
    is_active: filtroToParam[filtro] ?? undefined,
    search: debouncedSearch || undefined,
  });

  const productos: ProductoRead[] = (data as any)?.items ?? [];
  const totalPages: number = (data as any)?.pages ?? 0;

  const eliminar = useDeleteProducto();
  const activar = useActivarProducto();
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const [modalOpen, setModalOpen] = useState(false);
  const [editando, setEditando] = useState<ProductoRead | null>(null);

  const handleEditar = (p: ProductoRead) => {
    setEditando(p);
    setModalOpen(true);
  };

  const handleNuevo = () => {
    setEditando(null);
    setModalOpen(true);
  };

  const handleEliminar = (p: ProductoRead) => {
    openConfirm(
      'Eliminar producto',
      `¿Estás seguro que querés eliminar "${p.nombre}"?`,
      () => eliminar.mutate(p.id)
    );
  };

  const handleActivar = (p: ProductoRead) => {
    openConfirm(
      'Reactivar producto',
      `¿Querés reactivar "${p.nombre}"?`,
      () => activar.mutate(p.id)
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
          <h1 className="text-2xl font-bold text-[#1F3864]">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión del catálogo de productos</p>
        </div>
        <Button onClick={handleNuevo} className="gap-2">
          <PlusIcon className="w-4 h-4" />
          Nuevo producto
        </Button>
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
          placeholder="Buscar productos..." 
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
          <div className="text-center py-12 text-gray-500">Error al cargar los productos.</div>
        ) : (
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Nombre</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Descripción</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Precio</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden lg:table-cell">Categorías</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-700">Estado</th>
                <th className="text-right px-4 py-3 font-semibold text-gray-700">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {isLoading
                ? Array.from({ length: 5 }).map((_, i) => <TableRowSkeleton key={i} cols={6} />)
                : productos?.map((p) => (
                  <tr key={p.id} className={`hover:bg-gray-50 transition-colors ${!p.is_active ? 'opacity-60' : ''}`}>
                    <td className="px-4 py-3 font-medium text-gray-900">{p.nombre}</td>
                    <td className="px-4 py-3 text-gray-500 hidden md:table-cell max-w-xs truncate">
                      {p.descripcion ?? <span className="text-gray-300">—</span>}
                    </td>
                    <td className="px-4 py-3 text-gray-700 font-medium">
                      ${p.precio.toFixed(2)}
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      {p.categorias.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {p.categorias.map((c) => (
                            <span
                              key={c.id}
                              className="px-2 py-0.5 bg-blue-50 text-[#2E75B6] text-xs rounded-full"
                            >
                              {c.nombre}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-gray-300 text-sm">—</span>
                      )}
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-col gap-1">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium w-fit ${p.is_active
                            ? 'bg-green-50 text-green-700'
                            : 'bg-red-50 text-red-600'
                          }`}>
                          {p.is_active ? 'Activo' : 'Inactivo'}
                        </span>
                        {p.es_terminado && (
                          <span className="px-2 py-0.5 bg-gray-100 text-gray-600 text-[10px] font-bold rounded-full w-fit uppercase">
                            Terminado
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-2">
                        {p.is_active ? (
                          <>
                            <button
                              onClick={() => handleEditar(p)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-[#2E75B6] hover:bg-blue-50 transition-colors"
                              title="Editar"
                            >
                              <PencilIcon className="w-4 h-4" />
                            </button>
                            <button
                              onClick={() => handleEliminar(p)}
                              className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                              title="Eliminar"
                            >
                              <TrashIcon className="w-4 h-4" />
                            </button>
                          </>
                        ) : (
                          <button
                            onClick={() => handleActivar(p)}
                            className="p-1.5 rounded-md text-gray-500 hover:text-green-600 hover:bg-green-50 transition-colors"
                            title="Reactivar"
                          >
                            <ArrowPathIcon className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
            </tbody>
          </table>
        )}

        {!isLoading && productos?.length === 0 && (
          <div className="text-center py-12">
            <p className="text-gray-500 text-sm">No hay productos en este filtro.</p>
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

      <ProductoModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        editando={editando}
      />
    </div>
  );
}
