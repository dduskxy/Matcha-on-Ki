import { create } from 'zustand';
import type { MenuItem } from '../data/menuData';
import { audio } from '../utils/audio';

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

export const useCartStore = create<CartState>((set) => {
  // Load from localStorage on mount
  const saved = localStorage.getItem('sakura-cart-items');
  const initialItems = saved ? JSON.parse(saved) : [];

  const store = {
    items: initialItems,
    isCartOpen: false,
    
    addItem: (item: MenuItem) => set((state) => {
      const existing = state.items.find((i) => i.id === item.id);
      let newItems;
      if (existing) {
        newItems = state.items.map((i) => i.id === item.id ? { ...i, quantity: i.quantity + 1 } : i);
      } else {
        newItems = [...state.items, { ...item, quantity: 1 }];
      }
      
      localStorage.setItem('sakura-cart-items', JSON.stringify(newItems));
      const channel = new BroadcastChannel('cart-sync');
      channel.postMessage({ type: 'SYNC_CART', payload: newItems });
      channel.close();
      
      audio.playBambooClick();
      return { items: newItems, isCartOpen: true };
    }),
    
    removeItem: (id: string) => set((state) => {
      const newItems = state.items.filter((i) => i.id !== id);
      
      localStorage.setItem('sakura-cart-items', JSON.stringify(newItems));
      const channel = new BroadcastChannel('cart-sync');
      channel.postMessage({ type: 'SYNC_CART', payload: newItems });
      channel.close();
      
      audio.playBambooClick();
      return { items: newItems };
    }),
    
    updateQuantity: (id: string, quantity: number) => set((state) => {
      const newItems = quantity <= 0 
        ? state.items.filter((i) => i.id !== id) 
        : state.items.map((i) => i.id === id ? { ...i, quantity } : i);
        
      localStorage.setItem('sakura-cart-items', JSON.stringify(newItems));
      const channel = new BroadcastChannel('cart-sync');
      channel.postMessage({ type: 'SYNC_CART', payload: newItems });
      channel.close();
        
      return { items: newItems };
    }),
    
    toggleCart: () => set((state) => ({ isCartOpen: !state.isCartOpen })),
    
    clearCart: () => {
      localStorage.removeItem('sakura-cart-items');
      const channel = new BroadcastChannel('cart-sync');
      channel.postMessage({ type: 'SYNC_CART', payload: [] });
      channel.close();
      set({ items: [], isCartOpen: false });
    },
  };

  // Listen to cross-tab updates
  const channel = new BroadcastChannel('cart-sync');
  channel.onmessage = (event) => {
    if (event.data.type === 'SYNC_CART') {
      set({ items: event.data.payload });
    }
  };

  return store;
});
