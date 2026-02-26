/**
 * ساس — Reports Store
 * محادثة ١٢: التقارير والإحصائيات المتقدمة
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

interface OverviewData {
  revenue: { value: number; growth: number };
  orders: { total: number; paid: number; delivered: number; cancelled: number; growth: number };
  avgOrder: { value: number };
  customers: { total: number; unique: number; growth: number };
  products: { total: number; active: number; outOfStock: number };
  period: string;
}

interface SalesDataPoint {
  date: string;
  label: string;
  orders: number;
  revenue: number;
  shipping: number;
  discounts: number;
  customers: number;
  avgOrder: number;
}

interface TopProduct {
  id: string;
  name: string;
  slug: string;
  price: number;
  comparePrice: number | null;
  stock: number;
  status: string;
  totalOrders: number;
  totalQty: number;
  totalRevenue: number;
  avgRating: number;
  reviewCount: number;
}

interface TopCustomer {
  id: string;
  name: string;
  phone: string;
  email: string;
  totalOrders: number;
  totalSpent: number;
  lastOrder: string;
  firstOrder: string;
}

interface OrdersReport {
  byStatus: { status: string; count: number; total: number }[];
  byPayment: { method: string; count: number; total: number }[];
  byShipping: { method: string; count: number; totalCost: number }[];
  hourlyDistribution: { hour: number; count: number }[];
  conversion: { buyingCustomers: number; totalCustomers: number };
}

interface CategoryReport {
  id: string;
  name: string;
  slug: string;
  productCount: number;
  totalOrders: number;
  totalQty: number;
  totalRevenue: number;
}

interface CustomerReport {
  topCustomers: TopCustomer[];
  acquisition: { date: string; label: string; newCustomers: number }[];
  stats: { total: number; newInPeriod: number; newThisWeek: number; repeatCustomers: number };
}

interface ReportsStore {
  period: string;
  setPeriod: (period: string) => void;
  overview: OverviewData | null;
  sales: SalesDataPoint[];
  topProducts: TopProduct[];
  ordersReport: OrdersReport | null;
  categories: CategoryReport[];
  customerReport: CustomerReport | null;
  loading: boolean;
  error: string | null;
  fetchOverview: () => Promise<void>;
  fetchSales: (groupBy?: string) => Promise<void>;
  fetchTopProducts: (sort?: string) => Promise<void>;
  fetchOrdersReport: () => Promise<void>;
  fetchCategories: () => Promise<void>;
  fetchCustomerReport: () => Promise<void>;
  fetchAll: () => Promise<void>;
}

export const useReportsStore = create<ReportsStore>((set, get) => ({
  period: '30d',
  setPeriod: (period) => set({ period }),
  overview: null,
  sales: [],
  topProducts: [],
  ordersReport: null,
  categories: [],
  customerReport: null,
  loading: false,
  error: null,

  fetchOverview: async () => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/overview?period=${period}`);
      set({ overview: res.data });
    } catch (err: any) {
      console.error('Reports overview error:', err.message);
    }
  },

  fetchSales: async (groupBy = 'day') => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/sales?period=${period}&groupBy=${groupBy}`);
      set({ sales: res.data });
    } catch (err: any) {
      console.error('Sales report error:', err.message);
    }
  },

  fetchTopProducts: async (sort = 'revenue') => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/products?period=${period}&sort=${sort}&limit=10`);
      set({ topProducts: res.data });
    } catch (err: any) {
      console.error('Products report error:', err.message);
    }
  },

  fetchOrdersReport: async () => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/orders?period=${period}`);
      set({ ordersReport: res.data });
    } catch (err: any) {
      console.error('Orders report error:', err.message);
    }
  },

  fetchCategories: async () => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/categories?period=${period}`);
      set({ categories: res.data });
    } catch (err: any) {
      console.error('Categories report error:', err.message);
    }
  },

  fetchCustomerReport: async () => {
    try {
      const { period } = get();
      const res = await api.get(`/api/reports/customers?period=${period}`);
      set({ customerReport: res.data });
    } catch (err: any) {
      console.error('Customer report error:', err.message);
    }
  },

  fetchAll: async () => {
    set({ loading: true, error: null });
    try {
      const store = get();
      await Promise.allSettled([
        store.fetchOverview(),
        store.fetchSales(),
        store.fetchTopProducts(),
        store.fetchOrdersReport(),
        store.fetchCategories(),
        store.fetchCustomerReport(),
      ]);
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ loading: false });
    }
  },
}));
