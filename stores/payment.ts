/**
 * ساس — Payment Store
 * محادثة ١٠: إدارة حالة الدفع الإلكتروني
 * SkipCash + SADAD integration
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

export type PaymentGateway = 'skipcash' | 'sadad' | 'cod' | 'bank_transfer';
export type PaymentStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'expired' | 'refunded';

export interface PaymentSession {
  id: string;
  order_id: string;
  order_number: string;
  gateway: PaymentGateway;
  amount: number;
  currency: string;
  status: PaymentStatus;
  redirect_url?: string;
  gateway_ref?: string;
  created_at: string;
  expires_at?: string;
}

export interface GatewayConfig {
  skipcash: {
    enabled: boolean;
    merchant_id: string;
    api_key: string;
    secret_key: string;
    sandbox: boolean;
  };
  sadad: {
    enabled: boolean;
    merchant_id: string;
    terminal_id: string;
    secret_key: string;
    sandbox: boolean;
  };
  cod: {
    enabled: boolean;
    max_amount: number;
  };
  bank_transfer: {
    enabled: boolean;
    bank_name: string;
    account_name: string;
    iban: string;
    swift: string;
    instructions: string;
  };
}

interface PaymentState {
  session: PaymentSession | null;
  loading: boolean;
  error: string;
  gatewayConfig: GatewayConfig | null;

  // Storefront: Initiate payment
  initiatePayment: (storeSlug: string, orderId: string, gateway: PaymentGateway) => Promise<PaymentSession | null>;

  // Storefront: Verify payment after callback
  verifyPayment: (storeSlug: string, sessionId: string, gatewayData: Record<string, string>) => Promise<boolean>;

  // Storefront: Check payment status
  checkStatus: (storeSlug: string, sessionId: string) => Promise<PaymentStatus>;

  // Dashboard: Load gateway config
  loadGatewayConfig: () => Promise<void>;

  // Dashboard: Save gateway config
  saveGatewayConfig: (config: Partial<GatewayConfig>) => Promise<boolean>;

  // Dashboard: Process refund
  processRefund: (orderId: string, amount?: number) => Promise<boolean>;

  // Reset
  reset: () => void;
}

export const usePaymentStore = create<PaymentState>((set, get) => ({
  session: null,
  loading: false,
  error: '',
  gatewayConfig: null,

  initiatePayment: async (storeSlug, orderId, gateway) => {
    set({ loading: true, error: '' });
    try {
      const res = await fetch(`/api/store/${storeSlug}/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, gateway }),
      });
      const data = await res.json();
      if (data.success) {
        set({ session: data.data, loading: false });
        return data.data;
      }
      set({ error: data.error || 'فشل إنشاء جلسة الدفع', loading: false });
      return null;
    } catch {
      set({ error: 'خطأ في الاتصال', loading: false });
      return null;
    }
  },

  verifyPayment: async (storeSlug, sessionId, gatewayData) => {
    set({ loading: true, error: '' });
    try {
      const res = await fetch(`/api/store/${storeSlug}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ session_id: sessionId, ...gatewayData }),
      });
      const data = await res.json();
      if (data.success) {
        set({ session: data.data, loading: false });
        return true;
      }
      set({ error: data.error || 'فشل التحقق من الدفع', loading: false });
      return false;
    } catch {
      set({ error: 'خطأ في التحقق', loading: false });
      return false;
    }
  },

  checkStatus: async (storeSlug, sessionId) => {
    try {
      const res = await fetch(`/api/store/${storeSlug}/payment/status/${sessionId}`);
      const data = await res.json();
      if (data.success) {
        set({ session: data.data });
        return data.data.status;
      }
      return 'pending';
    } catch {
      return 'pending';
    }
  },

  loadGatewayConfig: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/api/settings/payment-gateways');
      set({ gatewayConfig: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  saveGatewayConfig: async (config) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.put('/api/settings/payment-gateways', config);
      if (res.success) {
        set({ gatewayConfig: { ...get().gatewayConfig!, ...config }, loading: false });
        return true;
      }
      set({ error: res.error || 'فشل الحفظ', loading: false });
      return false;
    } catch {
      set({ error: 'خطأ في الحفظ', loading: false });
      return false;
    }
  },

  processRefund: async (orderId, amount) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.post(`/api/orders/${orderId}/refund`, { amount });
      set({ loading: false });
      return res.success;
    } catch {
      set({ error: 'فشل الاسترداد', loading: false });
      return false;
    }
  },

  reset: () => set({ session: null, loading: false, error: '' }),
}));
