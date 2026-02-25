/**
 * ساس — Auth Store (Zustand)
 * Will be fully implemented in Session 2
 */

import { create } from 'zustand';
import type { SafeMerchant, Tenant } from '@/lib/types';

interface AuthState {
  merchant: SafeMerchant | null;
  tenant: Tenant | null;
  isLoading: boolean;
  isAuthenticated: boolean;

  // Actions
  setAuth: (merchant: SafeMerchant, tenant: Tenant) => void;
  clearAuth: () => void;
  setLoading: (loading: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  merchant: null,
  tenant: null,
  isLoading: true,
  isAuthenticated: false,

  setAuth: (merchant, tenant) =>
    set({ merchant, tenant, isAuthenticated: true, isLoading: false }),

  clearAuth: () =>
    set({ merchant: null, tenant: null, isAuthenticated: false, isLoading: false }),

  setLoading: (isLoading) => set({ isLoading }),
}));
