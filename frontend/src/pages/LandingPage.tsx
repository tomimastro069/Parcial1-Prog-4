import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import logoRestaurante from '../assets/restaurante.png';
import type { Producto, PaginatedResponse } from '../types';

const API_URL = import.meta.env.VITE_API_URL ?? '';

export default function LandingPage() {
  const [productos, setProductos] = useState<Producto[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/api/v1/productos/?size=8&is_active=true`)
      .then((r) => r.json())
      .then((data: PaginatedResponse<Producto>) => setProductos(data.items))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoRestaurante} alt="Logo" className="w-10 h-10 rounded-lg object-cover" />
            <span className="font-bold text-[#1F3864] text-xl">Food Store</span>
          </div>
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

      {/* Hero */}
      <section className="bg-gradient-to-br from-[#1F3864] to-[#2E75B6] text-white">
        <div className="max-w-6xl mx-auto px-4 py-20 text-center">
          <h1 className="text-4xl sm:text-5xl font-bold mb-4">
            Pedí tu comida favorita
          </h1>
          <p className="text-lg text-blue-100 mb-8 max-w-2xl mx-auto">
            Explorá nuestro menú, hacé tu pedido online y recibilo en la puerta de tu casa.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              to="/menu"
              className="px-6 py-3 bg-white text-[#1F3864] font-semibold rounded-lg hover:bg-gray-100 transition-colors"
            >
              Ver menú completo
            </Link>
            <Link
              to="/register"
              className="px-6 py-3 border-2 border-white text-white font-semibold rounded-lg hover:bg-white/10 transition-colors"
            >
              Crear cuenta
            </Link>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-4 py-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div className="text-center">
            <div className="w-14 h-14 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-[#2E75B6]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Menú variado</h3>
            <p className="text-gray-500 text-sm">Gran variedad de productos para todos los gustos.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-green-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Pedido rápido</h3>
            <p className="text-gray-500 text-sm">Hacé tu pedido en pocos pasos y seguilo en tiempo real.</p>
          </div>
          <div className="text-center">
            <div className="w-14 h-14 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-4">
              <svg className="w-7 h-7 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </div>
            <h3 className="font-semibold text-gray-900 text-lg mb-2">Envío a domicilio</h3>
            <p className="text-gray-500 text-sm">Recibí tu pedido en la comodidad de tu hogar.</p>
          </div>
        </div>
      </section>

      {/* Productos destacados */}
      <section className="bg-white border-t border-gray-200">
        <div className="max-w-6xl mx-auto px-4 py-16">
          <div className="text-center mb-10">
            <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 mb-2">Productos destacados</h2>
            <p className="text-gray-500">Algunos de nuestros productos disponibles</p>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="bg-gray-100 rounded-xl h-64 animate-pulse" />
              ))}
            </div>
          ) : productos.length === 0 ? (
            <p className="text-center text-gray-400">No hay productos disponibles en este momento.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {productos.map((p) => (
                <Link to="/menu" key={p.id} className="group">
                  <div className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
                    <div className="relative h-44 bg-gray-100 overflow-hidden">
                      {p.imagen_url ? (
                        <img
                          src={p.imagen_url}
                          alt={p.nombre}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                          </svg>
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h3 className="font-semibold text-gray-900 truncate">{p.nombre}</h3>
                      {p.descripcion && (
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{p.descripcion}</p>
                      )}
                      <p className="text-lg font-bold text-[#1F3864] mt-2">
                        ${p.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          )}

          <div className="text-center mt-10">
            <Link
              to="/menu"
              className="inline-block px-6 py-3 bg-[#2E75B6] text-white font-semibold rounded-lg hover:bg-[#245d94] transition-colors"
            >
              Ver todos los productos
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-[#1F3864] text-white">
        <div className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <img src={logoRestaurante} alt="Logo" className="w-8 h-8 rounded-lg object-cover" />
              <span className="font-bold text-lg">Food Store</span>
            </div>
            <p className="text-blue-200 text-sm">TPI Programación IV</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
