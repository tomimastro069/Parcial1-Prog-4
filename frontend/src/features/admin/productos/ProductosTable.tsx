import { useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { PencilIcon, TrashIcon, PlusIcon, ArrowPathIcon, EyeIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Button } from '../../../components/Button';
import { SearchBar } from '../../../components/SearchBar';
import { SortableHeader } from '../../../components/SortableHeader';
import { TableRowSkeleton } from '../../../components/Skeleton';
import { Pagination } from '../../../components/Pagination';
import { ProductoModal } from './ProductoModal';
import { useProductosAdmin, useDeleteProducto, useActivarProducto } from '../../../hooks/useProductos';
import { useCategorias } from '../../../hooks/useCategorias';
import { useUIStore } from '../../../store/uiStore';
import { useAuthStore } from '../../../store/authStore';
import { productosApi } from '../../../api/productosApi';
import { descargarExcel } from '../../../utils/exportarExcel';
import { useSort } from '../../../hooks/useSort';
import type { ProductoRead, Categoria } from '../../../types';

const PAGE_SIZE = 10;

type Filtro = 'todos' | 'activos' | 'inactivos';

const filtroToParam: Record<Filtro, boolean | null> = {
  todos: null,
  activos: true,
  inactivos: false,
};

export function ProductosTable() {
  const [searchParams, setSearchParams] = useSearchParams();

  // RBAC: ADMIN=full CRUD, STOCK=puede editar (sin crear ni eliminar), PEDIDOS=solo lectura
  const hasRole = useAuthStore((s) => s.hasRole);
  const isAdmin = hasRole('ADMIN');
  const isStock = hasRole('STOCK');
  const canEdit = isAdmin || isStock;
  const canCreate = isAdmin;
  const canDelete = isAdmin;

  const [exportando, setExportando] = useState(false);

  const handleExportar = async () => {
    setExportando(true);
    try {
      const res = await productosApi.listAdmin({ page: 1, size: 1000 });
      const items: ProductoRead[] = (res as any)?.items ?? [];
      if (items.length === 0) { toast.error('No hay productos para exportar'); return; }
      const filas = items.map((p) => ({
        Nombre: p.nombre,
        Precio: p.precio,
        Descripción: p.descripcion ?? '',
        Categorías: p.categorias.map((c) => c.nombre).join(', '),
        Ingredientes: p.ingredientes.map((i) => i.nombre).join(', '),
        Terminado: p.es_terminado ? 'Sí' : 'No',
        Estado: p.is_active ? 'Activo' : 'Inactivo',
      }));
      descargarExcel(filas, 'Productos', 'productos');
      toast.success(`${items.length} productos exportados`);
    } catch { toast.error('Error al exportar'); }
    finally { setExportando(false); }
  };

  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  const [filtro, setFiltro] = useState<Filtro>('todos');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  const { data, isLoading, isError } = useProductosAdmin({
    page,
    size: PAGE_SIZE,
    is_active: filtroToParam[filtro] ?? undefined,
    search: debouncedSearch || undefined,
    categoria_id: categoriaId ?? undefined,
  });

  const { data: catData } = useCategorias({ size: 1000, is_active: true });
  const allCategorias: Categoria[] = (catData as any)?.items ?? [];

  const productosRaw: ProductoRead[] = (data as any)?.items ?? [];
  const totalPages: number = (data as any)?.pages ?? 0;

  const { sorted: productos, field: sortField, dir: sortDir, toggle: sortToggle } = useSort(productosRaw, 'nombre');

  const eliminar = useDeleteProducto();
  const activar = useActivarProducto();
  const openConfirm = useUIStore((s) => s.openConfirmModal);

  const getNombreCompletoCategoria = (catId: number): string => {
    const cat = allCategorias.find(c => c.id === catId);
    if (!cat) return "";

    // Extraer solo el nombre corto (el último después de /) 
    // porque el backend ya manda el nombre con el path
    const partes = cat.nombre.split(' / ');
    const nombreCorto = partes[partes.length - 1] || cat.nombre;

    if (cat.parent_id) {
      const nombrePadre = getNombreCompletoCategoria(cat.parent_id);
      return nombrePadre ? `${nombrePadre} / ${nombreCorto}` : nombreCorto;
    }

    return nombreCorto;
  };

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

  const handleCategoriaChange = (id: number | null) => {
    setCategoriaId(id);
    setSearchParams({ page: '1' });
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Productos</h1>
          <p className="text-sm text-gray-500 mt-0.5">Gestión del catálogo de productos</p>
        </div>
        <div className="flex items-center gap-2">
          {!canEdit && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-amber-700 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-full">
              <EyeIcon className="w-3.5 h-3.5" />
              Solo lectura
            </span>
          )}
          {isStock && !isAdmin && (
            <span className="flex items-center gap-1.5 text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200 px-2.5 py-1 rounded-full">
              Gestor de Stock
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
          {canCreate && (
            <Button onClick={handleNuevo} className="gap-2">
              <PlusIcon className="w-4 h-4" />
              Nuevo producto
            </Button>
          )}
        </div>
      </div>

      {/* Filtros: estado + categoría + buscador */}
      <div className="flex flex-col sm:flex-row gap-3 mb-4 items-start sm:items-center justify-between flex-wrap">
        <div className="flex flex-wrap gap-2 items-center">
          {/* Botones de estado */}
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

          {/* Dropdown filtro por categoría */}
          <select
            value={categoriaId ?? ''}
            onChange={(e) => handleCategoriaChange(e.target.value ? Number(e.target.value) : null)}
            className="px-3 py-1.5 rounded-lg text-sm border border-gray-200 bg-white text-gray-600 focus:outline-none focus:ring-2 focus:ring-[#1F3864]/20 focus:border-[#1F3864] cursor-pointer"
          >
            <option value="">Todas las categorías</option>
            {allCategorias.map((c) => (
              <option key={c.id} value={c.id}>
                {c.nombre.split(' / ').pop() ?? c.nombre}
              </option>
            ))}
          </select>

          {/* Limpiar filtro de categoría */}
          {categoriaId !== null && (
            <button
              onClick={() => handleCategoriaChange(null)}
              className="text-xs text-gray-400 hover:text-gray-600 underline"
            >
              Limpiar
            </button>
          )}
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
                <SortableHeader label="Nombre" field="nombre" activeField={sortField as string} dir={sortDir} onSort={(f) => sortToggle(f as keyof ProductoRead)} />
                <th className="text-left px-4 py-3 font-semibold text-gray-700 hidden md:table-cell">Descripción</th>
                <SortableHeader label="Precio" field="precio" activeField={sortField as string} dir={sortDir} onSort={(f) => sortToggle(f as keyof ProductoRead)} />
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
                              {allCategorias.length > 0 ? getNombreCompletoCategoria(c.id) : c.nombre}
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
                        {canEdit ? (
                          p.is_active ? (
                            <>
                              <button
                                onClick={() => handleEditar(p)}
                                className="p-1.5 rounded-md text-gray-500 hover:text-[#2E75B6] hover:bg-blue-50 transition-colors"
                                title="Editar"
                              >
                                <PencilIcon className="w-4 h-4" />
                              </button>
                              {canDelete && (
                                <button
                                  onClick={() => handleEliminar(p)}
                                  className="p-1.5 rounded-md text-gray-500 hover:text-red-600 hover:bg-red-50 transition-colors"
                                  title="Eliminar"
                                >
                                  <TrashIcon className="w-4 h-4" />
                                </button>
                              )}
                            </>
                          ) : (
                            <button
                              onClick={() => handleActivar(p)}
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
