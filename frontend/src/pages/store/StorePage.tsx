import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CatalogoGrid } from '../../features/store/CatalogoGrid';

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-6">
        <ShoppingBagIcon className="w-7 h-7 text-[#2E75B6]" />
        <div>
          <h1 className="text-2xl font-bold text-[#1F3864]">Menú</h1>
          <p className="text-sm text-gray-500">Explorá nuestros productos</p>
        </div>
      </div>

      <CatalogoGrid />
    </div>
  );
}
