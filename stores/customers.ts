/**
 * ساس — Customers Store (Zustand)
 * محادثة ٧: إدارة العملاء
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

export interface CustomerListItem {
  id: string;
  name: string;
  phone: string;
  email: string | null;
  status: string;
  orders_count: number;
  total_spent: number;
  last_order_at: string | null;
  created_at: string;
}

export interface CustomerDetail extends CustomerListItem {
  notes: string | null;
  meta: Record<string, any>;
  updated_at: string;
  orders: {
    id: string;
    order_number: string;
    status: string;
    total: number;
    payment_status: string;
    payment_method: string;
    shipping_method: string;
    created_at: string;
  }[];
  addresses: {
    id: string;
    label: string;
    city: string;
    area: string;
    street: string;
    building: string;
    is_default: boolean;
  }[];
}

export interface CustomerStats {
  total_customers: number;
  total_revenue: number;
  today_new: number;
  top_customers: { id: string; name: string; phone: string; orders_count: number; total_spent: number }[];
}

interface CustomersState {
  customers: CustomerListItem[];
  selectedCustomer: CustomerDetail | null;
  stats: CustomerStats | null;
  isLoading: boolean;
  isUpdating: boolean;
  error: string | null;
  page: number;
  totalPages: number;
  total: number;
  search: string;
  sort: string;

  fetchCustomers: () => Promise<void>;
  fetchCustomer: (id: string) => Promise<CustomerDetail | null>;
  fetchStats: () => Promise<void>;
  updateCustomer: (id: string, data: { name?: string; email?: string; notes?: string; status?: string }) => Promise<boolean>;
  setSearch: (s: string) => void;
  setSort: (s: string) => void;
  setPage: (p: number) => void;
}

export const useCustomersStore = create<CustomersState>((set, get) => ({
  customers: [],
  selectedCustomer: null,
  stats: null,
  isLoading: false,
  isUpdating: false,
  error: null,
  page: 1,
  totalPages: 1,
  total: 0,
  search: '',
  sort: 'newest',

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { page, search, sort } = get();
      const params = new URLSearchParams({ page: String(page), limit: '15', sort });
      if (search) params.set('search', search);

      const res = await api.get(`/api/customers?${params.toString()}`);
      set({
        customers: res.data || [],
        total: res.pagination?.total || 0,
        totalPages: res.pagination?.totalPages || 1,
        isLoading: false,
      });
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchCustomer: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const res = await api.get(`/api/customers/${id}`);
      set({ selectedCustomer: res.data, isLoading: false });
      return res.data;
    } catch (err: any) {
      set({ error: err.message, isLoading: false });
      return null;
    }
  },

  fetchStats: async () => {
    try {
      const res = await api.get('/api/customers/stats');
      set({ stats: res.data });
    } catch {}
  },

  updateCustomer: async (id, data) => {
    set({ isUpdating: true });
    try {
      await api.put(`/api/customers/${id}`, data);
      if (get().selectedCustomer?.id === id) await get().fetchCustomer(id);
      await get().fetchCustomers();
      set({ isUpdating: false });
      return true;
    } catch (err: any) {
      set({ error: err.message, isUpdating: false });
      return false;
    }
  },

  setSearch: (s) => set({ search: s, page: 1 }),
  setSort: (s) => set({ sort: s, page: 1 }),
  setPage: (p) => set({ page: p }),
}));
