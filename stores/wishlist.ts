'use client';

/**
 * ساس — محادثة ٨: Wishlist Store
 */

import { create } from 'zustand';

interface WishlistItem {
  id: string;
  product_id: string;
  name: string;
  slug: string;
  price: number;
  sale_price?: number;
  image?: string;
}

interface WishlistStore {
  items: WishlistItem[];
  loading: boolean;

  fetchWishlist: (storeSlug: string, customerId: string) => Promise<void>;
  toggleWishlist: (storeSlug: string, customerId: string, productId: string) => Promise<'added' | 'removed'>;
  isInWishlist: (productId: string) => boolean;
  count: () => number;
}

export const useWishlistStore = create<WishlistStore>((set, get) => ({
  items: [],
  loading: false,

  fetchWishlist: async (storeSlug, customerId) => {
    set({ loading: true });
    try {
      const res = await fetch(`/api/store/${storeSlug}/wishlist/${customerId}`);
      const data = await res.json();
      if (data.success) {
        set({ items: data.data.map((item: any) => ({
          id: item.id,
          product_id: item.product_id,
          name: item.name,
          slug: item.slug,
          price: item.price,
          sale_price: item.sale_price,
          image: item.image,
        }))});
      }
    } catch (err) {
      console.error('Wishlist fetch error:', err);
    } finally {
      set({ loading: false });
    }
  },

  toggleWishlist: async (storeSlug, customerId, productId) => {
    try {
      const res = await fetch(`/api/store/${storeSlug}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, product_id: productId }),
      });
      const data = await res.json();
      if (data.success) {
        // Refresh wishlist
        await get().fetchWishlist(storeSlug, customerId);
        return data.action;
      }
      return 'removed';
    } catch {
      return 'removed';
    }
  },

  isInWishlist: (productId) => {
    return get().items.some(item => item.product_id === productId);
  },

  count: () => get().items.length,
}));
