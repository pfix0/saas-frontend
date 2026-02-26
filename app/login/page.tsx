'use client';

/**
 * ساس — صفحة تسجيل دخول التاجر
 * المحادثة ٢
 */

import { useState, Suspense, type FormEvent } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import Input from '@/components/ui/Input';
import Button from '@/components/ui/Button';

export default function LoginPage() {
  return (
    <Suspense fallback={<div className="text-center py-10 text-grey-400 text-sm">جاري التحميل...</div>}>
      <LoginForm />
    </Suspense>
  );
}

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get('redirect') || '/dashboard';

  const { login, isLoading, error, clearError } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      e.email = 'البريد الإلكتروني غير صحيح';
    }
    if (!password) {
      e.password = 'كلمة المرور مطلوبة';
    }
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const clearField = (field: string) => {
    if (errors[field]) {
      setErrors(prev => { const n = { ...prev }; delete n[field]; return n; });
    }
    if (error) clearError();
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const success = await login(email.trim().toLowerCase(), password);
    if (success) {
      router.push(redirectTo);
    }
  };

  return (
    <>
      {/* العنوان */}
      <div className="mb-8">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-2">
          مرحباً بعودتك
        </h1>
        <p className="text-sm text-grey-400">
          سجّل دخولك للوصول إلى لوحة التحكم
        </p>
      </div>

      {/* رسالة خطأ عام */}
      {error && (
        <div className="mb-6 p-3.5 bg-red-50 border border-red-100 rounded-saas flex items-start gap-2.5 animate-fade-in">
          <span className="material-icons-outlined text-danger text-lg mt-0.5">error_outline</span>
          <p className="text-danger text-sm font-medium">{error}</p>
        </div>
      )}

      {/* رسالة redirect */}
      {redirectTo !== '/dashboard' && (
        <div className="mb-6 p-3.5 bg-blue-50 border border-blue-100 rounded-saas flex items-start gap-2.5">
          <span className="material-icons-outlined text-info text-lg mt-0.5">info</span>
          <p className="text-info text-sm">سجّل دخولك أولاً للوصول لهذه الصفحة</p>
        </div>
      )}

      {/* النموذج */}
      <form onSubmit={handleSubmit} className="space-y-5">
        <Input
          label="البريد الإلكتروني"
          type="email"
          icon="email"
          value={email}
          onChange={e => { setEmail(e.target.value); clearField('email'); }}
          error={errors.email}
          placeholder="email@example.com"
          dir="ltr"
          autoFocus
          autoComplete="email"
        />

        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="block text-sm font-semibold text-grey-700">
              كلمة المرور
            </label>
            <button
              type="button"
              className="text-xs text-brand-800 hover:underline font-medium"
              tabIndex={-1}
            >
              نسيت كلمة المرور؟
            </button>
          </div>
          <div className="relative">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg">
              lock_outline
            </span>
            <input
              type={showPassword ? 'text' : 'password'}
              value={password}
              onChange={e => { setPassword(e.target.value); clearField('password'); }}
              className={`w-full py-2.5 pr-10 pl-10 rounded-saas border bg-white text-grey-800 text-sm transition-colors focus:border-brand-800 focus:ring-2 focus:ring-brand-800/10 focus:outline-none placeholder:text-grey-400 ${errors.password ? 'border-danger focus:border-danger focus:ring-danger/10' : 'border-grey-200'}`}
              placeholder="••••••••"
              dir="ltr"
              autoComplete="current-password"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-300 hover:text-brand-800 transition-colors"
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
        </div>

        <Button
          type="submit"
          variant="brand"
          size="lg"
          icon="login"
          loading={isLoading}
          className="w-full"
        >
          تسجيل الدخول
        </Button>
      </form>

      {/* فاصل */}
      <div className="flex items-center gap-4 my-7">
        <div className="flex-1 h-px bg-grey-100" />
        <span className="text-xs text-grey-300">أو</span>
        <div className="flex-1 h-px bg-grey-100" />
      </div>

      {/* رابط التسجيل */}
      <Link href="/register" className="btn-outline w-full py-2.5 text-center">
        <span className="material-icons-outlined text-lg">person_add</span>
        إنشاء حساب جديد
      </Link>

      {/* شروط */}
      <p className="text-center text-[0.65rem] text-grey-300 mt-8 leading-relaxed">
        بتسجيل دخولك، أنت توافق على{' '}
        <a href="#" className="text-brand-800 hover:underline">شروط الاستخدام</a>
        {' '}و{' '}
        <a href="#" className="text-brand-800 hover:underline">سياسة الخصوصية</a>
      </p>
    </>
  );
}
