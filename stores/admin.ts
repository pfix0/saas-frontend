/**
 * ساس — Platform Admin Store (Zustand)
 * منظومة إدارة المنصة — ٦ أدوار
 */

import { create } from 'zustand';
import { ApiError } from '@/lib/api';

// ═══ Types ═══
type PlatformRole = 'founder' | 'director' | 'supervisor' | 'support' | 'accountant' | 'employee';

interface PlatformAdmin {
  id: string;
  name: string;
  email: string;
  role: PlatformRole;
  permissions: string[];
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
  financialData: any;
}

interface TenantItem {
  id: string; name: string; slug: string; plan: string; status: string;
  created_at: string; products_count: number; orders_count: number;
  revenue: number; owner_name: string; owner_email: string;
}

interface MerchantItem {
  id: string; name: string; email: string; phone: string; role: string;
  status: string; last_login_at: string; created_at: string;
  tenant_name: string; tenant_slug: string; tenant_plan: string;
}

interface StaffMember {
  id: string; name: string; email: string; role: PlatformRole;
  permissions: string[]; status: string; last_login_at: string; created_at: string;
}

// ═══ API helper — uses relative URL (goes through Next.js rewrites) ═══
async function adminFetch<T = any>(endpoint: string, options: { method?: string; body?: any } = {}): Promise<T> {
  const { method = 'GET', body } = options;
  const headers: Record<string, string> = { 'Content-Type': 'application/json' };
  
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('saas_admin_token');
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = { method, headers };
  if (body && method !== 'GET') config.body = JSON.stringify(body);

  // Use RELATIVE URL — Next.js rewrites → Railway
  const res = await fetch(`/api/admin${endpoint}`, config);
  const data = await res.json();
  if (!res.ok) throw new ApiError(data.error || 'حدث خطأ', res.status);
  return data;
}

// ═══ Cookie helpers ═══
function setCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `saas_admin_token=${token}; path=/; max-age=${7200}; SameSite=Strict`;
}
function clearCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'saas_admin_token=; path=/; max-age=0';
}

// ═══ Role permissions map ═══
export const ROLE_CONFIG: Record<PlatformRole, { label: string; icon: string; color: string; nav: string[] }> = {
  founder:    { label: 'مؤسس',     icon: 'diamond',             color: 'text-amber-400',  nav: ['overview', 'tenants', 'merchants', 'staff', 'finance'] },
  director:   { label: 'مدير',     icon: 'admin_panel_settings', color: 'text-brand-400',  nav: ['overview', 'tenants', 'merchants', 'staff', 'finance'] },
  supervisor: { label: 'مشرف',     icon: 'supervisor_account',  color: 'text-blue-400',   nav: ['overview', 'tenants', 'merchants'] },
  support:    { label: 'دعم فني',  icon: 'support_agent',       color: 'text-green-400',  nav: ['overview', 'tenants', 'merchants'] },
  accountant: { label: 'محاسب',    icon: 'account_balance',     color: 'text-purple-400', nav: ['overview', 'finance'] },
  employee:   { label: 'موظف',     icon: 'badge',               color: 'text-grey-400',   nav: ['overview'] },
};

// ═══ Store ═══
interface AdminState {
  admin: PlatformAdmin | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  stats: PlatformStats | null;
  tenants: TenantItem[];
  merchants: MerchantItem[];
  staff: StaffMember[];
  tenantsTotal: number;
  merchantsTotal: number;

  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  fetchStats: () => Promise<void>;
  fetchTenants: (params?: Record<string, any>) => Promise<void>;
  fetchMerchants: (params?: Record<string, any>) => Promise<void>;
  fetchStaff: () => Promise<void>;
  addStaff: (data: { name: string; email: string; password: string; role: string }) => Promise<boolean>;
  updateStaffRole: (id: string, role: string) => Promise<boolean>;
  updateStaffStatus: (id: string, status: string) => Promise<boolean>;
  deleteStaffMember: (id: string) => Promise<boolean>;
  updateTenantStatus: (id: string, status: string) => Promise<boolean>;
  updateTenantPlan: (id: string, plan: string) => Promise<boolean>;
  deleteTenant: (id: string) => Promise<boolean>;
  impersonate: (merchantId: string) => Promise<boolean>;
  
  hasAccess: (section: string) => boolean;
  canModify: () => boolean;
  canDelete: () => boolean;
  clearError: () => void;
}

