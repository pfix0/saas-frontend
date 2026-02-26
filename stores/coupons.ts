/**
 * ساس — Coupons Store (Zustand)
 * محادثة ٨: إدارة الكوبونات
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

// ═══ Types ═══

export interface Coupon {
  id: string;
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  description: string | null;
  min_order: number | null;
  max_discount: number | null;
  max_uses: number | null;
  used_count: number;
  starts_at: string | null;
  expires_at: string | null;
  is_active: boolean;
  computed_status: 'active' | 'expired' | 'used_up' | 'inactive' | 'scheduled';
  created_at: string;
  updated_at: string;
}

export interface CouponStats {
  total: number;
  active: number;
  total_discount: number;
  total_uses: number;
  top_coupon: { code: string; used_count: number } | null;
}

interface CouponDetail extends Coupon {
  orders: Array<{
    id: string;
    order_number: string;
    total: number;
    discount_amount: number;
    created_at: string;
    customer_name: string;
    customer_phone: string;
  }>;
}

interface CouponsState {
  coupons: Coupon[];
  stats: CouponStats | null;
  currentCoupon: CouponDetail | null;
  isLoading: boolean;
  pagination: {
    total: number;
    page: number;
    limit: number;
    pages: number;
  };

  fetchCoupons: (params?: Record<string, string>) => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchCoupon: (id: string) => Promise<void>;
  createCoupon: (data: any) => Promise<Coupon>;
  updateCoupon: (id: string, data: any) => Promise<void>;
  deleteCoupon: (id: string) => Promise<void>;
  toggleCoupon: (id: string) => Promise<void>;
}

export const useCouponsStore = create<CouponsState>((set, get) => ({
  coupons: [],
  stats: null,
  currentCoupon: null,
  isLoading: false,
  pagination: { total: 0, page: 1, limit: 20, pages: 0 },

  fetchCoupons: async (params = {}) => {
    set({ isLoading: true });
    try {
      const queryStr = new URLSearchParams(params).toString();
      const res = await api.get(`/api/coupons?${queryStr}`);
      set({
        coupons: res.data,
        pagination: res.pagination,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/api/coupons/stats');
      set({ stats: res.data });
    } catch {}
  },

  fetchCoupon: async (id: string) => {
    set({ isLoading: true });
    try {
      const res = await api.get(`/api/coupons/${id}`);
      set({ currentCoupon: res.data, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },

  createCoupon: async (data: any) => {
    const res = await api.post('/api/coupons', data);
    return res.data;
  },

  updateCoupon: async (id: string, data: any) => {
    await api.put(`/api/coupons/${id}`, data);
  },

  deleteCoupon: async (id: string) => {
    await api.delete(`/api/coupons/${id}`);
    set((state) => ({
      coupons: state.coupons.filter((c) => c.id !== id),
    }));
  },

  toggleCoupon: async (id: string) => {
    const res = await api.put(`/api/coupons/${id}/toggle`, {});
    set((state) => ({
      coupons: state.coupons.map((c) =>
        c.id === id ? { ...c, is_active: res.data.is_active } : c
      ),
    }));
  },
}));
