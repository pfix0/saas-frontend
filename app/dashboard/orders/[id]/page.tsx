'use client';

/**
 * ساس — Order Detail Page
 * محادثة ٦: تفاصيل الطلب + تحديث الحالة + فاتورة
 */

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useOrdersStore, type OrderDetail } from '@/stores/orders';
import { useAuthStore } from '@/stores/auth';

const STATUS_MAP: Record<string, { label: string; color: string; icon: string; bg: string }> = {
  new:        { label: 'جديد',         color: 'text-blue-600',    icon: 'fiber_new',         bg: 'bg-blue-50 border-blue-200' },
  confirmed:  { label: 'مؤكد',         color: 'text-indigo-600',  icon: 'check_circle',      bg: 'bg-indigo-50 border-indigo-200' },
  processing: { label: 'قيد التجهيز',  color: 'text-amber-600',   icon: 'inventory',         bg: 'bg-amber-50 border-amber-200' },
  shipped:    { label: 'تم الشحن',     color: 'text-purple-600',  icon: 'local_shipping',    bg: 'bg-purple-50 border-purple-200' },
  delivered:  { label: 'تم التوصيل',   color: 'text-green-600',   icon: 'done_all',          bg: 'bg-green-50 border-green-200' },
  cancelled:  { label: 'ملغي',         color: 'text-red-600',     icon: 'cancel',            bg: 'bg-red-50 border-red-200' },
  returned:   { label: 'مسترجع',       color: 'text-orange-600',  icon: 'assignment_return', bg: 'bg-orange-50 border-orange-200' },
};

const PAYMENT_MAP: Record<string, { label: string; class: string }> = {
  pending:  { label: 'في الانتظار', class: 'text-amber-600 bg-amber-50' },
  paid:     { label: 'مدفوع',      class: 'text-green-600 bg-green-50' },
  failed:   { label: 'فشل',        class: 'text-red-600 bg-red-50' },
  refunded: { label: 'مسترد',      class: 'text-purple-600 bg-purple-50' },
};

const SHIPPING_MAP: Record<string, string> = { aramex: 'أرامكس', dhl: 'DHL', pickup: 'استلام من المتجر' };
const PAY_METHOD_MAP: Record<string, string> = { cod: 'الدفع عند الاستلام', sadad: 'سداد', skipcash: 'سكايب كاش' };

// Status flow (next allowed statuses)
const STATUS_FLOW: Record<string, string[]> = {
  new:        ['confirmed', 'cancelled'],
  confirmed:  ['processing', 'cancelled'],
  processing: ['shipped', 'cancelled'],
  shipped:    ['delivered', 'returned'],
  delivered:  [],
  cancelled:  [],
  returned:   [],
};

