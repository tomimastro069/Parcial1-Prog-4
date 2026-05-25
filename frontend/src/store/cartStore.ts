import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';
import { getAjuste } from '../api/ajustesApi';

interface CartState {
  items: CartItem[];
  costoEnvioValor: number;

  addItem: (item: CartItem) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  clearCart: () => void;
  fetchCostoEnvio: () => Promise<void>;

  itemCount: () => number;
  subtotal: () => number;
  costoEnvio: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],
      costoEnvioValor: 50,

      addItem: (item) =>
        set((s) => {
          const existing = s.items.find((i) => i.producto_id === item.producto_id);
          if (existing) {
            return {
              items: s.items.map((i) =>
                i.producto_id === item.producto_id
                  ? { ...i, cantidad: i.cantidad + item.cantidad }
                  : i
              ),
            };
          }
          return { items: [...s.items, item] };
        }),

      removeItem: (productoId) =>
        set((s) => ({ items: s.items.filter((i) => i.producto_id !== productoId) })),

      updateCantidad: (productoId, cantidad) =>
        set((s) => ({
          items: s.items.map((i) =>
            i.producto_id === productoId ? { ...i, cantidad: Math.max(1, cantidad) } : i
          ),
        })),

      clearCart: () => set({ items: [] }),

      fetchCostoEnvio: async () => {
        try {
          const ajuste = await getAjuste('costo_envio');
          set({ costoEnvioValor: parseFloat(ajuste.valor) });
        } catch (error) {
          console.error('Error al obtener el costo de envío:', error);
        }
      },

      itemCount: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

      costoEnvio: () => (get().items.length > 0 ? get().costoEnvioValor : 0),

      total: () => get().subtotal() + get().costoEnvio(),
    }),
    {
      name: 'foodstore-cart',
      version: 1,
    }
  )
);

// Intentar cargar el costo de envío al importar
useCartStore.getState().fetchCostoEnvio();
