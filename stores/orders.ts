/**
 * ساس — Orders Store (Zustand)
 * محادثة ٦: إدارة الطلبات
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

// ═══ Types ═══

export interface OrderListItem {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  coupon_code: string | null;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  items_count: number;
}

export interface OrderDetail {
  id: string;
  order_number: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  tax_amount: number;
  total: number;
  status: string;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  shipping_address: Record<string, any>;
  coupon_code: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  created_at: string;
  updated_at: string;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  customer_orders_count: number;
  customer_total_spent: number;
  items: OrderItem[];
  status_history: StatusHistory[];
}

export interface OrderItem {
  id: string;
  name: string;
  sku: string | null;
  image_url: string | null;
  options: Record<string, string>;
  price: number;
  quantity: number;
  total: number;
}

export interface StatusHistory {
  id: string;
  status: string;
  note: string | null;
  changed_by: string | null;
  created_at: string;
}

export interface OrderStats {
  total_orders: number;
  today_orders: number;
  today_revenue: number;
  total_revenue: number;
  paid_revenue: number;
  new_orders: number;
  processing_orders: number;
  shipped_orders: number;
  delivered_orders: number;
  cancelled_orders: number;
  by_status: Record<string, number>;
}

interface OrdersState {
  orders: OrderListItem[];
  selectedOrder: OrderDetail | null;
  stats: OrderStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;

  // Pagination
  page: number;
  totalPages: number;
  total: number;

  // Filters
  search: string;
  statusFilter: string;
  paymentFilter: string;
  sort: string;

  // Actions
  fetchOrders: () => Promise<void>;
  fetchOrder: (id: string) => Promise<OrderDetail | null>;
  fetchStats: () => Promise<void>;
  updateStatus: (id: string, status: string, note?: string) => Promise<boolean>;
  updatePayment: (id: string, paymentStatus: string) => Promise<boolean>;
  updateNotes: (id: string, notes: string) => Promise<boolean>;

  setSearch: (s: string) => void;
  setStatusFilter: (s: string) => void;
  setPaymentFilter: (s: string) => void;
  setSort: (s: string) => void;
  setPage: (p: number) => void;
  clearFilters: () => void;
}

export const useOrdersStore = create<OrdersState>((set, get) => ({
  orders: [],
  selectedOrder: null,
  stats: null,
  isLoading: false,
  isUpdating: false,
  error: null,

  page: 1,
  totalPages: 1,
  total: 0,

  search: '',
  statusFilter: 'all',
  paymentFilter: 'all',
  sort: 'newest',

  fetchOrders: async () => {
    set({ isLoading: true, error: null });
    try {
      const { page, search, statusFilter, paymentFilter, sort } = get();
      const params = new URLSearchParams();
      params.set('page', String(page));
      params.set('limit', '15');
      if (search) params.set('search', search);
      if (statusFilter !== 'all') params.set('status', statusFilter);
      if (paymentFilter !== 'all') params.set('payment_status', paymentFilter);
      if (sort) params.set('sort', sort);

      const res = await api.get(`/api/orders?${params.toString()}`);
      set({
        orders: res.data || [],
        total: res.pagination?.total || 0,
        totalPages: res.pagination?.totalPages || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchOrder: async (id: string) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/orders/${id}`);
      const order = res.data;
      set({ selectedOrder: order, isLoading: false });
      return order;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/api/orders/stats');
      set({ stats: res.data });
    } catch {}
  },

  updateStatus: async (id, status, note) => {
    set({ isUpdating: true });
    try {
      await api.put(`/api/orders/${id}/status`, { status, note });
      // Refresh order detail if viewing
      if (get().selectedOrder?.id === id) {
        await get().fetchOrder(id);
      }
      // Refresh list
      await get().fetchOrders();
      await get().fetchStats();
      set({ isUpdating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isUpdating: false });
      return false;
    }
  },

  updatePayment: async (id, paymentStatus) => {
    set({ isUpdating: true });
    try {
      await api.put(`/api/orders/${id}/payment`, { payment_status: paymentStatus });
      if (get().selectedOrder?.id === id) {
        await get().fetchOrder(id);
      }
      await get().fetchOrders();
      set({ isUpdating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isUpdating: false });
      return false;
    }
  },

  updateNotes: async (id, notes) => {
    set({ isUpdating: true });
    try {
      await api.put(`/api/orders/${id}/notes`, { admin_notes: notes });
      if (get().selectedOrder?.id === id) {
        set((s) => ({
          selectedOrder: s.selectedOrder ? { ...s.selectedOrder, admin_notes: notes } : null,
        }));
      }
      set({ isUpdating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isUpdating: false });
      return false;
    }
  },

  setSearch: (s) => set({ search: s, page: 1 }),
  setStatusFilter: (s) => set({ statusFilter: s, page: 1 }),
  setPaymentFilter: (s) => set({ paymentFilter: s, page: 1 }),
  setSort: (s) => set({ sort: s, page: 1 }),
  setPage: (p) => set({ page: p }),
  clearFilters: () => set({ search: '', statusFilter: 'all', paymentFilter: 'all', sort: 'newest', page: 1 }),
}));