export default function OrderDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { tenant } = useAuthStore();
  const { selectedOrder: order, isLoading, isUpdating, fetchOrder, updateStatus, updatePayment, updateNotes } = useOrdersStore();

  const [statusNote, setStatusNote] = useState('');
  const [showStatusModal, setShowStatusModal] = useState(false);
  const [nextStatus, setNextStatus] = useState('');
  const [adminNotes, setAdminNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchOrder(id);
  }, [id]);

  useEffect(() => {
    if (order) setAdminNotes(order.admin_notes || '');
  }, [order?.id]);

  const fmtPrice = (val: number) => Number(val).toLocaleString('ar-QA', { minimumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' });
  const fmtTime = (d: string) => new Date(d).toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' });
  const fmtDateTime = (d: string) => `${fmtDate(d)} — ${fmtTime(d)}`;

  const handleUpdateStatus = async () => {
    if (!nextStatus) return;
    const ok = await updateStatus(id, nextStatus, statusNote || undefined);
    if (ok) {
      setShowStatusModal(false);
      setStatusNote('');
      setNextStatus('');
    }
  };

  const handleSaveNotes = async () => {
    const ok = await updateNotes(id, adminNotes);
    if (ok) {
      setNotesSaved(true);
      setTimeout(() => setNotesSaved(false), 2000);
    }
  };

  const handlePrint = () => {
    window.print();
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-icons-outlined animate-spin text-3xl text-brand-800 mb-3">autorenew</span>
        <p className="text-sm text-grey-400">جارِ تحميل الطلب...</p>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-icons-outlined text-5xl text-grey-200 mb-3">error_outline</span>
        <h2 className="text-lg font-bold text-grey-700 mb-1">الطلب غير موجود</h2>
        <Link href="/dashboard/orders" className="text-brand-800 text-sm font-semibold hover:underline mt-2">
          العودة للطلبات
        </Link>
      </div>
    );
  }

  const st = STATUS_MAP[order.status] || STATUS_MAP.new;
  const pm = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
  const nextStatuses = STATUS_FLOW[order.status] || [];
  const addr = order.shipping_address || {};

  return (
    <div className="animate-fade-in">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/orders" className="p-2 rounded-xl hover:bg-grey-100 transition-colors">
            <span className="material-icons-outlined text-grey-500">arrow_forward</span>
          </Link>
          <div>
            <div className="flex items-center gap-3">
              <h1 className="font-tajawal text-xl font-bold text-grey-900 font-mono" dir="ltr">{order.order_number}</h1>
              <span className={`badge ${STATUS_MAP[order.status]?.bg || ''} ${st.color} border px-3 py-1`}>
                <span className="material-icons-outlined text-xs">{st.icon}</span>
                {st.label}
              </span>
            </div>
            <p className="text-xs text-grey-400 mt-0.5">{fmtDateTime(order.created_at)}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Status Actions */}
          {nextStatuses.map((ns) => {
            const nsInfo = STATUS_MAP[ns];
            const isDanger = ns === 'cancelled' || ns === 'returned';
            return (
              <button
                key={ns}
                onClick={() => { setNextStatus(ns); setShowStatusModal(true); }}
                className={`btn text-xs ${isDanger ? 'btn-ghost text-red-500 hover:bg-red-50' : 'btn-brand'}`}
              >
                <span className="material-icons-outlined text-sm">{nsInfo?.icon}</span>
                {nsInfo?.label}
              </button>
            );
          })}

          <button onClick={handlePrint} className="btn btn-ghost">
            <span className="material-icons-outlined text-sm">print</span>
            <span className="hidden sm:inline">طباعة</span>
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4" ref={printRef}>
        {/* ═══ Right Column (2/3) ═══ */}
        <div className="lg:col-span-2 space-y-4">
          {/* Order Items */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">shopping_bag</span>
              المنتجات ({order.items.length})
            </h2>

            <div className="space-y-3">
              {order.items.map((item) => (
                <div key={item.id} className="flex gap-3">
                  <div className="w-14 h-14 rounded-xl bg-grey-100 overflow-hidden flex-shrink-0">
                    {item.image_url ? (
                      <img src={item.image_url} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-grey-300 text-sm">inventory_2</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-grey-800 truncate">{item.name}</p>
                    {item.sku && <p className="text-[0.6rem] text-grey-400 font-mono" dir="ltr">SKU: {item.sku}</p>}
                    <p className="text-xs text-grey-400 mt-0.5">{item.quantity} × {fmtPrice(item.price)} ر.ق</p>
                  </div>
                  <p className="text-sm font-bold text-grey-900 flex-shrink-0">{fmtPrice(item.total)} ر.ق</p>
                </div>
              ))}
            </div>

            {/* Totals */}
            <hr className="my-4 border-grey-200" />
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">المجموع الفرعي</span>
                <span className="text-grey-700 font-semibold">{fmtPrice(order.subtotal)} ر.ق</span>
              </div>
              {Number(order.discount_amount) > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="material-icons-outlined text-xs">confirmation_number</span>
                    الخصم {order.coupon_code && <span className="text-[0.6rem]">({order.coupon_code})</span>}
                  </span>
                  <span className="text-green-600 font-semibold">- {fmtPrice(order.discount_amount)} ر.ق</span>
                </div>
              )}
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">التوصيل ({SHIPPING_MAP[order.shipping_method || ''] || order.shipping_method})</span>
                {Number(order.shipping_cost) > 0 ? (
                  <span className="text-grey-700 font-semibold">{fmtPrice(order.shipping_cost)} ر.ق</span>
                ) : (
                  <span className="text-green-600 font-semibold text-xs">مجاني</span>
                )}
              </div>
              <hr className="border-grey-200" />
              <div className="flex items-center justify-between">
                <span className="text-base font-bold text-grey-900">الإجمالي</span>
                <span className="font-tajawal text-xl font-black text-brand-800">{fmtPrice(order.total)} <span className="text-xs text-grey-400 font-normal">ر.ق</span></span>
              </div>
            </div>
          </div>

          {/* Status Timeline */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">timeline</span>
              تاريخ الطلب
            </h2>

            <div className="relative pr-6">
              {/* Vertical line */}
              <div className="absolute right-[7px] top-2 bottom-2 w-0.5 bg-grey-200" />

              <div className="space-y-4">
                {order.status_history.map((entry, i) => {
                  const entryStatus = STATUS_MAP[entry.status] || STATUS_MAP.new;
                  const isLatest = i === 0;
                  return (
                    <div key={entry.id} className="relative flex gap-3">
                      {/* Dot */}
                      <div className={`absolute right-[-5px] w-4 h-4 rounded-full border-2 flex-shrink-0 z-10
                        ${isLatest ? 'bg-brand-800 border-brand-800' : 'bg-white border-grey-300'}`} />

                      <div className="mr-6">
                        <div className="flex items-center gap-2">
                          <span className={`text-sm font-bold ${isLatest ? 'text-grey-900' : 'text-grey-600'}`}>
                            {entryStatus.label}
                          </span>
                          <span className="text-[0.6rem] text-grey-400">{fmtDateTime(entry.created_at)}</span>
                        </div>
                        {entry.note && (
                          <p className="text-xs text-grey-500 mt-0.5 flex items-center gap-1">
                            <span className="material-icons-outlined text-[10px]">notes</span>
                            {entry.note}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Admin Notes */}
          <div className="card p-5 print:hidden">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">edit_note</span>
              ملاحظات التاجر
              <span className="text-[0.6rem] text-grey-400 font-normal">(مرئية لك فقط)</span>
            </h2>
            <textarea
              value={adminNotes}
              onChange={(e) => { setAdminNotes(e.target.value); setNotesSaved(false); }}
              placeholder="أضف ملاحظاتك الخاصة على هذا الطلب..."
              rows={3}
              className="input resize-none mb-2"
            />
            <div className="flex items-center gap-2">
              <button onClick={handleSaveNotes} disabled={isUpdating} className="btn btn-brand text-xs">
                {isUpdating ? (
                  <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
                ) : (
                  <span className="material-icons-outlined text-sm">save</span>
                )}
                حفظ الملاحظات
              </button>
              {notesSaved && (
                <span className="text-xs text-green-600 font-semibold flex items-center gap-1 animate-fade-in">
                  <span className="material-icons-outlined text-sm">check</span>
                  تم الحفظ
                </span>
              )}
            </div>
          </div>
        </div>

        {/* ═══ Left Column (1/3) ═══ */}
        <div className="lg:col-span-1 space-y-4">
          {/* Customer Info */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">person</span>
              العميل
            </h2>
            <div className="space-y-2.5">
              <div>
                <p className="text-xs text-grey-400">الاسم</p>
                <p className="text-sm font-semibold text-grey-800">{order.customer_name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-xs text-grey-400">الجوال</p>
                <p className="text-sm font-semibold text-grey-800" dir="ltr">{order.customer_phone}</p>
              </div>
              {order.customer_email && (
                <div>
                  <p className="text-xs text-grey-400">الإيميل</p>
                  <p className="text-sm font-semibold text-grey-800" dir="ltr">{order.customer_email}</p>
                </div>
              )}
              <hr className="border-grey-100" />
              <div className="flex items-center justify-between text-xs text-grey-400">
                <span>عدد الطلبات</span>
                <span className="font-semibold text-grey-600">{order.customer_orders_count || 0}</span>
              </div>
              <div className="flex items-center justify-between text-xs text-grey-400">
                <span>إجمالي الإنفاق</span>
                <span className="font-semibold text-grey-600">{fmtPrice(order.customer_total_spent || 0)} ر.ق</span>
              </div>
            </div>
          </div>

          {/* Shipping Address */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">location_on</span>
              عنوان التوصيل
            </h2>
            <div className="text-sm text-grey-600 space-y-1.5">
              <p className="font-semibold text-grey-800">{SHIPPING_MAP[order.shipping_method || ''] || order.shipping_method}</p>
              {addr.city && <p>{[addr.city, addr.area, addr.street].filter(Boolean).join('، ')}</p>}
              {(addr.building || addr.floor_number || addr.apartment) && (
                <p className="text-xs text-grey-400">
                  {[addr.building && `مبنى ${addr.building}`, addr.floor_number && `طابق ${addr.floor_number}`, addr.apartment && `شقة ${addr.apartment}`].filter(Boolean).join('، ')}
                </p>
              )}
              {addr.notes && (
                <p className="text-xs text-grey-400 italic">📝 {addr.notes}</p>
              )}
            </div>
          </div>

          {/* Payment Info */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">credit_card</span>
              الدفع
            </h2>
            <div className="space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="text-xs text-grey-400">الطريقة</span>
                <span className="text-sm font-semibold text-grey-800">{PAY_METHOD_MAP[order.payment_method || ''] || order.payment_method}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-grey-400">الحالة</span>
                <span className={`inline-flex items-center px-2.5 py-1 rounded text-xs font-bold ${pm.class}`}>
                  {pm.label}
                </span>
              </div>

              {/* Payment status update */}
              {order.payment_status === 'pending' && (
                <button
                  onClick={() => updatePayment(id, 'paid')}
                  disabled={isUpdating}
                  className="w-full mt-2 py-2 rounded-lg bg-green-50 text-green-700 text-xs font-bold hover:bg-green-100 transition-colors flex items-center justify-center gap-1 print:hidden"
                >
                  <span className="material-icons-outlined text-sm">check_circle</span>
                  تأكيد الدفع
                </button>
              )}
            </div>
          </div>

          {/* Customer Notes */}
          {order.customer_notes && (
            <div className="card p-5">
              <h2 className="text-sm font-bold text-grey-900 mb-2 flex items-center gap-2">
                <span className="material-icons-outlined text-amber-500 text-lg">chat</span>
                ملاحظات العميل
              </h2>
              <p className="text-sm text-grey-600 bg-amber-50 rounded-xl p-3 border border-amber-100">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Status Update Modal ═══ */}
      {showStatusModal && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setShowStatusModal(false)} />
          <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 animate-fade-in">
              <div className="flex items-center justify-between mb-4">
                <h3 className="font-tajawal text-lg font-bold text-grey-900">تحديث حالة الطلب</h3>
                <button onClick={() => setShowStatusModal(false)} className="p-1.5 rounded-lg hover:bg-grey-100">
                  <span className="material-icons-outlined text-grey-400">close</span>
                </button>
              </div>

              <div className="mb-4">
                <div className="flex items-center gap-3 p-3 rounded-xl bg-grey-50">
                  <span className={`material-icons-outlined ${st.color}`}>{st.icon}</span>
                  <span className="material-icons-outlined text-grey-300 text-sm">arrow_back</span>
                  <span className={`material-icons-outlined ${STATUS_MAP[nextStatus]?.color}`}>{STATUS_MAP[nextStatus]?.icon}</span>
                  <span className="font-semibold text-grey-800">{STATUS_MAP[nextStatus]?.label}</span>
                </div>
              </div>

              <div className="mb-4">
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">ملاحظة (اختياري)</label>
                <textarea
                  value={statusNote}
                  onChange={(e) => setStatusNote(e.target.value)}
                  placeholder="سبب التحديث أو تفاصيل إضافية..."
                  rows={2}
                  className="input resize-none"
                />
              </div>

              <div className="flex gap-2">
                <button onClick={() => setShowStatusModal(false)} className="btn btn-ghost flex-1">إلغاء</button>
                <button onClick={handleUpdateStatus} disabled={isUpdating}
                  className={`btn flex-1 ${nextStatus === 'cancelled' || nextStatus === 'returned' ? 'btn-danger' : 'btn-brand'}`}>
                  {isUpdating ? (
                    <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
                  ) : (
                    <span className="material-icons-outlined text-sm">check</span>
                  )}
                  تأكيد
                </button>
              </div>
            </div>
          </div>
        </>
      )}

      {/* ═══ Print Styles ═══ */}
      <style jsx global>{`
        @media print {
          body * { visibility: hidden; }
          .print\\:hidden { display: none !important; }
          [class*="Sidebar"], [class*="Topbar"], nav, header, footer { display: none !important; }
          main { padding: 0 !important; margin: 0 !important; }
          .card { box-shadow: none !important; border: 1px solid #e5e5e5 !important; break-inside: avoid; }
          .animate-fade-in, .animate-fade-in * { visibility: visible; }
          .lg\\:mr-64 { margin-right: 0 !important; }
        }
      `}</style>
    </div>
  );
}
