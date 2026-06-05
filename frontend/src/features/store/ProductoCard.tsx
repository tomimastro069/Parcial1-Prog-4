import { Link } from 'react-router-dom';
import { ShoppingCartIcon } from '@heroicons/react/24/outline';
import toast from 'react-hot-toast';
import { Badge } from '../../components/Badge';
import { Button } from '../../components/Button';
import { useCartStore } from '../../store/cartStore';
import type { Producto } from '../../types';

interface ProductoCardProps {
  producto: Producto;
}

export function ProductoCard({ producto }: ProductoCardProps) {
  const addItem = useCartStore((s) => s.addItem);

  const items = useCartStore((s) => s.items);
  const enCarrito = items.find((i) => i.producto_id === producto.id);
  const cantidadEnCarrito = enCarrito?.cantidad ?? 0;
  const sinStockParaAgregar = cantidadEnCarrito >= producto.stock_calculado;

  const handleAgregar = () => {
    if (sinStockParaAgregar) {
      toast.error(`Stock máximo alcanzado (${producto.stock_calculado})`);
      return;
    }
    addItem({
      producto_id: producto.id,
      nombre: producto.nombre,
      precio: producto.precio,
      cantidad: 1,
      stock: producto.stock_calculado,
      imagen_url: producto.imagen_url,
    });
    toast.success(`${producto.nombre} agregado al carrito`);
  };

  return (
    <div className="group relative bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-md transition-shadow">
      {/* Imagen */}
      <Link to={`/store/producto/${producto.id}`}>
        <div className="relative h-44 bg-gray-100 overflow-hidden">
          {producto.imagen_url ? (
            <img
              src={producto.imagen_url}
              alt={producto.nombre}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center">
              <svg className="w-16 h-16 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
          )}

          {/* Badge sin stock */}
          {!producto.disponible && (
            <div className="absolute inset-0 bg-gray-900/40 flex items-center justify-center">
              <Badge variant="sinstock" className="text-sm px-3 py-1">
                Sin stock
              </Badge>
            </div>
          )}
        </div>
      </Link>

      {/* Info */}
      <div className="p-4">
        <Link to={`/store/producto/${producto.id}`}>
          <h3 className="font-semibold text-gray-900 truncate hover:text-[#2E75B6] transition-colors">
            {producto.nombre}
          </h3>
        </Link>
        {producto.descripcion && (
          <p className="text-xs text-gray-500 mt-0.5 line-clamp-2">{producto.descripcion}</p>
        )}

        <div className="flex items-center justify-between mt-3">
          <span className="text-lg font-bold text-[#1F3864]">
            ${producto.precio.toLocaleString('es-AR', { minimumFractionDigits: 2 })}
          </span>
          <Button
            size="sm"
            disabled={!producto.disponible}
            onClick={handleAgregar}
            className="gap-1"
          >
            <ShoppingCartIcon className="w-4 h-4" />
            Agregar
          </Button>
        </div>
      </div>
    </div>
  );
}
