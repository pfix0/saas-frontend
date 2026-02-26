'use client';

/**
 * ساس — Customer Detail Page
 * محادثة ٧: تفاصيل العميل
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomersStore } from '@/stores/customers';

const STATUS_MAP: Record<string, { label: string; class: string; icon: string }> = {
  new:        { label: 'جديد',        class: 'badge-info',    icon: 'fiber_new' },
  confirmed:  { label: 'مؤكد',        class: 'badge-brand',   icon: 'check_circle' },
  processing: { label: 'قيد التجهيز', class: 'badge-warning', icon: 'inventory' },
  shipped:    { label: 'تم الشحن',    class: 'badge-info',    icon: 'local_shipping' },
  delivered:  { label: 'تم التوصيل',  class: 'badge-success', icon: 'done_all' },
  cancelled:  { label: 'ملغي',        class: 'badge-danger',  icon: 'cancel' },
  returned:   { label: 'مسترجع',      class: 'badge-warning', icon: 'assignment_return' },
};

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const { selectedCustomer: customer, isLoading, isUpdating, fetchCustomer, updateCustomer } = useCustomersStore();

  const [notes, setNotes] = useState('');
  const [notesSaved, setNotesSaved] = useState(false);

  useEffect(() => { fetchCustomer(id); }, [id]);
  useEffect(() => { if (customer) setNotes(customer.notes || ''); }, [customer?.id]);

  const fmtPrice = (v: number) => Number(v).toLocaleString('ar-QA', { minimumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleSaveNotes = async () => {
    const ok = await updateCustomer(id, { notes });
    if (ok) { setNotesSaved(true); setTimeout(() => setNotesSaved(false), 2000); }
  };

  const handleToggleBlock = async () => {
    if (!customer) return;
    const newStatus = customer.status === 'active' ? 'blocked' : 'active';
    await updateCustomer(id, { status: newStatus });
  };

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-icons-outlined animate-spin text-3xl text-brand-800 mb-3">autorenew</span>
        <p className="text-sm text-grey-400">جارِ التحميل...</p>
      </div>
    );
  }

  if (!customer) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <span className="material-icons-outlined text-5xl text-grey-200 mb-3">error_outline</span>
        <h2 className="text-lg font-bold text-grey-700 mb-1">العميل غير موجود</h2>
        <Link href="/dashboard/customers" className="text-brand-800 text-sm font-semibold hover:underline mt-2">العودة</Link>
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link href="/dashboard/customers" className="p-2 rounded-xl hover:bg-grey-100 transition-colors">
            <span className="material-icons-outlined text-grey-500">arrow_forward</span>
          </Link>
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <span className="font-tajawal text-lg font-bold text-brand-800">{customer.name?.[0] || '؟'}</span>
          </div>
          <div>
            <h1 className="font-tajawal text-xl font-bold text-grey-900">{customer.name || 'بدون اسم'}</h1>
            <p className="text-xs text-grey-400 font-mono" dir="ltr">{customer.phone}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className={`badge ${customer.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
            {customer.status === 'active' ? 'نشط' : 'محظور'}
          </span>
          <button onClick={handleToggleBlock} disabled={isUpdating}
            className={`btn text-xs ${customer.status === 'active' ? 'btn-ghost text-red-500 hover:bg-red-50' : 'btn-ghost text-green-600 hover:bg-green-50'}`}>
            <span className="material-icons-outlined text-sm">{customer.status === 'active' ? 'block' : 'check_circle'}</span>
            {customer.status === 'active' ? 'حظر' : 'إلغاء الحظر'}
          </button>
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        {/* Right (2/3) */}
        <div className="lg:col-span-2 space-y-4">
          {/* Stats Row */}
          <div className="grid grid-cols-3 gap-3">
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-grey-900">{customer.orders_count}</p>
              <p className="text-xs text-grey-400 mt-1">طلب</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-brand-800">{fmtPrice(customer.total_spent)}</p>
              <p className="text-xs text-grey-400 mt-1">ر.ق إنفاق</p>
            </div>
            <div className="card p-4 text-center">
              <p className="text-2xl font-bold text-grey-900">{customer.orders_count > 0 ? fmtPrice(customer.total_spent / customer.orders_count) : 0}</p>
              <p className="text-xs text-grey-400 mt-1">متوسط الطلب</p>
            </div>
          </div>

          {/* Orders */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">shopping_bag</span>
              سجل الطلبات ({customer.orders?.length || 0})
            </h2>

            {(!customer.orders || customer.orders.length === 0) ? (
              <p className="text-sm text-grey-400 text-center py-8">لا توجد طلبات بعد</p>
            ) : (
              <div className="space-y-2">
                {customer.orders.map((o) => {
                  const st = STATUS_MAP[o.status] || STATUS_MAP.new;
                  return (
                    <Link key={o.id} href={`/dashboard/orders/${o.id}`}
                      className="flex items-center gap-3 p-3 rounded-xl hover:bg-grey-50 transition-colors">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-sm font-bold text-brand-800" dir="ltr">{o.order_number}</span>
                          <span className={`badge ${st.class} text-[0.6rem]`}>{st.label}</span>
                        </div>
                        <p className="text-xs text-grey-400 mt-0.5">{fmtDate(o.created_at)}</p>
                      </div>
                      <span className="text-sm font-bold text-grey-900">{fmtPrice(o.total)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></span>
                      <span className="material-icons-outlined text-grey-300 text-lg">arrow_back</span>
                    </Link>
                  );
                })}
              </div>
            )}
          </div>

          {/* Notes */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">edit_note</span>
              ملاحظات <span className="text-[0.6rem] text-grey-400 font-normal">(مرئية لك فقط)</span>
            </h2>
            <textarea value={notes} onChange={(e) => { setNotes(e.target.value); setNotesSaved(false); }}
              placeholder="ملاحظات عن هذا العميل..." rows={3} className="input resize-none mb-2" />
            <div className="flex items-center gap-2">
              <button onClick={handleSaveNotes} disabled={isUpdating} className="btn btn-brand text-xs">
                <span className="material-icons-outlined text-sm">save</span> حفظ
              </button>
              {notesSaved && <span className="text-xs text-green-600 font-semibold animate-fade-in">✓ تم الحفظ</span>}
            </div>
          </div>
        </div>

        {/* Left (1/3) */}
        <div className="lg:col-span-1 space-y-4">
          {/* Info */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">person</span>
              البيانات
            </h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-grey-400">الاسم</p>
                <p className="text-sm font-semibold text-grey-800">{customer.name || 'غير محدد'}</p>
              </div>
              <div>
                <p className="text-xs text-grey-400">الجوال</p>
                <p className="text-sm font-semibold text-grey-800 font-mono" dir="ltr">{customer.phone}</p>
              </div>
              <div>
                <p className="text-xs text-grey-400">البريد</p>
                <p className="text-sm font-semibold text-grey-800" dir="ltr">{customer.email || '—'}</p>
              </div>
              <hr className="border-grey-100" />
              <div>
                <p className="text-xs text-grey-400">تاريخ التسجيل</p>
                <p className="text-sm text-grey-600">{fmtDate(customer.created_at)}</p>
              </div>
              <div>
                <p className="text-xs text-grey-400">آخر طلب</p>
                <p className="text-sm text-grey-600">{customer.last_order_at ? fmtDate(customer.last_order_at) : 'لا يوجد'}</p>
              </div>
            </div>
          </div>

          {/* Addresses */}
          <div className="card p-5">
            <h2 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">location_on</span>
              العناوين ({customer.addresses?.length || 0})
            </h2>
            {(!customer.addresses || customer.addresses.length === 0) ? (
              <p className="text-sm text-grey-400 text-center py-4">لا توجد عناوين</p>
            ) : (
              <div className="space-y-2">
                {customer.addresses.map((a) => (
                  <div key={a.id} className="p-3 rounded-xl bg-grey-50 border border-grey-100">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs font-bold text-grey-700">{a.label}</span>
                      {a.is_default && <span className="text-[0.55rem] bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded font-semibold">افتراضي</span>}
                    </div>
                    <p className="text-xs text-grey-500">{[a.city, a.area, a.street].filter(Boolean).join('، ')}</p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
