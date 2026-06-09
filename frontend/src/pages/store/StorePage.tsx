import { ShoppingBagIcon } from '@heroicons/react/24/outline';
import { CatalogoGrid } from '../../features/store/CatalogoGrid';

export default function StorePage() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
      <div className="flex items-center gap-3 mb-8">
        <ShoppingBagIcon className="w-7 h-7 text-walnut" />
        <div>
          <p className="eyebrow mb-1">Hecho con cuidado</p>
          <h1 className="font-baskerville font-bold text-coffee text-3xl tracking-[-0.01em] leading-none">Nuestro menú</h1>
        </div>
      </div>
      <div className="w-10 h-px bg-gold mb-8" />

      <CatalogoGrid />
    </div>
  );
}
