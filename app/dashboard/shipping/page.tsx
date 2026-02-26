'use client';

/**
 * ساس — Shipping Management Dashboard
 * محادثة ١١: إدارة الشحنات الكاملة
 * قائمة الشحنات + إنشاء شحنة + تتبع + طباعة بوليصة
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface Shipment {
  id: string;
  order_id: string;
  order_number: string;
  carrier: string;
  tracking_number: string;
  awb_number?: string;
  status: string;
  label_url?: string;
  estimated_delivery?: string;
  actual_delivery?: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
  city: string;
  area: string;
}

interface TrackingEvent {
  timestamp: string;
  status: string;
  description: string;
  location: string;
}

const statusMap: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'قيد التجهيز', color: 'bg-grey-100 text-grey-600', icon: 'schedule' },
  picked_up: { label: 'تم الاستلام', color: 'bg-blue-100 text-blue-700', icon: 'inventory_2' },
  in_transit: { label: 'في الطريق', color: 'bg-amber-100 text-amber-700', icon: 'local_shipping' },
  out_for_delivery: { label: 'خارج للتوصيل', color: 'bg-violet-100 text-violet-700', icon: 'delivery_dining' },
  delivered: { label: 'تم التوصيل', color: 'bg-emerald-100 text-emerald-700', icon: 'check_circle' },
  returned: { label: 'مرتجع', color: 'bg-red-100 text-red-700', icon: 'keyboard_return' },
  failed: { label: 'فشل', color: 'bg-red-100 text-red-700', icon: 'error' },
};

const carrierLabels: Record<string, { label: string; color: string }> = {
  aramex: { label: 'Aramex', color: 'bg-orange-100 text-orange-700' },
  dhl: { label: 'DHL', color: 'bg-yellow-100 text-yellow-700' },
  local: { label: 'محلي', color: 'bg-emerald-100 text-emerald-700' },
  pickup: { label: 'استلام', color: 'bg-blue-100 text-blue-700' },
};

export default function ShippingDashboardPage() {
  const [shipments, setShipments] = useState<Shipment[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: 'all', carrier: 'all', page: 1 });
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });
  const [selectedShipment, setSelectedShipment] = useState<Shipment | null>(null);
  const [trackingEvents, setTrackingEvents] = useState<TrackingEvent[]>([]);
  const [trackingLoading, setTrackingLoading] = useState(false);
  const [toast, setToast] = useState('');
  const [stats, setStats] = useState({ total: 0, pending: 0, in_transit: 0, delivered: 0, returned: 0 });

  useEffect(() => { loadShipments(); }, [filter]);
  useEffect(() => { loadStats(); }, []);

  const loadShipments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(filter.page), limit: '15' });
      if (filter.status !== 'all') params.set('status', filter.status);
      if (filter.carrier !== 'all') params.set('carrier', filter.carrier);
      const res = await api.get(`/api/shipping/shipments?${params}`);
      setShipments(res.data || []);
      setPagination(res.pagination || { total: 0, page: 1, pages: 0 });
    } catch {}
    setLoading(false);
  };

  const loadStats = async () => {
    try {
      const res = await api.get('/api/shipping/stats');
      if (res.data) setStats(res.data);
    } catch {}
  };

  const loadTracking = async (shipment: Shipment) => {
    setSelectedShipment(shipment);
    setTrackingLoading(true);
    setTrackingEvents([]);
    try {
      const res = await api.get(`/api/shipping/${shipment.id}/tracking`);
      setTrackingEvents(res.data?.events || []);
    } catch {}
    setTrackingLoading(false);
  };

  const printLabel = async (shipmentId: string) => {
    try {
      const res = await api.get(`/api/shipping/${shipmentId}/label`);
      if (res.data?.url) window.open(res.data.url, '_blank');
      else showToast('لا تتوفر بوليصة شحن');
    } catch { showToast('خطأ في تحميل البوليصة'); }
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—';

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-grey-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xl z-50 animate-slide-down">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-900">إدارة الشحن</h1>
          <p className="text-sm text-grey-500 mt-0.5">تتبع وإدارة شحنات متجرك</p>
        </div>
        <Link href="/dashboard/settings/shipping-carriers"
          className="px-4 py-2.5 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center gap-2">
          <span className="material-icons-outlined text-sm">settings</span>
          إعدادات الشحن
        </Link>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {[
          { icon: 'inventory_2', color: 'text-grey-500', label: 'الكل', value: stats.total },
          { icon: 'schedule', color: 'text-amber-500', label: 'قيد التجهيز', value: stats.pending },
          { icon: 'local_shipping', color: 'text-blue-500', label: 'في الطريق', value: stats.in_transit },
          { icon: 'check_circle', color: 'text-emerald-500', label: 'تم التوصيل', value: stats.delivered },
          { icon: 'keyboard_return', color: 'text-red-500', label: 'مرتجع', value: stats.returned },
        ].map((s, i) => (
          <div key={i} className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className={`material-icons-outlined text-lg ${s.color}`}>{s.icon}</span>
              <span className="text-xs text-grey-500">{s.label}</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{s.value.toLocaleString('ar-QA')}</p>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex items-center gap-2 flex-wrap">
        <div className="flex gap-1 bg-grey-50 rounded-lg p-1">
          {[
            { key: 'all', label: 'الكل' }, { key: 'pending', label: 'قيد التجهيز' },
            { key: 'in_transit', label: 'في الطريق' }, { key: 'delivered', label: 'تم التوصيل' },
            { key: 'returned', label: 'مرتجع' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter({ ...filter, status: f.key, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter.status === f.key ? 'bg-brand-800 text-white' : 'text-grey-500 hover:bg-grey-100'
              }`}>{f.label}</button>
          ))}
        </div>
        <div className="flex gap-1 bg-grey-50 rounded-lg p-1">
          {[
            { key: 'all', label: 'كل الشركات' }, { key: 'aramex', label: 'Aramex' },
            { key: 'dhl', label: 'DHL' }, { key: 'local', label: 'محلي' },
          ].map((f) => (
            <button key={f.key} onClick={() => setFilter({ ...filter, carrier: f.key, page: 1 })}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filter.carrier === f.key ? 'bg-grey-700 text-white' : 'text-grey-500 hover:bg-grey-100'
              }`}>{f.label}</button>
          ))}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Shipments List */}
        <div className="lg:col-span-2">
          <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
            {loading ? (
              <div className="p-12 text-center">
                <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
              </div>
            ) : shipments.length === 0 ? (
              <div className="p-12 text-center">
                <span className="material-icons-outlined text-4xl text-grey-200">local_shipping</span>
                <p className="text-sm text-grey-400 mt-2">لا توجد شحنات</p>
                <p className="text-xs text-grey-300 mt-1">ستظهر الشحنات عند إنشائها من صفحة الطلبات</p>
              </div>
            ) : (
              <div className="divide-y divide-grey-50">
                {shipments.map((sh) => {
                  const st = statusMap[sh.status] || statusMap.pending;
                  const cr = carrierLabels[sh.carrier] || { label: sh.carrier, color: 'bg-grey-100 text-grey-600' };
                  const isSelected = selectedShipment?.id === sh.id;

                  return (
                    <button key={sh.id} onClick={() => loadTracking(sh)}
                      className={`w-full p-4 text-right hover:bg-grey-25 transition-all ${isSelected ? 'bg-brand-50/30 border-r-2 border-brand-800' : ''}`}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Link href={`/dashboard/orders/${sh.order_id}`}
                            className="text-sm font-bold text-brand-800 hover:underline" onClick={e => e.stopPropagation()}>
                            {sh.order_number}
                          </Link>
                          <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-bold ${cr.color}`}>{cr.label}</span>
                        </div>
                        <span className={`px-2 py-1 rounded-lg text-xs font-bold flex items-center gap-1 ${st.color}`}>
                          <span className="material-icons-outlined text-[14px]">{st.icon}</span>
                          {st.label}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-grey-600">{sh.customer_name}</span>
                        <span className="text-xs text-grey-400">{sh.city}{sh.area ? `، ${sh.area}` : ''}</span>
                      </div>
                      {sh.tracking_number && (
                        <div className="flex items-center justify-between mt-1.5">
                          <span className="text-xs text-grey-400 font-mono">{sh.tracking_number}</span>
                          <span className="text-xs text-grey-300">{fmtDate(sh.created_at)}</span>
                        </div>
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {pagination.pages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-grey-50">
                <button disabled={filter.page <= 1} onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
                  className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30">
                  <span className="material-icons-outlined text-sm">chevron_right</span>
                </button>
                <span className="text-xs text-grey-500 px-3">{filter.page} / {pagination.pages}</span>
                <button disabled={filter.page >= pagination.pages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
                  className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30">
                  <span className="material-icons-outlined text-sm">chevron_left</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Tracking Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl border border-grey-100 sticky top-20 overflow-hidden">
            {!selectedShipment ? (
              <div className="p-8 text-center">
                <span className="material-icons-outlined text-4xl text-grey-200">local_shipping</span>
                <p className="text-sm text-grey-400 mt-2">اختر شحنة لعرض التتبع</p>
              </div>
            ) : (
              <div>
                <div className="p-4 bg-grey-50 border-b border-grey-100">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="text-sm font-bold text-grey-900">تتبع الشحنة</h3>
                    <button onClick={() => setSelectedShipment(null)} className="p-1 rounded-lg hover:bg-grey-200">
                      <span className="material-icons-outlined text-sm text-grey-400">close</span>
                    </button>
                  </div>
                  <p className="text-xs text-grey-500">{selectedShipment.order_number}</p>
                  {selectedShipment.tracking_number && (
                    <p className="text-xs text-grey-400 font-mono mt-0.5">{selectedShipment.tracking_number}</p>
                  )}
                </div>

                <div className="p-4">
                  {(() => {
                    const st = statusMap[selectedShipment.status] || statusMap.pending;
                    return (
                      <div className={`flex items-center gap-2 px-3 py-2 rounded-xl mb-4 ${st.color}`}>
                        <span className="material-icons-outlined text-lg">{st.icon}</span>
                        <span className="text-sm font-bold">{st.label}</span>
                      </div>
                    );
                  })()}

                  <div className="space-y-2 mb-4">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-grey-400">العميل</span>
                      <span className="text-grey-700 font-semibold">{selectedShipment.customer_name}</span>
                    </div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-grey-400">الموقع</span>
                      <span className="text-grey-700">{selectedShipment.city}{selectedShipment.area ? `، ${selectedShipment.area}` : ''}</span>
                    </div>
                    {selectedShipment.estimated_delivery && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-grey-400">التوصيل المتوقع</span>
                        <span className="text-grey-700">{fmtDate(selectedShipment.estimated_delivery)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex gap-2 mb-4">
                    <button onClick={() => printLabel(selectedShipment.id)}
                      className="flex-1 py-2 rounded-lg bg-brand-50 text-brand-800 text-xs font-bold hover:bg-brand-100 transition-all flex items-center justify-center gap-1">
                      <span className="material-icons-outlined text-sm">print</span>
                      بوليصة
                    </button>
                    <a href={`tel:${selectedShipment.customer_phone}`}
                      className="flex-1 py-2 rounded-lg bg-grey-50 text-grey-600 text-xs font-bold hover:bg-grey-100 transition-all flex items-center justify-center gap-1">
                      <span className="material-icons-outlined text-sm">call</span>
                      اتصال
                    </a>
                  </div>

                  <h4 className="text-xs font-bold text-grey-700 mb-3">سجل التتبع</h4>
                  {trackingLoading ? (
                    <div className="text-center py-6">
                      <span className="material-icons-outlined text-xl text-grey-300 animate-spin">sync</span>
                    </div>
                  ) : trackingEvents.length === 0 ? (
                    <div className="text-center py-6">
                      <p className="text-xs text-grey-400">لا توجد أحداث تتبع بعد</p>
                    </div>
                  ) : (
                    <div className="relative pr-6">
                      <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-grey-100" />
                      <div className="space-y-4">
                        {trackingEvents.map((ev, i) => (
                          <div key={i} className="relative">
                            <div className={`absolute right-[-17px] w-4 h-4 rounded-full border-2 border-white shadow-sm
                              ${i === 0 ? 'bg-brand-800' : 'bg-grey-300'}`} />
                            <div>
                              <p className={`text-xs font-bold ${i === 0 ? 'text-grey-900' : 'text-grey-600'}`}>{ev.description}</p>
                              <div className="flex items-center gap-2 mt-0.5">
                                {ev.location && <span className="text-[0.65rem] text-grey-400">{ev.location}</span>}
                                <span className="text-[0.65rem] text-grey-300">{fmtDate(ev.timestamp)}</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <style jsx global>{`
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}
