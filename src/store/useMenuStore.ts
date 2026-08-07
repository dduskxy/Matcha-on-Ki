import { create } from 'zustand';
import { menuData, type MenuItem } from '../data/menuData';

interface MenuState {
  items: MenuItem[];
  updatePrice: (id: string, newPrice: number) => void;
  updateItem: (id: string, updates: Partial<MenuItem>) => void;
}

export const useMenuStore = create<MenuState>((set) => {
  // Try to load from localStorage
  const saved = localStorage.getItem('sakura-menu-items');
  const initialItems = saved ? JSON.parse(saved) : menuData;

  const store = {
    items: initialItems,
    updatePrice: (id: string, newPrice: number) => {
      set((state) => {
        const newItems = state.items.map((item) =>
          item.id === id ? { ...item, price: newPrice } : item
        );
        localStorage.setItem('sakura-menu-items', JSON.stringify(newItems));
        
        // Broadcast to other tabs
        const channel = new BroadcastChannel('menu-sync');
        channel.postMessage({ type: 'UPDATE_ITEMS', payload: newItems });
        channel.close();

        return { items: newItems };
      });
    },
    updateItem: (id: string, updates: Partial<MenuItem>) => {
      set((state) => {
        const newItems = state.items.map((item) =>
          item.id === id ? { ...item, ...updates } : item
        );
        localStorage.setItem('sakura-menu-items', JSON.stringify(newItems));
        
        // Broadcast to other tabs
        const channel = new BroadcastChannel('menu-sync');
        channel.postMessage({ type: 'UPDATE_ITEMS', payload: newItems });
        channel.close();

        return { items: newItems };
      });
    }
  };

  // Listen to cross-tab updates
  const channel = new BroadcastChannel('menu-sync');
  channel.onmessage = (event) => {
    if (event.data.type === 'UPDATE_ITEMS') {
      set({ items: event.data.payload });
    }
  };

  return store;
});