export const useAdminStore = create<AdminState>((set, get) => ({
  admin: null, isLoading: true, isAuthenticated: false, error: null,
  stats: null, tenants: [], merchants: [], staff: [],
  tenantsTotal: 0, merchantsTotal: 0,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const result = await adminFetch('/auth/login', { method: 'POST', body: { email, password } });
      localStorage.setItem('saas_admin_token', result.data.tokens.accessToken);
      localStorage.setItem('saas_admin_refresh', result.data.tokens.refreshToken);
      setCookie(result.data.tokens.accessToken);
      set({ admin: result.data.admin, isAuthenticated: true, isLoading: false });
      return true;
    } catch (err) {
      set({ isLoading: false, error: (err as ApiError).message });
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('saas_admin_token');
    localStorage.removeItem('saas_admin_refresh');
    clearCookie();
    set({ admin: null, isAuthenticated: false, isLoading: false });
  },

  fetchProfile: async () => {
    if (typeof window === 'undefined' || !localStorage.getItem('saas_admin_token')) {
      set({ isLoading: false, isAuthenticated: false }); return;
    }
    try {
      const result = await adminFetch('/auth/me');
      set({ admin: result.data.admin, isAuthenticated: true, isLoading: false });
    } catch {
      localStorage.removeItem('saas_admin_token');
      clearCookie();
      set({ admin: null, isAuthenticated: false, isLoading: false });
    }
  },

  fetchStats: async () => {
    try { const r = await adminFetch('/stats'); set({ stats: r.data }); } catch (e) { console.error(e); }
  },

  fetchTenants: async (params = {}) => {
    set({ isLoading: true });
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
      const r = await adminFetch(`/tenants?${qs}`);
      set({ tenants: r.data, tenantsTotal: r.pagination?.total || 0, isLoading: false });
    } catch (err) { set({ isLoading: false, error: (err as ApiError).message }); }
  },

  fetchMerchants: async (params = {}) => {
    set({ isLoading: true });
    try {
      const qs = new URLSearchParams();
      Object.entries(params).forEach(([k, v]) => { if (v) qs.set(k, String(v)); });
      const r = await adminFetch(`/merchants?${qs}`);
      set({ merchants: r.data, merchantsTotal: r.pagination?.total || 0, isLoading: false });
    } catch (err) { set({ isLoading: false, error: (err as ApiError).message }); }
  },

  fetchStaff: async () => {
    try { const r = await adminFetch('/staff'); set({ staff: r.data }); } catch (e) { console.error(e); }
  },

  addStaff: async (data) => {
    set({ error: null });
    try { await adminFetch('/staff', { method: 'POST', body: data }); get().fetchStaff(); return true; }
    catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  updateStaffRole: async (id, role) => {
    try { await adminFetch(`/staff/${id}/role`, { method: 'PUT', body: { role } });
      set((s) => ({ staff: s.staff.map(m => m.id === id ? { ...m, role: role as PlatformRole } : m) })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  updateStaffStatus: async (id, status) => {
    try { await adminFetch(`/staff/${id}/status`, { method: 'PUT', body: { status } });
      set((s) => ({ staff: s.staff.map(m => m.id === id ? { ...m, status } : m) })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  deleteStaffMember: async (id) => {
    try { await adminFetch(`/staff/${id}`, { method: 'DELETE' });
      set((s) => ({ staff: s.staff.filter(m => m.id !== id) })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  updateTenantStatus: async (id, status) => {
    try { await adminFetch(`/tenants/${id}/status`, { method: 'PUT', body: { status } });
      set((s) => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, status } : t) })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  updateTenantPlan: async (id, plan) => {
    try { await adminFetch(`/tenants/${id}/plan`, { method: 'PUT', body: { plan } });
      set((s) => ({ tenants: s.tenants.map(t => t.id === id ? { ...t, plan } : t) })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  deleteTenant: async (id) => {
    try { await adminFetch(`/tenants/${id}`, { method: 'DELETE' });
      set((s) => ({ tenants: s.tenants.filter(t => t.id !== id), tenantsTotal: s.tenantsTotal - 1 })); return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  impersonate: async (merchantId) => {
    try {
      const result = await adminFetch(`/impersonate/${merchantId}`, { method: 'POST' });
      const { token, merchant, tenant, impersonatedBy } = result.data;

      // Save merchant token (same keys the merchant auth uses)
      localStorage.setItem('saas_access_token', token);
      document.cookie = `saas_access_token=${token}; path=/; max-age=7200; SameSite=Strict`;

      // Save impersonation info for the banner
      localStorage.setItem('saas_impersonation', JSON.stringify({
        adminEmail: impersonatedBy.email,
        adminRole: impersonatedBy.role,
        merchantName: merchant.name,
        tenantName: tenant.name,
      }));

      return true;
    } catch (err) { set({ error: (err as ApiError).message }); return false; }
  },

  // ═══ Permission helpers ═══
  hasAccess: (section) => {
    const admin = get().admin;
    if (!admin) return false;
    const cfg = ROLE_CONFIG[admin.role];
    return cfg?.nav.includes(section) || false;
  },

  canModify: () => {
    const role = get().admin?.role;
    return role === 'founder' || role === 'director';
  },

  canDelete: () => get().admin?.role === 'founder',

  clearError: () => set({ error: null }),
}));
