/**
 * ساس — Platform Admin Store (Zustand)
 * إدارة مصادقة وبيانات مدير المنصة
 */

import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';

interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: 'super_admin' | 'admin';
}

interface PlatformStats {
  totalTenants: number;
  totalMerchants: number;
  totalProducts: number;
  totalOrders: number;
  totalRevenue: number;
  todayOrders: number;
  todayRevenue: number;
  recentSignups: number;
  planStats: any[];
}

interface TenantItem {
  id: string;
  name: string;
  slug: string;
  plan: string;
  status: string;
  currency: string;
  created_at: string;
  products_count: number;
  orders_count: number;
  revenue: number;
  owner_name: string;
  owner_email: string;
}

interface MerchantItem {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: string;
  status: string;
  last_login_at: string;
  created_at: string;
  tenant_name: string;
  tenant_slug: string;
  tenant_plan: string;
  tenant_status: string;
}

// ═══ Cookie Helpers ═══
function setAdminCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `saas_admin_token=${token}; path=/; max-age=${2 * 60 * 60}; SameSite=Strict`;
}

function clearAdminCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'saas_admin_token=; path=/; max-age=0';
}

function getAdminToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem('saas_admin_token');
}

// ═══ Admin API helper ═══
async function adminRequest<T = any>(endpoint: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  const token = getAdminToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const config: RequestInit = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  const baseUrl = process.env.NEXT_PUBLIC_API_URL || '';
  const res = await fetch(`${baseUrl}/api/admin${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'حدث خطأ', res.status);
  return data;
}

// ═══ Store ═══
interface AdminState {
  admin: PlatformAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  
  stats: PlatformStats | null;
  tenants: TenantItem[];
  merchants: MerchantItem[];
  tenantsTotal: number;
  merchantsTotal: number;
  
  // Auth
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  
  // Data
  fetchStats: () => Promise<void>;
  fetchTenants: (params?: { search?: string; status?: string; plan?: string; page?: number }) => Promise<void>;
  fetchMerchants: (params?: { search?: string; page?: number }) => Promise<void>;
  updateTenantStatus: (id: string, status: string) => Promise<boolean>;
  updateTenantPlan: (id: string, plan: string) => Promise<boolean>;
  deleteTenant: (id: string) => Promise<boolean>;
  
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  admin: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  stats: null,
  tenants: [],
  merchants: [],
  tenantsTotal: 0,
  merchantsTotal: 0,

  // ═══ Login ═══
  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await adminRequest('/auth/login', {
        method: 'POST',
        body: { email, password },
      });
      localStorage.setItem('saas_admin_token', result.data.tokens.accessToken);
      localStorage.setItem('saas_admin_refresh', result.data.tokens.refreshToken);
      setAdminCookie(result.data.tokens.accessToken);
      set({ admin: result.data.admin, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message });
      return false;
    }
  },

  // ═══ Logout ═══
  logout: () => {
    localStorage.removeItem('saas_admin_token');
    localStorage.removeItem('saas_admin_refresh');
    clearAdminCookie();
    set({ admin: null, isAuthenticated: false, isLoading: false });
  },

  // ═══ Fetch Profile ═══
  fetchProfile: async () => {
    const token = getAdminToken();
    if (!token) { set({ isLoading: false, isAuthenticated: false }); return; }
    try {
      const result = await adminRequest('/auth/me');
      set({ admin: result.data.admin, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('saas_admin_token');
      clearAdminCookie();
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },

  // ═══ Stats ═══
  fetchStats: async () => {
    try {
      const result = await adminRequest('/stats');
      set({ stats: result.data });
    } catch (err) {
      console.error('Failed to fetch stats:', err);
    }
  },

  // ═══ Tenants ═══
  fetchTenants: async (params = {}) => {
    set({ isLoading: true });
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      if (params.status) qs.set('status', params.status);
      if (params.plan) qs.set('plan', params.plan);
      qs.set('page', String(params.page || 1));
      const result = await adminRequest(`/tenants?${qs}`);
      set({ tenants: result.data, tenantsTotal: result.pagination?.total || 0, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message });
    }
  },

  // ═══ Merchants ═══
  fetchMerchants: async (params = {}) => {
    set({ isLoading: true });
    try {
      const qs = new URLSearchParams();
      if (params.search) qs.set('search', params.search);
      qs.set('page', String(params.page || 1));
      const result = await adminRequest(`/merchants?${qs}`);
      set({ merchants: result.data, merchantsTotal: result.pagination?.total || 0, isLoading: false });
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message });
    }
  },

  // ═══ Update Tenant Status ═══
  updateTenantStatus: async (id, status) => {
    try {
      await adminRequest(`/tenants/${id}/status`, { method: 'PUT', body: { status } });
      set((s) => ({
        tenants: s.tenants.map((t) => (t.id === id ? { ...t, status } : t)),
      }));
      return true;
    } catch (err) {
      set({ error: (err as ApiError).message });
      return false;
    }
  },

  // ═══ Update Tenant Plan ═══
  updateTenantPlan: async (id, plan) => {
    try {
      await adminRequest(`/tenants/${id}/plan`, { method: 'PUT', body: { plan } });
      set((s) => ({
        tenants: s.tenants.map((t) => (t.id === id ? { ...t, plan } : t)),
      }));
      return true;
    } catch (err) {
      set({ error: (err as ApiError).message });
      return false;
    }
  },

  // ═══ Delete Tenant ═══
  deleteTenant: async (id) => {
    try {
      await adminRequest(`/tenants/${id}`, { method: 'DELETE' });
      set((s) => ({
        tenants: s.tenants.filter((t) => t.id !== id),
        tenantsTotal: s.tenantsTotal - 1,
      }));
      return true;
    } catch (err) {
      set({ error: (err as ApiError).message });
      return false;
    }
  },

  clearError: () => set({ error: null }),
}));
