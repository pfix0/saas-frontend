'use client';

/**
 * ساس — صفحة الشحن
 * محادثة ٩
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface ShippingStats {
  by_method: Array<{ method: string; label: string; orders: number; total_cost: number }>;
  by_status: Array<{ status: string; count: number }>;
  pending_shipments: number;
  in_transit: number;
}

const statusLabels: Record<string, { label: string; color: string; icon: string }> = {
  new: { label: 'جديد', color: 'bg-blue-100 text-blue-700', icon: 'fiber_new' },
  confirmed: { label: 'مؤكد', color: 'bg-indigo-100 text-indigo-700', icon: 'check' },
  processing: { label: 'تجهيز', color: 'bg-amber-100 text-amber-700', icon: 'inventory' },
  shipped: { label: 'تم الشحن', color: 'bg-purple-100 text-purple-700', icon: 'local_shipping' },
  delivered: { label: 'تم التوصيل', color: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
  cancelled: { label: 'ملغي', color: 'bg-red-100 text-red-700', icon: 'cancel' },
  returned: { label: 'مرتجع', color: 'bg-grey-100 text-grey-500', icon: 'undo' },
};

const shippingIcons: Record<string, string> = {
  aramex: 'local_shipping',
  dhl: 'flight',
  pickup: 'store',
};

interface ShipmentOrder {
  id: string;
  order_number: string;
  status: string;
  shipping_method: string;
  customer_name: string;
  customer_phone: string;
  total: number;
  shipping_cost: number;
  created_at: string;
}

export default function ShippingPage() {
  const [stats, setStats] = useState<ShippingStats | null>(null);
  const [shipments, setShipments] = useState<ShipmentOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('pending');
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });

  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    loadShipments();
  }, [statusFilter]);

  const loadStats = async () => {
    try {
      const res = await api.get('/api/finance/shipping-stats');
      setStats(res.data);
    } catch {}
    setLoading(false);
  };

  const loadShipments = async () => {
    try {
      // Filter orders that need shipping
      const statusMap: Record<string, string> = {
        pending: 'confirmed,processing',
        shipped: 'shipped',
        delivered: 'delivered',
        all: '',
      };
      const statuses = statusMap[statusFilter] || '';
      const params = new URLSearchParams({ limit: '20' });
      if (statuses) params.set('status', statuses);

      const res = await api.get(`/api/orders?${params}`);
      // Filter out pickup orders for shipping tab
      const filtered = statusFilter === 'all'
        ? res.data
        : res.data.filter((o: any) => o.shipping_method !== 'pickup');
      setShipments(filtered);
      setPagination(res.pagination || { total: filtered.length, page: 1, pages: 1 });
    } catch {}
  };

  const fmt = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-grey-900">الشحن</h1>
          <p className="text-sm text-grey-500 mt-0.5">إدارة الشحنات والتوصيل</p>
        </div>
        <Link href="/dashboard/settings" className="flex items-center gap-1 px-3 py-2 rounded-lg bg-grey-50 text-xs font-bold text-grey-600 hover:bg-grey-100">
          <span className="material-icons-outlined text-sm">settings</span>
          إعدادات الشحن
        </Link>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-amber-500 text-lg">inventory</span>
              <span className="text-xs text-grey-500">بانتظار الشحن</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{stats.pending_shipments}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-purple-500 text-lg">local_shipping</span>
              <span className="text-xs text-grey-500">في الطريق</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{stats.in_transit}</p>
          </div>
          {stats.by_method.filter(m => m.method !== 'pickup').map((m) => (
            <div key={m.method} className="bg-white rounded-xl p-4 border border-grey-100">
              <div className="flex items-center gap-2 mb-2">
                <span className="material-icons-outlined text-brand-800 text-lg">{shippingIcons[m.method] || 'local_shipping'}</span>
                <span className="text-xs text-grey-500">{m.label}</span>
              </div>
              <p className="text-2xl font-black text-grey-900">{m.orders} <span className="text-sm font-normal text-grey-400">طلب</span></p>
              <p className="text-xs text-grey-400 mt-0.5">تكلفة: {fmt(m.total_cost)} ر.ق</p>
            </div>
          ))}
        </div>
      )}

      {/* Shipping Methods Summary */}
      {stats && stats.by_method.length > 0 && (
        <div className="bg-white rounded-xl border border-grey-100 p-5">
          <h2 className="text-sm font-bold text-grey-900 mb-4">توزيع الشحنات</h2>
          <div className="space-y-3">
            {stats.by_method.map((m) => {
              const totalOrders = stats.by_method.reduce((sum, x) => sum + x.orders, 0);
              const pct = totalOrders > 0 ? ((m.orders / totalOrders) * 100).toFixed(0) : '0';
              return (
                <div key={m.method} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-grey-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined text-grey-600 text-lg">{shippingIcons[m.method] || 'local_shipping'}</span>
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-grey-800">{m.label}</span>
                      <span className="text-sm text-grey-600">{m.orders} طلب</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-grey-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-800 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-grey-400 w-10 text-left">{pct}%</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Shipments List */}
      <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
        <div className="p-4 border-b border-grey-50 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-grey-900">الشحنات</h2>
          <div className="flex gap-1">
            {[
              { key: 'pending', label: 'بانتظار الشحن' },
              { key: 'shipped', label: 'تم الشحن' },
              { key: 'delivered', label: 'تم التوصيل' },
              { key: 'all', label: 'الكل' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setStatusFilter(f.key)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  statusFilter === f.key
                    ? 'bg-brand-800 text-white'
                    : 'bg-grey-50 text-grey-500 hover:bg-grey-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {shipments.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-3xl text-grey-200">local_shipping</span>
            <p className="text-sm text-grey-400 mt-2">لا توجد شحنات</p>
          </div>
        ) : (
          <div className="divide-y divide-grey-50">
            {shipments.map((order) => {
              const st = statusLabels[order.status] || statusLabels.new;
              return (
                <Link key={order.id} href={`/dashboard/orders/${order.id}`} className="block p-4 hover:bg-grey-25 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-brand-800">{order.order_number}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-bold ${st.color}`}>{st.label}</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="material-icons-outlined text-sm text-grey-400">{shippingIcons[order.shipping_method] || 'local_shipping'}</span>
                      <span className="text-xs text-grey-500">
                        {order.shipping_method === 'aramex' ? 'أرامكس' : order.shipping_method === 'dhl' ? 'DHL' : 'استلام'}
                      </span>
                    </div>
                  </div>
                  <div className="flex items-center justify-between text-xs text-grey-500">
                    <span>{order.customer_name} • {order.customer_phone}</span>
                    <span>{new Date(order.created_at).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric' })}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
