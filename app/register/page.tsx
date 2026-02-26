'use client';

/**
 * ساس — صفحة تسجيل تاجر جديد
 * المحادثة ٢
 * 
 * خطوتين:
 * ١. بيانات التاجر (اسم + إيميل + جوال + كلمة مرور)
 * ٢. اسم المتجر → إنشاء تلقائي مع subdomain
 */

import { useState, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function RegisterPage() {
  const router = useRouter();
  const { register, isLoading, error, clearError } = useAuthStore();

  const [step, setStep] = useState(1);
  const [form, setForm] = useState({
    name: '',
    email: '',
    phone: '+974',
    password: '',
    storeName: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // ═══ Update field ═══
  const set = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
    if (error) clearError();
  };

  // ═══ Validate Step 1 ═══
  const validateStep1 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.name.trim() || form.name.trim().length < 2)
      e.name = 'الاسم يجب أن يكون حرفين على الأقل';
    if (!form.email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'البريد الإلكتروني غير صحيح';
    if (!form.phone.trim() || form.phone.replace(/\D/g, '').length < 8)
      e.phone = 'رقم الجوال غير صحيح';
    if (!form.password || form.password.length < 8)
      e.password = 'كلمة المرور يجب أن تكون ٨ أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ═══ Validate Step 2 ═══
  const validateStep2 = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.storeName.trim() || form.storeName.trim().length < 3)
      e.storeName = 'اسم المتجر يجب أن يكون ٣ أحرف على الأقل';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ═══ Submit ═══
  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (step === 1) {
      if (validateStep1()) setStep(2);
      return;
    }

    if (!validateStep2()) return;

    const success = await register({
      name: form.name.trim(),
      email: form.email.trim().toLowerCase(),
      phone: form.phone.trim(),
      password: form.password,
      storeName: form.storeName.trim(),
    });

    if (success) {
      router.push('/dashboard');
    }
  };

  // ═══ Password Strength ═══
  const passwordStrength = form.password.length === 0 ? 0
    : form.password.length < 6 ? 1
    : form.password.length < 8 ? 2
    : form.password.length < 12 ? 3 : 4;

  const strengthColors = ['', 'bg-danger', 'bg-warning', 'bg-warning', 'bg-success'];

  // ═══ Slug Preview ═══
  const slugPreview = form.storeName.trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/[^\u0600-\u06FFa-z0-9-]/g, '') || 'my-store';

  return (
    <>
      {/* العنوان */}
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-2">
          {step === 1 ? 'أنشئ حسابك' : 'سمّ متجرك'}
        </h1>
        <p className="text-sm text-grey-400">
          {step === 1 ? 'أدخل بياناتك الشخصية للبدء' : 'اختر اسم لمتجرك وابدأ البيع'}
        </p>
      </div>

      {/* مؤشر الخطوات */}
      <div className="flex items-center gap-2.5 mb-7">
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
          step > 1
            ? 'bg-success text-white'
            : 'bg-brand-800 text-white'
        }`}>
          {step > 1 ? (
            <span className="material-icons-outlined text-sm">check</span>
          ) : '١'}
        </div>
        <span className="text-xs font-semibold text-grey-400 hidden sm:inline">بياناتك</span>
        <div className={`flex-1 h-0.5 rounded transition-colors ${step > 1 ? 'bg-success' : 'bg-grey-100'}`} />
        <div className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-bold transition-all ${
          step === 2 ? 'bg-brand-800 text-white' : 'bg-grey-100 text-grey-400'
        }`}>
          ٢
        </div>
        <span className="text-xs font-semibold text-grey-400 hidden sm:inline">المتجر</span>
      </div>

      {/* رسالة خطأ */}
      {error && (
        <div className="mb-5 p-3.5 bg-red-50 border border-red-100 rounded-saas flex items-start gap-2.5 animate-fade-in">
          <span className="material-icons-outlined text-danger text-lg mt-0.5">error_outline</span>
          <p className="text-danger text-sm font-medium">{error}</p>
        </div>
      )}

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {step === 1 ? (
          /* ═══ الخطوة ١: بيانات التاجر ═══ */
          <>
            <Input
              label="الاسم الكامل"
              type="text"
              icon="person_outline"
              value={form.name}
              onChange={e => set('name', e.target.value)}
              error={errors.name}
              placeholder="محمد العلي"
              autoFocus
              autoComplete="name"
            />

            <Input
              label="البريد الإلكتروني"
              type="email"
              icon="email"
              value={form.email}
              onChange={e => set('email', e.target.value)}
              error={errors.email}
              placeholder="email@example.com"
              dir="ltr"
              autoComplete="email"
            />

            <Input
              label="رقم الجوال"
              type="tel"
              icon="phone_iphone"
              value={form.phone}
              onChange={e => set('phone', e.target.value)}
              error={errors.phone}
              placeholder="+974 5555 1234"
              dir="ltr"
              autoComplete="tel"
            />

            {/* كلمة المرور — مع زر إظهار/إخفاء */}
            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                كلمة المرور
              </label>
              <div 
                className={`flex items-center gap-2 w-full py-2.5 px-3 rounded-saas border bg-white transition-colors focus-within:border-brand-800 focus-within:ring-2 focus-within:ring-brand-800/10 ${errors.password ? 'border-danger focus-within:border-danger focus-within:ring-danger/10' : 'border-grey-200'}`}
              >
                <span className="material-icons-outlined text-grey-300 text-lg shrink-0">
                  lock_outline
                </span>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={form.password}
                  onChange={e => set('password', e.target.value)}
                  className="flex-1 min-w-0 bg-transparent text-grey-800 text-sm placeholder:text-grey-400 outline-none border-none"
                  placeholder="٨ أحرف على الأقل"
                  dir="ltr"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="text-grey-300 hover:text-brand-800 transition-colors shrink-0"
                  tabIndex={-1}
                >
                  <span className="material-icons-outlined text-lg">
                    {showPassword ? 'visibility_off' : 'visibility'}
                  </span>
                </button>
              </div>
              {errors.password && (
                <p className="text-xs text-danger mt-1 flex items-center gap-1">
                  <span className="material-icons-outlined text-xs">error</span>
                  {errors.password}
                </p>
              )}
              {/* مؤشر القوة */}
              {form.password && (
                <div className="flex gap-1.5 mt-2">
                  {[1, 2, 3, 4].map(i => (
                    <div
                      key={i}
                      className={`h-1 flex-1 rounded-full transition-colors ${
                        i <= passwordStrength ? strengthColors[passwordStrength] : 'bg-grey-100'
                      }`}
                    />
                  ))}
                </div>
              )}
            </div>

            <Button type="submit" variant="brand" size="lg" className="w-full">
              التالي
              <span className="material-icons-outlined text-lg rotate-180">arrow_forward</span>
            </Button>
          </>
        ) : (
          /* ═══ الخطوة ٢: اسم المتجر ═══ */
          <>
            <Input
              label="اسم المتجر"
              type="text"
              icon="storefront"
              value={form.storeName}
              onChange={e => set('storeName', e.target.value)}
              error={errors.storeName}
              placeholder="متجر الفخامة"
              autoFocus
            />

            {/* معاينة الرابط */}
            {form.storeName.trim() && (
              <div className="p-3.5 bg-brand-50 rounded-saas border border-brand-100 animate-fade-in">
                <p className="text-[0.7rem] text-grey-400 mb-1">رابط متجرك سيكون:</p>
                <div className="flex items-center gap-2" dir="ltr">
                  <span className="material-icons-outlined text-brand-800 text-base">link</span>
                  <code className="text-sm font-medium text-brand-800 font-mono">
                    {slugPreview}.saas.qa
                  </code>
                </div>
              </div>
            )}

            {/* باقة أساس */}
            <div className="p-3.5 bg-green-50 rounded-saas border border-green-100">
              <div className="flex items-center gap-2 mb-1.5">
                <span className="material-icons-outlined text-success text-base">card_giftcard</span>
                <span className="text-sm font-bold text-success">باقة أساس — مجاناً</span>
              </div>
              <p className="text-[0.72rem] text-grey-500 leading-relaxed">
                ٥٠ منتج • دومين فرعي مجاني • بوابة دفع واحدة • دعم عبر البريد
              </p>
            </div>

            {/* أزرار */}
            <div className="flex gap-3 pt-1">
              <Button
                type="button"
                variant="outline"
                onClick={() => { setStep(1); setErrors({}); }}
                icon="arrow_forward"
              >
                رجوع
              </Button>
              <Button
                type="submit"
                variant="brand"
                size="lg"
                icon="rocket_launch"
                loading={isLoading}
                className="flex-1"
              >
                أنشئ متجري
              </Button>
            </div>
          </>
        )}
      </form>

      {/* رابط تسجيل الدخول */}
      <p className="text-center text-sm text-grey-400 mt-7">
        عندك حساب؟{' '}
        <Link href="/login" className="text-brand-800 font-semibold hover:underline">
          سجّل دخولك
        </Link>
      </p>
    </>
  );
}
