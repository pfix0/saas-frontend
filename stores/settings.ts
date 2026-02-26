/**
 * ساس — Settings Store (Zustand)
 * محادثة ٨: إعدادات المتجر
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

// ═══ Types ═══

export interface StoreInfo {
  id: string;
  name: string;
  slug: string;
  logo_url: string | null;
  description: string | null;
  currency: string;
  language: string;
  theme: string;
  status: string;
  created_at: string;
}

export interface PaymentSettings {
  cod_enabled: boolean;
  bank_transfer_enabled: boolean;
  bank_name: string | null;
  bank_account_name: string | null;
  bank_iban: string | null;
  skypay_enabled: boolean;
  skypay_merchant_id: string | null;
  sadad_enabled: boolean;
  sadad_merchant_id: string | null;
}

export interface ShippingSettings {
  pickup_enabled: boolean;
  pickup_address: string | null;
  aramex_enabled: boolean;
  aramex_cost: number;
  dhl_enabled: boolean;
  dhl_cost: number;
  free_shipping_enabled: boolean;
  free_shipping_min: number;
  delivery_notes: string | null;
}

export interface NotificationSettings {
  email_new_order: boolean;
  email_order_status: boolean;
  email_low_stock: boolean;
  low_stock_threshold: number;
  whatsapp_enabled: boolean;
  whatsapp_number: string | null;
}

export interface SocialSettings {
  instagram: string | null;
  twitter: string | null;
  snapchat: string | null;
  tiktok: string | null;
  whatsapp: string | null;
  phone: string | null;
}

export interface CheckoutSettings {
  guest_checkout: boolean;
  require_address: boolean;
  require_email: boolean;
  order_prefix: string;
  thank_you_message: string | null;
  terms_url: string | null;
}

interface SettingsState {
  store: StoreInfo | null;
  payment: PaymentSettings;
  shipping: ShippingSettings;
  notifications: NotificationSettings;
  social: SocialSettings;
  checkout: CheckoutSettings;
  isLoading: boolean;
  isSaving: boolean;

  fetchSettings: () => Promise<void>;
  updateStore: (data: Partial<StoreInfo>) => Promise<void>;
  updatePayment: (data: Partial<PaymentSettings>) => Promise<void>;
  updateShipping: (data: Partial<ShippingSettings>) => Promise<void>;
  updateNotifications: (data: Partial<NotificationSettings>) => Promise<void>;
  updateSocial: (data: Partial<SocialSettings>) => Promise<void>;
  updateCheckout: (data: Partial<CheckoutSettings>) => Promise<void>;
}

const defaultPayment: PaymentSettings = {
  cod_enabled: true,
  bank_transfer_enabled: false,
  bank_name: null,
  bank_account_name: null,
  bank_iban: null,
  skypay_enabled: false,
  skypay_merchant_id: null,
  sadad_enabled: false,
  sadad_merchant_id: null,
};

const defaultShipping: ShippingSettings = {
  pickup_enabled: true,
  pickup_address: null,
  aramex_enabled: false,
  aramex_cost: 25,
  dhl_enabled: false,
  dhl_cost: 35,
  free_shipping_enabled: false,
  free_shipping_min: 200,
  delivery_notes: null,
};

const defaultNotifications: NotificationSettings = {
  email_new_order: true,
  email_order_status: true,
  email_low_stock: false,
  low_stock_threshold: 5,
  whatsapp_enabled: false,
  whatsapp_number: null,
};

const defaultSocial: SocialSettings = {
  instagram: null,
  twitter: null,
  snapchat: null,
  tiktok: null,
  whatsapp: null,
  phone: null,
};

const defaultCheckout: CheckoutSettings = {
  guest_checkout: true,
  require_address: true,
  require_email: false,
  order_prefix: 'SAS',
  thank_you_message: null,
  terms_url: null,
};

export const useSettingsStore = create<SettingsState>((set) => ({
  store: null,
  payment: defaultPayment,
  shipping: defaultShipping,
  notifications: defaultNotifications,
  social: defaultSocial,
  checkout: defaultCheckout,
  isLoading: false,
  isSaving: false,

  fetchSettings: async () => {
    set({ isLoading: true });
    try {
      const res = await api.get('/api/settings');
      const { store, settings } = res.data;
      set({
        store,
        payment: settings.payment || defaultPayment,
        shipping: settings.shipping || defaultShipping,
        notifications: settings.notifications || defaultNotifications,
        social: settings.social || defaultSocial,
        checkout: settings.checkout || defaultCheckout,
        isLoading: false,
      });
    } catch {
      set({ isLoading: false });
    }
  },

  updateStore: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/store', data);
      set({ store: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },

  updatePayment: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/payment', data);
      set({ payment: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },

  updateShipping: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/shipping', data);
      set({ shipping: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },

  updateNotifications: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/notifications', data);
      set({ notifications: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },

  updateSocial: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/social', data);
      set({ social: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },

  updateCheckout: async (data) => {
    set({ isSaving: true });
    try {
      const res = await api.put('/api/settings/checkout', data);
      set({ checkout: res.data, isSaving: false });
    } catch {
      set({ isSaving: false });
      throw new Error('فشل الحفظ');
    }
  },
}));
