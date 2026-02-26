'use client';

/**
 * ساس — تعديل كوبون
 * محادثة ٨
 */

import { useEffect, useState } from 'react';
import { useRouter, useParams } from 'next/navigation';
import Link from 'next/link';
import { useCouponsStore } from '@/stores/coupons';

export default function EditCouponPage() {
  const router = useRouter();
  const params = useParams();
  const couponId = params.id as string;
  const { currentCoupon, fetchCoupon, updateCoupon, isLoading } = useCouponsStore();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const [form, setForm] = useState({
    code: '',
    type: 'percentage' as 'percentage' | 'fixed',
    value: '',
    description: '',
    min_order: '',
    max_discount: '',
    max_uses: '',
    starts_at: '',
    expires_at: '',
    is_active: true,
  });

  useEffect(() => {
    fetchCoupon(couponId);
  }, [couponId]);

  useEffect(() => {
    if (currentCoupon) {
      setForm({
        code: currentCoupon.code,
        type: currentCoupon.type,
        value: String(currentCoupon.value),
        description: currentCoupon.description || '',
        min_order: currentCoupon.min_order ? String(currentCoupon.min_order) : '',
        max_discount: currentCoupon.max_discount ? String(currentCoupon.max_discount) : '',
        max_uses: currentCoupon.max_uses ? String(currentCoupon.max_uses) : '',
        starts_at: currentCoupon.starts_at ? currentCoupon.starts_at.slice(0, 16) : '',
        expires_at: currentCoupon.expires_at ? currentCoupon.expires_at.slice(0, 16) : '',
        is_active: currentCoupon.is_active,
      });
    }
  }, [currentCoupon]);

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) return setError('كود الكوبون مطلوب');
    if (!form.value || parseFloat(form.value) <= 0) return setError('قيمة الخصم مطلوبة');
    if (form.type === 'percentage' && parseFloat(form.value) > 100) return setError('النسبة لا تتجاوز 100%');

    setSaving(true);
    setError('');
    try {
      await updateCoupon(couponId, {
        ...form,
        value: parseFloat(form.value),
        min_order: form.min_order ? parseFloat(form.min_order) : null,
        max_discount: form.max_discount ? parseFloat(form.max_discount) : null,
        max_uses: form.max_uses ? parseInt(form.max_uses) : null,
        starts_at: form.starts_at || null,
        expires_at: form.expires_at || null,
      });
      router.push('/dashboard/marketing');
    } catch (err: any) {
      setError(err.message || 'حدث خطأ');
    } finally {
      setSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/marketing" className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 transition-colors">
          <span className="material-icons-outlined text-grey-500 text-lg">arrow_forward</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-grey-900">تعديل الكوبون</h1>
          <p className="text-sm text-grey-500">
            {currentCoupon?.code} — مستخدم {currentCoupon?.used_count || 0} مرة
          </p>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <span className="material-icons-outlined text-red-500 text-lg">error</span>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Form — same structure as new */}
      <div className="bg-white rounded-xl border border-grey-100 p-5 space-y-5">
        {/* Code */}
        <div>
          <label className="block text-sm font-bold text-grey-700 mb-1.5">كود الكوبون *</label>
          <input
            type="text"
            value={form.code}
            onChange={(e) => update('code', e.target.value.toUpperCase())}
            className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm font-mono font-bold focus:outline-none focus:border-brand-800"
            style={{ textAlign: 'right', direction: 'rtl' }}
          />
        </div>

        {/* Type + Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-grey-700 mb-1.5">نوع الخصم</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update('type', 'percentage')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  form.type === 'percentage' ? 'bg-brand-800 text-white' : 'bg-grey-50 text-grey-600'
                }`}
              >
                نسبة %
              </button>
              <button
                type="button"
                onClick={() => update('type', 'fixed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  form.type === 'fixed' ? 'bg-brand-800 text-white' : 'bg-grey-50 text-grey-600'
                }`}
              >
                مبلغ ثابت
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-grey-700 mb-1.5">
              القيمة {form.type === 'percentage' ? '(%)' : '(ر.ق)'}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => update('value', e.target.value)}
              min="0"
              step="0.01"
              className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-bold text-grey-700 mb-1.5">الوصف</label>
          <input
            type="text"
            value={form.description}
            onChange={(e) => update('description', e.target.value)}
            className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
            style={{ textAlign: 'right', direction: 'rtl' }}
          />
        </div>

        {/* Conditions */}
        <div className="pt-3 border-t border-grey-100">
          <h3 className="text-sm font-bold text-grey-700 mb-3">شروط الاستخدام</h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-grey-500 mb-1">الحد الأدنى (ر.ق)</label>
              <input
                type="number"
                value={form.min_order}
                onChange={(e) => update('min_order', e.target.value)}
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>
            {form.type === 'percentage' && (
              <div>
                <label className="block text-xs text-grey-500 mb-1">حد أقصى للخصم (ر.ق)</label>
                <input
                  type="number"
                  value={form.max_discount}
                  onChange={(e) => update('max_discount', e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
                  style={{ textAlign: 'right', direction: 'rtl' }}
                />
              </div>
            )}
            <div>
              <label className="block text-xs text-grey-500 mb-1">حد الاستخدام</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => update('max_uses', e.target.value)}
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="pt-3 border-t border-grey-100">
          <h3 className="text-sm font-bold text-grey-700 mb-3">فترة الصلاحية</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs text-grey-500 mb-1">تاريخ البداية</label>
              <input
                type="datetime-local"
                value={form.starts_at}
                onChange={(e) => update('starts_at', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              />
            </div>
            <div>
              <label className="block text-xs text-grey-500 mb-1">تاريخ الانتهاء</label>
              <input
                type="datetime-local"
                value={form.expires_at}
                onChange={(e) => update('expires_at', e.target.value)}
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              />
            </div>
          </div>
        </div>

        {/* Active Toggle */}
        <div className="flex items-center justify-between pt-3 border-t border-grey-100">
          <div>
            <p className="text-sm font-bold text-grey-700">الكوبون مفعل</p>
            <p className="text-xs text-grey-400">يمكن للعملاء استخدامه</p>
          </div>
          <button
            type="button"
            onClick={() => update('is_active', !form.is_active)}
            className={`w-12 h-7 rounded-full transition-colors relative ${
              form.is_active ? 'bg-brand-800' : 'bg-grey-200'
            }`}
          >
            <span
              className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${
                form.is_active ? 'left-1' : 'left-6'
              }`}
            />
          </button>
        </div>
      </div>

      {/* Usage History */}
      {currentCoupon?.orders && currentCoupon.orders.length > 0 && (
        <div className="bg-white rounded-xl border border-grey-100 p-5">
          <h3 className="text-sm font-bold text-grey-700 mb-3 flex items-center gap-2">
            <span className="material-icons-outlined text-sm text-grey-400">history</span>
            سجل الاستخدام ({currentCoupon.orders.length})
          </h3>
          <div className="space-y-2">
            {currentCoupon.orders.map((order) => (
              <Link
                key={order.id}
                href={`/dashboard/orders/${order.id}`}
                className="flex items-center justify-between p-3 rounded-lg bg-grey-25 hover:bg-grey-50 transition-colors"
              >
                <div>
                  <span className="text-sm font-bold text-brand-800">{order.order_number}</span>
                  <span className="text-xs text-grey-400 mr-2">{order.customer_name}</span>
                </div>
                <div className="text-left">
                  <span className="text-sm font-bold text-grey-900">{parseFloat(String(order.total)).toFixed(2)} ر.ق</span>
                  <span className="text-xs text-red-500 block">-{parseFloat(String(order.discount_amount)).toFixed(2)} ر.ق</span>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3">
        <button
          onClick={handleSubmit}
          disabled={saving}
          className="flex-1 btn-brand py-3 rounded-xl text-sm font-bold disabled:opacity-60 flex items-center justify-center gap-2"
        >
          {saving ? (
            <>
              <span className="material-icons-outlined text-lg animate-spin">sync</span>
              جاري الحفظ...
            </>
          ) : (
            <>
              <span className="material-icons-outlined text-lg">check</span>
              حفظ التعديلات
            </>
          )}
        </button>
        <Link
          href="/dashboard/marketing"
          className="px-6 py-3 rounded-xl border border-grey-200 text-sm font-bold text-grey-600 hover:bg-grey-50 text-center"
        >
          إلغاء
        </Link>
      </div>
    </div>
  );
}
