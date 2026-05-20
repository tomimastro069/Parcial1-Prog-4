import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface CartItem {
  producto_id: number;
  nombre: string;
  precio_base: number;
  cantidad: number;
  personalizacion: number[]; // IDs de ingredientes removidos
}

interface CartState {
  items: CartItem[];
  addItem: (item: CartItem) => void;
  removeItem: (producto_id: number, personalizacion: number[]) => void;
  updateQuantity: (producto_id: number, personalizacion: number[], delta: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getTotalItems: () => number;
}

// Función auxiliar para comparar arreglos de personalización (si tienen los mismos IDs eliminados)
const areSameCustomization = (a: number[], b: number[]) => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, index) => val === sortedB[index]);
};

export const useCartStore = create<CartState>()(
  persist(
    (set, get) => ({
      items: [],

      addItem: (newItem) => {
        set((state) => {
          const existingItemIndex = state.items.findIndex(
            (i) => i.producto_id === newItem.producto_id && areSameCustomization(i.personalizacion, newItem.personalizacion)
          );

          if (existingItemIndex >= 0) {
            // Si el producto con la MISMA personalización ya existe, sumamos la cantidad
            const newItems = [...state.items];
            newItems[existingItemIndex].cantidad += newItem.cantidad;
            return { items: newItems };
          }
          // Si no existe o tiene distinta personalización, se agrega como un nuevo item
          return { items: [...state.items, newItem] };
        });
      },

      removeItem: (producto_id, personalizacion) => {
        set((state) => ({
          items: state.items.filter(
            (i) => !(i.producto_id === producto_id && areSameCustomization(i.personalizacion, personalizacion))
          ),
        }));
      },

      updateQuantity: (producto_id, personalizacion, delta) => {
        set((state) => {
          const newItems = state.items.map((i) => {
            if (i.producto_id === producto_id && areSameCustomization(i.personalizacion, personalizacion)) {
              const newQuantity = i.cantidad + delta;
              return { ...i, cantidad: Math.max(1, newQuantity) };
            }
            return i;
          });
          return { items: newItems };
        });
      },

      clearCart: () => set({ items: [] }),

      getSubtotal: () => {
        const state = get();
        return state.items.reduce((acc, item) => acc + (item.precio_base * item.cantidad), 0);
      },

      getTotalItems: () => {
        const state = get();
        return state.items.reduce((acc, item) => acc + item.cantidad, 0);
      },
    }),
    {
      name: 'foodstore-cart', // Clave bajo la que se guarda en localStorage
    }
  )
);
