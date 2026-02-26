'use client';

/**
 * ساس — إنشاء كوبون جديد
 * محادثة ٨
 */

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCouponsStore } from '@/stores/coupons';

export default function NewCouponPage() {
  const router = useRouter();
  const { createCoupon } = useCouponsStore();
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

  const update = (field: string, value: any) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setError('');
  };

  const generateCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = '';
    for (let i = 0; i < 8; i++) code += chars[Math.floor(Math.random() * chars.length)];
    update('code', code);
  };

  const handleSubmit = async () => {
    if (!form.code.trim()) return setError('كود الكوبون مطلوب');
    if (!form.value || parseFloat(form.value) <= 0) return setError('قيمة الخصم مطلوبة');
    if (form.type === 'percentage' && parseFloat(form.value) > 100) return setError('النسبة لا تتجاوز 100%');

    setSaving(true);
    setError('');
    try {
      await createCoupon({
        ...form,
        code: form.code.trim(),
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

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link href="/dashboard/marketing" className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 transition-colors">
          <span className="material-icons-outlined text-grey-500 text-lg">arrow_forward</span>
        </Link>
        <div>
          <h1 className="text-xl font-bold text-grey-900">كوبون جديد</h1>
          <p className="text-sm text-grey-500">أنشئ كوبون خصم لعملائك</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-3 flex items-center gap-2">
          <span className="material-icons-outlined text-red-500 text-lg">error</span>
          <span className="text-sm text-red-700">{error}</span>
        </div>
      )}

      {/* Form */}
      <div className="bg-white rounded-xl border border-grey-100 p-5 space-y-5">
        {/* Code */}
        <div>
          <label className="block text-sm font-bold text-grey-700 mb-1.5">كود الكوبون *</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={form.code}
              onChange={(e) => update('code', e.target.value.toUpperCase())}
              placeholder="مثال: WELCOME20"
              className="flex-1 px-4 py-2.5 rounded-lg border border-grey-200 text-sm font-mono font-bold focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
            <button
              type="button"
              onClick={generateCode}
              className="px-3 py-2.5 rounded-lg bg-grey-50 text-grey-600 text-xs font-bold hover:bg-grey-100 transition-colors flex items-center gap-1 flex-shrink-0"
            >
              <span className="material-icons-outlined text-sm">shuffle</span>
              عشوائي
            </button>
          </div>
        </div>

        {/* Type + Value */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-bold text-grey-700 mb-1.5">نوع الخصم *</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => update('type', 'percentage')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  form.type === 'percentage'
                    ? 'bg-brand-800 text-white'
                    : 'bg-grey-50 text-grey-600 hover:bg-grey-100'
                }`}
              >
                نسبة %
              </button>
              <button
                type="button"
                onClick={() => update('type', 'fixed')}
                className={`flex-1 py-2.5 rounded-lg text-sm font-bold transition-all ${
                  form.type === 'fixed'
                    ? 'bg-brand-800 text-white'
                    : 'bg-grey-50 text-grey-600 hover:bg-grey-100'
                }`}
              >
                مبلغ ثابت
              </button>
            </div>
          </div>
          <div>
            <label className="block text-sm font-bold text-grey-700 mb-1.5">
              قيمة الخصم * {form.type === 'percentage' ? '(%)' : '(ر.ق)'}
            </label>
            <input
              type="number"
              value={form.value}
              onChange={(e) => update('value', e.target.value)}
              placeholder={form.type === 'percentage' ? '20' : '50'}
              min="0"
              max={form.type === 'percentage' ? '100' : undefined}
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
            placeholder="خصم ترحيبي للعملاء الجدد"
            className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
            style={{ textAlign: 'right', direction: 'rtl' }}
          />
        </div>

        {/* Conditions */}
        <div className="pt-3 border-t border-grey-100">
          <h3 className="text-sm font-bold text-grey-700 mb-3 flex items-center gap-2">
            <span className="material-icons-outlined text-sm text-grey-400">tune</span>
            شروط الاستخدام
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs text-grey-500 mb-1">الحد الأدنى للطلب (ر.ق)</label>
              <input
                type="number"
                value={form.min_order}
                onChange={(e) => update('min_order', e.target.value)}
                placeholder="100"
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
                  placeholder="50"
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
                placeholder="غير محدود"
                min="0"
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
                style={{ textAlign: 'right', direction: 'rtl' }}
              />
            </div>
          </div>
        </div>

        {/* Dates */}
        <div className="pt-3 border-t border-grey-100">
          <h3 className="text-sm font-bold text-grey-700 mb-3 flex items-center gap-2">
            <span className="material-icons-outlined text-sm text-grey-400">event</span>
            فترة الصلاحية
          </h3>
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
            <p className="text-sm font-bold text-grey-700">تفعيل فوري</p>
            <p className="text-xs text-grey-400">الكوبون يعمل فور الإنشاء</p>
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

      {/* Preview */}
      {form.code && form.value && (
        <div className="bg-brand-50 border border-brand-100 rounded-xl p-4">
          <h4 className="text-xs font-bold text-brand-800 mb-2">معاينة</h4>
          <div className="bg-white rounded-lg p-3 border border-brand-100 flex items-center justify-between">
            <div>
              <span className="font-mono text-lg font-black text-brand-800">{form.code || '...'}</span>
              {form.description && <p className="text-xs text-grey-500 mt-0.5">{form.description}</p>}
            </div>
            <div className="text-left">
              <span className="text-lg font-black text-brand-800">
                {form.type === 'percentage' ? `${form.value}%` : `${form.value} ر.ق`}
              </span>
              <span className="text-xs text-grey-400 block">خصم</span>
            </div>
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
              إنشاء الكوبون
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
