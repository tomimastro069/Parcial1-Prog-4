import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { CartItem } from '../types';

interface CartState {
  items: CartItem[];

  addItem: (item: CartItem) => void;
  removeItem: (productoId: number) => void;
  updateCantidad: (productoId: number, cantidad: number) => void;
  clearCart: () => void;

  itemCount: () => number;
  subtotal: () => number;
  costoEnvio: () => number;
  total: () => number;
}

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

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

      itemCount: () => get().items.reduce((acc, i) => acc + i.cantidad, 0),

      subtotal: () =>
        get().items.reduce((acc, i) => acc + i.precio * i.cantidad, 0),

      costoEnvio: () => (get().items.length > 0 ? 50 : 0),

      total: () => get().subtotal() + get().costoEnvio(),
    }),
    {
      name: 'foodstore-cart',
      version: 1,
    }
  )
);
