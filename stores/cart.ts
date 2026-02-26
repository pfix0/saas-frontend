/**
 * ساس — Shopping Cart Store (Zustand)
 * سلة التسوق — client-side فقط
 */

import { create } from 'zustand';

export interface CartItem {
  id: string;
  name: string;
  slug: string;
  price: number;
  salePrice?: number;
  image?: string;
  quantity: number;
}

interface CartState {
  items: CartItem[];
  isOpen: boolean;

  addItem: (item: Omit<CartItem, 'quantity'>, qty?: number) => void;
  removeItem: (id: string) => void;
  updateQuantity: (id: string, quantity: number) => void;
  clearCart: () => void;
  toggleCart: () => void;
  setCartOpen: (open: boolean) => void;

  totalItems: () => number;
  totalPrice: () => number;
}

function loadCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  try { return JSON.parse(localStorage.getItem('saas_cart') || '[]'); }
  catch { return []; }
}
function saveCart(items: CartItem[]) {
  if (typeof window !== 'undefined') localStorage.setItem('saas_cart', JSON.stringify(items));
}

export const useCartStore = create<CartState>((set, get) => ({
  items: loadCart(),
  isOpen: false,

  addItem: (item, qty = 1) => set((s) => {
    const existing = s.items.find(i => i.id === item.id);
    const newItems = existing
      ? s.items.map(i => i.id === item.id ? { ...i, quantity: i.quantity + qty } : i)
      : [...s.items, { ...item, quantity: qty }];
    saveCart(newItems);
    return { items: newItems, isOpen: true };
  }),

  removeItem: (id) => set((s) => {
    const newItems = s.items.filter(i => i.id !== id);
    saveCart(newItems);
    return { items: newItems };
  }),

  updateQuantity: (id, quantity) => {
    if (quantity < 1) return get().removeItem(id);
    set((s) => {
      const newItems = s.items.map(i => i.id === id ? { ...i, quantity } : i);
      saveCart(newItems);
      return { items: newItems };
    });
  },

  clearCart: () => { saveCart([]); set({ items: [] }); },
  toggleCart: () => set(s => ({ isOpen: !s.isOpen })),
  setCartOpen: (open) => set({ isOpen: open }),

  totalItems: () => get().items.reduce((sum, i) => sum + i.quantity, 0),
  totalPrice: () => get().items.reduce((sum, i) => sum + (i.salePrice || i.price) * i.quantity, 0),
}));
