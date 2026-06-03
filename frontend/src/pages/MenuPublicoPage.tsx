import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoRestaurante from '../assets/restaurante.png';
import type { Producto, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

interface Categoria {
  id: number;
  nombre: string;
}

export default function MenuPublicoPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [categoriaId, setCategoriaId] = useState<number | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Fetch categorias
  useEffect(() => {
    fetch(`${API_URL}/api/v1/categorias/?is_active=true&size=50`)
      .then((r) => r.json())
      .then((data) => setCategorias(data.items ?? []))
      .catch(() => {});
  }, []);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setSearch(searchInput);
      setPage(1);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchInput]);

  // Fetch productos
  useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams({ page: String(page), size: '12', is_active: 'true' });
    if (search) params.set('search', search);
    if (categoriaId) params.set('categoria_id', String(categoriaId));

    fetch(`${API_URL}/api/v1/productos/?${params}`)
      .then((r) => r.json())
      .then((data: PaginatedResponse<Producto>) => {
        setProductos(data.items);
        setTotalPages(data.pages);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [page, search, categoriaId]);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <img src={logoRestaurante} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-[#1F3864] text-xl">Food Store</span>
          </Link>
          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="px-4 py-2 text-sm font-medium text-[#2E75B6] hover:bg-blue-50 rounded-lg transition-colors"
            >
              Iniciar sesión
            </Link>
            <Link
              to="/register"
              className="px-4 py-2 text-sm font-medium text-white bg-[#2E75B6] hover:bg-[#245d94] rounded-lg transition-colors"
            >
              Registrarse
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Nuestro menú</h1>

        {/* Búsqueda y filtros */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              type="search"
              placeholder="Buscar productos..."
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none"
            />
          </div>
          {categorias.length > 0 && (
            <select
              value={categoriaId ?? ''}
              onChange={(e) => {
                setCategoriaId(e.target.value ? Number(e.target.value) : null);
                setPage(1);
              }}
              className="px-4 py-2.5 rounded-lg border border-gray-300 text-sm focus:border-[#2E75B6] focus:ring-2 focus:ring-[#2E75B6]/20 focus:outline-none bg-white"
            >
              <option value="">Todas las categorías</option>
              {categorias.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
            ))}
          </div>
        ) : productos.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-gray-500">No se encontraron productos.</p>
            {(search || categoriaId) && (
              <button
                onClick={() => { setSearchInput(''); setCategoriaId(null); }}
                className="mt-3 text-sm text-[#2E75B6] hover:underline"
              >
                Limpiar filtros
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {productos.map((p) => (
              <div key={p.id} className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                <div className="relative h-44 bg-gray-100 overflow-hidden">
                  {p.imagen_url ? (
                    <img src={p.imagen_url} alt={p.nombre} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                    </div>
                  )}
                  {!p.disponible && (
                    <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
                      <span className="bg-red-100 text-red-800 text-xs font-medium px-3 py-1 rounded-full border border-red-200">Sin stock</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-gray-900 truncate">{p.nombre}</h3>
                  {p.descripcion && (
                    <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.descripcion}</p>
                  )}
                  <div className="flex items-center justify-between mt-3">
                    <span className="text-lg font-bold text-[#1F3864]">
                      ${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                    </span>
                    <Link
                      to="/login"
                      className="text-xs text-[#2E75B6] hover:underline font-medium"
                    >
                      Iniciá sesión para pedir
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-1 pt-6">
            <button
              disabled={page === 1}
              onClick={() => setPage(page - 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ‹
            </button>
            {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => i + 1).map((n) => (
              <button
                key={n}
                onClick={() => setPage(n)}
                className={`px-3 py-1.5 rounded-lg text-sm border transition-colors ${
                  page === n ? 'bg-[#2E75B6] border-[#2E75B6] text-white' : 'border-gray-300 hover:bg-gray-50'
                }`}
              >
                {n}
              </button>
            ))}
            <button
              disabled={page === totalPages}
              onClick={() => setPage(page + 1)}
              className="px-3 py-1.5 rounded-lg text-sm border border-gray-300 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed"
            >
              ›
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
