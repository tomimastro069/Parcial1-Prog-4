import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MagnifyingGlassIcon, FunnelIcon } from '@heroicons/react/24/outline';
import { ProductoCard } from './ProductoCard';
import { ProductCardSkeleton } from '../../components/Skeleton';
import { useProductos } from '../../hooks/useProductos';
import { useCategorias } from '../../hooks/useCategorias';

const PAGE_SIZE = 12;

export function CatalogoGrid() {
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Leer página de la URL
  const page = parseInt(searchParams.get('page') || '1', 10);
  
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);

  // Debounce de 300ms sobre la búsqueda
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setSearchParams(prev => { prev.set('page', '1'); return prev; });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]); // eslint-disable-line react-hooks/exhaustive-deps

  const { data, isLoading, isError, refetch } = useProductos({
    page,
    size: PAGE_SIZE,
    search: search || undefined,
    categoria_id: categoriaId ?? undefined,
    is_active: true,
  });

  const { data: categoriasData } = useCategorias({ is_active: true });
  const categorias: { id: number; nombre: string }[] = (categoriasData as any)?.items ?? [];

  const handleCategoriaChange = useCallback((id: number | null) => {
    setCategoriaId(id);
    setSearchParams(prev => { prev.set('page', '1'); return prev; });
  }, [setSearchParams]);

  const productos = data?.items ?? [];
  const totalPages = data?.pages ?? 1;

  return (
    <div className="space-y-6">
      {/* Barra de búsqueda y filtros */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="search"
            placeholder="Buscar productos..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-line bg-cream-soft text-sm focus:border-walnut focus:ring-2 focus:ring-walnut/20 focus:outline-none"
          />
        </div>

        {/* Filtro por categoría */}
        {categorias && categorias.length > 0 && (
          <div className="relative flex-shrink-0">
            <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <select
              value={categoriaId ?? ''}
              onChange={(e) =>
                handleCategoriaChange(e.target.value ? Number(e.target.value) : null)
              }
              className="pl-9 pr-8 py-2.5 rounded-lg border border-line text-sm focus:border-walnut focus:ring-2 focus:ring-walnut/20 focus:outline-none bg-cream-soft appearance-none cursor-pointer"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nombre}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Error state */}
      {isError && (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-3">Error al cargar los productos.</p>
          <button
            onClick={() => refetch()}
            className="text-sm text-walnut hover:underline"
          >
            Reintentar
          </button>
        </div>
      )}

      {/* Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {Array.from({ length: PAGE_SIZE }).map((_, i) => (
            <ProductCardSkeleton key={i} />
          ))}
        </div>
      ) : productos.length === 0 ? (
        /* Empty state */
        <div className="text-center py-16">
          <svg
            className="mx-auto w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1}
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h3 className="font-baskerville text-bark font-bold text-lg mb-1">No encontramos productos</h3>
          <p className="text-sm text-gray-500">
            {search
              ? `No hay resultados para "${search}"`
              : 'No hay productos disponibles en esta categoría'}
          </p>
          {(search || categoriaId) && (
            <button
              onClick={() => {
                setSearchInput('');
                setCategoriaId(null);
              }}
              className="mt-3 text-sm text-walnut hover:underline"
            >
              Limpiar filtros
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {productos.map((p, i) => (
            <div key={p.id} style={{ animation: 'slideUp 0.3s ease-out both', animationDelay: `${i * 0.04}s` }}>
              <ProductoCard producto={p} />
            </div>
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-1 pt-2">
          <button
            disabled={page === 1}
            onClick={() => setSearchParams(prev => { prev.set('page', String(page - 1)); return prev; })}
            className="px-3 py-1.5 rounded-lg text-sm border border-line bg-cream-soft hover:bg-cream-deep disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ‹
          </button>

          {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
            const pageNum = i + 1;
            return (
              <button
                key={pageNum}
                onClick={() => setSearchParams(prev => { prev.set('page', String(pageNum)); return prev; })}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${page === pageNum
                  ? 'bg-walnut border-walnut text-tan'
                  : 'border-line bg-cream-soft hover:bg-cream-deep'
                  }`}
              >
                {pageNum}
              </button>
            );
          })}

          <button
            disabled={page === totalPages}
            onClick={() => setSearchParams(prev => { prev.set('page', String(page + 1)); return prev; })}
            className="px-3 py-1.5 rounded-lg text-sm border border-line bg-cream-soft hover:bg-cream-deep disabled:opacity-40 disabled:cursor-not-allowed"
          >
            ›
          </button>
        </div>
      )}
    </div>
  );
}
