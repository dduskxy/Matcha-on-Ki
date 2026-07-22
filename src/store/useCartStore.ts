import { create } from 'zustand';
import type { MenuItem } from '../data/menuData';

export interface CartItem extends MenuItem {
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isCartOpen: boolean;
  addItem: (item: MenuItem) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  toggleCart: () => void;
  clearCart: () => void;
}

export const useCartStore = create<CartState>((set) => ({
  items: [],
  isCartOpen: false,
  addItem: (item) => set((state) => {
    const existing = state.items.find((i) => i.id === item.id);
    if (existing) {
      return { 
        items: state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i),
        isCartOpen: true 
      };
    }
    return { items: [...state.items, { ...item, quantity: 1 }], isCartOpen: true };
  }),
  removeItem: (id) => set((state) => ({ items: state.items.filter((i) => i.id !== id) })),
  updateQuantity: (id, quantity) => set((state) => ({
    items: quantity <= 0 
      ? state.items.filter((i) => i.id !== id) 
      : state.items.map((i) => i.id === id ? { ...i, quantity } : i)
  })),
  toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
  clearCart: () => set({ items: [], isCartOpen: false }),
}));
