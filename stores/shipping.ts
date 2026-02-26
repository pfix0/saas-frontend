/**
 * ساس — Shipping Store
 * محادثة ١١: إدارة الشحن — Aramex + DHL
 */

import { create } from 'zustand';
import { api } from '@/lib/api';

export type ShippingCarrier = 'aramex' | 'dhl' | 'local' | 'pickup';
export type ShipmentStatus = 'pending' | 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'returned' | 'failed';

export interface ShipmentRate {
  carrier: ShippingCarrier;
  service: string;
  label: string;
  cost: number;
  currency: string;
  estimated_days: number;
  estimated_delivery: string;
}

export interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location: string;
}

export interface Shipment {
  id: string;
  order_id: string;
  order_number: string;
  carrier: ShippingCarrier;
  tracking_number: string;
  awb_number?: string;
  status: ShipmentStatus;
  label_url?: string;
  events: TrackingEvent[];
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  area: string;
}

export interface CarrierConfig {
  aramex: {
    enabled: boolean;
    username: string;
    password: string;
    account_number: string;
    account_pin: string;
    entity: string;
    country_code: string;
    sandbox: boolean;
  };
  dhl: {
    enabled: boolean;
    api_key: string;
    api_secret: string;
    account_number: string;
    sandbox: boolean;
  };
  local: {
    enabled: boolean;
    name: string;
    cost: number;
    estimated_days: number;
  };
  pickup: {
    enabled: boolean;
    address: string;
    hours: string;
  };
}

interface ShippingState {
  shipments: Shipment[];
  rates: ShipmentRate[];
  carrierConfig: CarrierConfig | null;
  loading: boolean;
  error: string;
  pagination: { total: number; page: number; pages: number };

  // Dashboard: List shipments
  loadShipments: (filters?: Record<string, string>) => Promise<void>;

  // Dashboard: Create shipment
  createShipment: (orderId: string, carrier: ShippingCarrier) => Promise<Shipment | null>;

  // Dashboard: Get tracking
  getTracking: (shipmentId: string) => Promise<TrackingEvent[]>;

  // Dashboard: Print label
  printLabel: (shipmentId: string) => Promise<string | null>;

  // Dashboard: Cancel shipment
  cancelShipment: (shipmentId: string) => Promise<boolean>;

  // Storefront: Get shipping rates for checkout
  getRates: (storeSlug: string, city: string, items: any[]) => Promise<ShipmentRate[]>;

  // Storefront: Track order
  trackOrder: (storeSlug: string, trackingNumber: string) => Promise<TrackingEvent[]>;

  // Config: Load
  loadCarrierConfig: () => Promise<void>;

  // Config: Save
  saveCarrierConfig: (config: Partial<CarrierConfig>) => Promise<boolean>;
}

export const useShippingStore = create<ShippingState>((set, get) => ({
  shipments: [],
  rates: [],
  carrierConfig: null,
  loading: false,
  error: '',
  pagination: { total: 0, page: 1, pages: 0 },

  loadShipments: async (filters = {}) => {
    set({ loading: true });
    try {
      const params = new URLSearchParams({ limit: '15', ...filters });
      const res = await api.get(`/api/shipping/shipments?${params}`);
      set({
        shipments: res.data || [],
        pagination: res.pagination || { total: 0, page: 1, pages: 0 },
        loading: false,
      });
    } catch {
      set({ loading: false });
    }
  },

  createShipment: async (orderId, carrier) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.post('/api/shipping/create', { order_id: orderId, carrier });
      set({ loading: false });
      if (res.success) return res.data;
      set({ error: res.error || 'فشل إنشاء الشحنة' });
      return null;
    } catch {
      set({ error: 'خطأ في الاتصال', loading: false });
      return null;
    }
  },

  getTracking: async (shipmentId) => {
    try {
      const res = await api.get(`/api/shipping/${shipmentId}/tracking`);
      return res.data?.events || [];
    } catch {
      return [];
    }
  },

  printLabel: async (shipmentId) => {
    try {
      const res = await api.get(`/api/shipping/${shipmentId}/label`);
      return res.data?.url || null;
    } catch {
      return null;
    }
  },

  cancelShipment: async (shipmentId) => {
    set({ loading: true });
    try {
      const res = await api.post(`/api/shipping/${shipmentId}/cancel`, {});
      set({ loading: false });
      return res.success;
    } catch {
      set({ loading: false });
      return false;
    }
  },

  getRates: async (storeSlug, city, items) => {
    try {
      const res = await fetch(`/api/store/${storeSlug}/shipping/rates`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ city, items }),
      });
      const data = await res.json();
      if (data.success) {
        set({ rates: data.data });
        return data.data;
      }
      return [];
    } catch {
      return [];
    }
  },

  trackOrder: async (storeSlug, trackingNumber) => {
    try {
      const res = await fetch(`/api/store/${storeSlug}/shipping/track/${trackingNumber}`);
      const data = await res.json();
      return data.success ? data.data.events : [];
    } catch {
      return [];
    }
  },

  loadCarrierConfig: async () => {
    set({ loading: true });
    try {
      const res = await api.get('/api/settings/shipping-carriers');
      set({ carrierConfig: res.data, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  saveCarrierConfig: async (config) => {
    set({ loading: true, error: '' });
    try {
      const res = await api.put('/api/settings/shipping-carriers', config);
      set({ loading: false });
      if (res.success) {
        set({ carrierConfig: { ...get().carrierConfig!, ...config } });
        return true;
      }
      set({ error: res.error || 'فشل الحفظ' });
      return false;
    } catch {
      set({ error: 'خطأ في الحفظ', loading: false });
      return false;
    }
  },
}));
