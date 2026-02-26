'use client';

/**
 * ساس — Order Confirmation Page
 * صفحة تأكيد الطلب — بعد الشراء بنجاح
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface OrderData {
  id: string;
  order_number: string;
  status: string;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  total: number;
  payment_method: string;
  payment_status: string;
  shipping_method: string;
  shipping_address: any;
  coupon_code: string | null;
  customer_notes: string | null;
  customer_name: string;
  customer_phone: string;
  customer_email: string | null;
  store_name: string;
  created_at: string;
  items: {
    id: string;
    name: string;
    image_url: string | null;
    price: number;
    quantity: number;
    total: number;
    options: Record<string, string>;
  }[];
  status_history: {
    id: string;
    status: string;
    note: string | null;
    created_at: string;
  }[];
}

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  new: { label: 'جديد', color: 'blue', icon: 'fiber_new' },
  confirmed: { label: 'مؤكد', color: 'indigo', icon: 'check_circle' },
  processing: { label: 'قيد التجهيز', color: 'amber', icon: 'inventory' },
  shipped: { label: 'تم الشحن', color: 'purple', icon: 'local_shipping' },
  delivered: { label: 'تم التوصيل', color: 'green', icon: 'done_all' },
  cancelled: { label: 'ملغي', color: 'red', icon: 'cancel' },
  returned: { label: 'مسترجع', color: 'orange', icon: 'assignment_return' },
};

const SHIPPING_MAP: Record<string, string> = {
  aramex: 'أرامكس',
  dhl: 'DHL',
  pickup: 'استلام من المتجر',
};

const PAYMENT_MAP: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  sadad: 'سداد',
  skipcash: 'سكايب كاش',
};

export default function OrderConfirmationPage({
  params,
}: {
  params: { store: string; orderNumber: string };
}) {
  const { store, orderNumber } = params;
  const base = `/store/${store}`;
  const fmtPrice = (n: number) => Number(n).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  const [order, setOrder] = useState<OrderData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/store/${store}/order/${orderNumber}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) {
          setOrder(d.data);
          // Parse shipping_address if it's a string
          if (typeof d.data.shipping_address === 'string') {
            d.data.shipping_address = JSON.parse(d.data.shipping_address);
          }
          setOrder(d.data);
        } else {
          setError(d.error || 'الطلب غير موجود');
        }
        setLoading(false);
      })
      .catch(() => {
        setError('خطأ في تحميل بيانات الطلب');
        setLoading(false);
      });
  }, [store, orderNumber]);

  if (loading) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <span className="material-icons-outlined animate-spin text-3xl text-brand-800 mb-3 block">autorenew</span>
        <p className="text-sm text-grey-400">جارِ تحميل الطلب...</p>
      </div>
    );
  }

  if (error || !order) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-20 text-center">
        <span className="material-icons-outlined text-5xl text-grey-200 mb-4 block">error_outline</span>
        <h1 className="font-tajawal text-xl font-bold text-grey-800 mb-2">الطلب غير موجود</h1>
        <p className="text-sm text-grey-400 mb-6">{error}</p>
        <Link href={base} className="text-brand-800 text-sm font-semibold hover:underline">العودة للمتجر</Link>
      </div>
    );
  }

  const statusInfo = STATUS_MAP[order.status] || STATUS_MAP.new;
  const addr = order.shipping_address || {};

  return (
    <div className="max-w-3xl mx-auto px-4 py-8 pb-20">
      {/* ═══ Success Header ═══ */}
      <div className="text-center mb-8 animate-fade-in">
        <div className="w-20 h-20 rounded-full bg-green-50 border-2 border-green-200 flex items-center justify-center mx-auto mb-4">
          <span className="material-icons-outlined text-green-500 text-4xl">check_circle</span>
        </div>
        <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-1">تم إنشاء طلبك بنجاح!</h1>
        <p className="text-sm text-grey-400">شكراً لك — سيتم التواصل معك قريباً</p>
      </div>

      {/* ═══ Order Number Card ═══ */}
      <div className="rounded-2xl bg-brand-50/50 border border-brand-200/50 p-5 mb-6 text-center">
        <p className="text-xs text-grey-500 font-semibold mb-1">رقم الطلب</p>
        <p className="font-tajawal text-2xl font-black text-brand-800 tracking-wider" dir="ltr">{order.order_number}</p>
        <div className="flex items-center justify-center gap-4 mt-3 text-xs text-grey-400">
          <span className="flex items-center gap-1">
            <span className="material-icons-outlined text-xs">calendar_today</span>
            {new Date(order.created_at).toLocaleDateString('ar-QA', { year: 'numeric', month: 'long', day: 'numeric' })}
          </span>
          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold
            bg-${statusInfo.color}-50 text-${statusInfo.color}-600 border border-${statusInfo.color}-200`}>
            <span className="material-icons-outlined text-xs">{statusInfo.icon}</span>
            {statusInfo.label}
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* ═══ Order Items ═══ */}
        <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
          <h2 className="font-tajawal text-base font-bold text-grey-900 mb-4 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-800 text-lg">shopping_bag</span>
            المنتجات ({order.items.length})
          </h2>

          <div className="space-y-3">
            {order.items.map(item => (
              <div key={item.id} className="flex gap-3">
                <div className="w-14 h-14 rounded-xl bg-white border border-grey-100 overflow-hidden flex-shrink-0">
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
                  <p className="text-xs text-grey-400 mt-0.5">{item.quantity} × {fmtPrice(item.price)} ر.ق</p>
                </div>
                <p className="text-sm font-bold text-grey-900 flex-shrink-0">{fmtPrice(item.total)} ر.ق</p>
              </div>
            ))}
          </div>

          {/* Totals */}
          <hr className="border-grey-200 my-4" />
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-grey-500">المجموع الفرعي</span>
              <span className="text-grey-700 font-semibold">{fmtPrice(order.subtotal)} ر.ق</span>
            </div>
            {Number(order.discount_amount) > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-green-600 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">confirmation_number</span>
                  الخصم {order.coupon_code && <span className="text-[0.6rem] text-green-400">({order.coupon_code})</span>}
                </span>
                <span className="text-green-600 font-semibold">- {fmtPrice(order.discount_amount)} ر.ق</span>
              </div>
            )}
            <div className="flex items-center justify-between text-sm">
              <span className="text-grey-500">التوصيل</span>
              {Number(order.shipping_cost) > 0 ? (
                <span className="text-grey-700 font-semibold">{fmtPrice(order.shipping_cost)} ر.ق</span>
              ) : (
                <span className="text-green-600 font-semibold text-xs">مجاني</span>
              )}
            </div>
            <hr className="border-grey-200" />
            <div className="flex items-center justify-between">
              <span className="text-base font-bold text-grey-900">الإجمالي</span>
              <span className="font-tajawal text-xl font-black text-brand-800">
                {fmtPrice(order.total)} <span className="text-xs text-grey-400 font-normal">ر.ق</span>
              </span>
            </div>
          </div>
        </div>

        {/* ═══ Delivery & Payment Info ═══ */}
        <div className="grid sm:grid-cols-2 gap-4">
          {/* Shipping */}
          <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
            <h3 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-sm">local_shipping</span>
              التوصيل
            </h3>
            <div className="space-y-2 text-sm text-grey-600">
              <p className="font-semibold text-grey-800">{SHIPPING_MAP[order.shipping_method || ''] || order.shipping_method}</p>
              <p>{[addr.city, addr.area, addr.street].filter(Boolean).join('، ')}</p>
              {addr.building && <p className="text-xs text-grey-400">مبنى {addr.building}{addr.floor_number ? `، طابق ${addr.floor_number}` : ''}{addr.apartment ? `، شقة ${addr.apartment}` : ''}</p>}
              {addr.notes && <p className="text-xs text-grey-400 italic">📝 {addr.notes}</p>}
            </div>
          </div>

          {/* Payment */}
          <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
            <h3 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-sm">credit_card</span>
              الدفع
            </h3>
            <div className="space-y-2 text-sm text-grey-600">
              <p className="font-semibold text-grey-800">{PAYMENT_MAP[order.payment_method || ''] || order.payment_method}</p>
              <p className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-xs font-semibold
                ${order.payment_status === 'paid' ? 'bg-green-50 text-green-600' : 'bg-amber-50 text-amber-600'}`}>
                {order.payment_status === 'paid' ? 'مدفوع' : 'في انتظار الدفع'}
              </p>
            </div>
          </div>
        </div>

        {/* ═══ Customer Info ═══ */}
        <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
          <h3 className="text-sm font-bold text-grey-900 mb-3 flex items-center gap-2">
            <span className="material-icons-outlined text-brand-800 text-sm">person</span>
            بيانات العميل
          </h3>
          <div className="grid sm:grid-cols-3 gap-3 text-sm text-grey-600">
            <div>
              <p className="text-xs text-grey-400 mb-0.5">الاسم</p>
              <p className="font-semibold text-grey-800">{order.customer_name}</p>
            </div>
            <div>
              <p className="text-xs text-grey-400 mb-0.5">الجوال</p>
              <p className="font-semibold text-grey-800" dir="ltr">{order.customer_phone}</p>
            </div>
            {order.customer_email && (
              <div>
                <p className="text-xs text-grey-400 mb-0.5">الإيميل</p>
                <p className="font-semibold text-grey-800" dir="ltr">{order.customer_email}</p>
              </div>
            )}
          </div>
          {order.customer_notes && (
            <div className="mt-3 p-3 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs text-amber-600 font-semibold flex items-center gap-1">
                <span className="material-icons-outlined text-xs">edit_note</span>
                ملاحظات العميل
              </p>
              <p className="text-sm text-amber-700 mt-1">{order.customer_notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* ═══ Actions ═══ */}
      <div className="mt-8 flex flex-col sm:flex-row gap-3">
        <Link href={base}
          className="flex-1 py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold text-center hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
          <span className="material-icons-outlined text-lg">storefront</span>
          العودة للمتجر
        </Link>
        <button
          onClick={() => window.print()}
          className="py-3.5 px-6 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center justify-center gap-2">
          <span className="material-icons-outlined text-lg">print</span>
          طباعة
        </button>
      </div>

      {/* ═══ Powered by ═══ */}
      <p className="text-center text-[0.6rem] text-grey-300 mt-8">
        مدعوم بـ <span className="text-brand-800 font-semibold">ساس</span>
      </p>

      {/* ═══ Animations ═══ */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.4s ease-out; }
      `}</style>
    </div>
  );
}
