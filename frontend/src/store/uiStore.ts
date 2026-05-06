import { create } from 'zustand';
import type { ConfirmModalData } from '../types';

interface UIState {
  cartOpen: boolean;
  sidebarOpen: boolean;
  confirmModal: ConfirmModalData | null;

  openCart: () => void;
  closeCart: () => void;
  toggleSidebar: () => void;
  closeSidebar: () => void;
  openConfirmModal: (title: string, message: string, onConfirm: () => void) => void;
  closeConfirmModal: () => void;
}

export const useUIStore = create<UIState>()((set) => ({
  cartOpen: false,
  sidebarOpen: false,
  confirmModal: null,

  openCart: () => set({ cartOpen: true }),
  closeCart: () => set({ cartOpen: false }),
  toggleSidebar: () => set((s) => ({ sidebarOpen: !s.sidebarOpen })),
  closeSidebar: () => set({ sidebarOpen: false }),

  openConfirmModal: (title, message, onConfirm) =>
    set({ confirmModal: { open: true, title, message, onConfirm } }),

  closeConfirmModal: () => set({ confirmModal: null }),
}));
