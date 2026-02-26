/**
 * ساس — Auth Store (Zustand)
 * المحادثة ٢: نظام المصادقة الكامل
 * 
 * يستخدم api client الموجود للتواصل مع Railway backend
 */

import { create } from 'zustand';
import { api, ApiError } from '@/lib/api';
import type { SafeMerchant, Tenant, AuthTokens } from '@/lib/types';

// ═══ Types ═══
interface RegisterData {
  name: string;
  email: string;
  phone: string;
  password: string;
  storeName: string;
}

interface AuthState {
  merchant: SafeMerchant | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  error: string | null;
  fieldErrors: Record<string, string>;

  // Actions
  register: (data: RegisterData) => Promise<boolean>;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  fetchProfile: () => Promise<void>;
  clearError: () => void;
  setLoading: (loading: boolean) => void;
}

// ═══ Cookie Helper ═══
function setTokenCookie(token: string) {
  if (typeof document === 'undefined') return;
  document.cookie = `saas_access_token=${token}; path=/; max-age=${2 * 60 * 60}; SameSite=Strict`;
}

function clearTokenCookie() {
  if (typeof document === 'undefined') return;
  document.cookie = 'saas_access_token=; path=/; max-age=0';
}

// ═══ Store ═══
export const useAuthStore = create<AuthState>((set, get) => ({
  merchant: null,
  tenant: null,
  isLoading: true,
  isAuthenticated: false,
  error: null,
  fieldErrors: {},

  // ═══ تسجيل حساب جديد ═══
  register: async (data) => {
    set({ isLoading: true, error: null, fieldErrors: {} });

    try {
      const result = await api.post('/api/auth/register', {
        name: data.name,
        email: data.email,
        phone: data.phone,
        password: data.password,
        store_name: data.storeName,
      });

      // حفظ التوكنات
      api.setAuth(result.data.tokens.accessToken, result.data.tokens.refreshToken);
      setTokenCookie(result.data.tokens.accessToken);

      set({
        merchant: result.data.merchant,
        tenant: result.data.tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
        fieldErrors: {},
      });

      return true;
    } catch (err) {
      const error = err as ApiError;
      set({
        isLoading: false,
        error: error.message || 'فشل التسجيل',
        fieldErrors: (error as any).errors || {},
      });
      return false;
    }
  },

  // ═══ تسجيل دخول ═══
  login: async (email, password) => {
    set({ isLoading: true, error: null, fieldErrors: {} });

    try {
      const result = await api.post('/api/auth/login', { email, password });

      // حفظ التوكنات
      api.setAuth(result.data.tokens.accessToken, result.data.tokens.refreshToken);
      setTokenCookie(result.data.tokens.accessToken);

      set({
        merchant: result.data.merchant,
        tenant: result.data.tenant,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      });

      return true;
    } catch (err) {
      const error = err as ApiError;
      set({
        isLoading: false,
        error: error.message || 'البريد الإلكتروني أو كلمة المرور غير صحيحة',
      });
      return false;
    }
  },

  // ═══ تسجيل خروج ═══
  logout: () => {
    api.clearAuth();
    clearTokenCookie();
    set({
      merchant: null,
      tenant: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      fieldErrors: {},
    });
  },

  // ═══ جلب بيانات المستخدم ═══
  fetchProfile: async () => {
    // تأكد من وجود توكن
    if (typeof window === 'undefined') {
      set({ isLoading: false });
      return;
    }

    const token = localStorage.getItem('saas_access_token');
    if (!token) {
      set({ isLoading: false, isAuthenticated: false });
      return;
    }

    try {
      const result = await api.get('/api/auth/me');

      set({
        merchant: result.data.merchant,
        tenant: result.data.tenant,
        isAuthenticated: true,
        isLoading: false,
      });
    } catch (err) {
      // التوكن منتهي أو غير صالح
      api.clearAuth();
      clearTokenCookie();
      set({
        merchant: null,
        tenant: null,
        isAuthenticated: false,
        isLoading: false,
      });
    }
  },

  // ═══ مسح الخطأ ═══
  clearError: () => set({ error: null, fieldErrors: {} }),

  // ═══ تحميل ═══
  setLoading: (isLoading) => set({ isLoading }),
}));
