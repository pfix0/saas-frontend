'use client';

/**
 * ساس — Platform Admin Login
 */

import { useState, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore } from '@/stores/admin';

export default function AdminLoginPage() {
  const router = useRouter();
  const { login, error, clearError } = useAdminStore();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    clearError();
    setSubmitting(true);
    const ok = await login(email, password);
    if (ok) {
      router.push('/admin');
    } else {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-grey-900 flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-1.5 mb-3">
            <span className="font-tajawal text-3xl font-black text-white">ساس</span>
            <span className="w-1.5 h-1.5 bg-brand-500 rounded-full" />
          </div>
          <p className="text-grey-400 text-sm">إدارة المنصة</p>
        </div>

        {/* Card */}
        <div className="bg-grey-800 rounded-2xl p-6 border border-grey-700">
          <h1 className="font-tajawal text-lg font-bold text-white mb-1">تسجيل دخول المدير</h1>
          <p className="text-xs text-grey-500 mb-6">لوحة تحكم المنصة — للمسؤولين فقط</p>

          {error && (
            <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
              <span className="material-icons-outlined text-lg">error</span>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-grey-300 mb-1.5">البريد الإلكتروني</label>
              <input type="email" value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="admin@saas.qa" dir="ltr" required
                className="w-full px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
            </div>

            <div>
              <label className="block text-sm font-semibold text-grey-300 mb-1.5">كلمة المرور</label>
              <div className="relative">
                <input type={showPass ? 'text' : 'password'} value={password} onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••" dir="ltr" required
                  className="w-full px-4 py-2.5 pl-10 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/20 outline-none transition-all" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 text-grey-500 hover:text-grey-300 transition-colors">
                  <span className="material-icons-outlined text-lg">{showPass ? 'visibility_off' : 'visibility'}</span>
                </button>
              </div>
            </div>

            <button type="submit" disabled={submitting}
              className="w-full py-3 rounded-xl bg-brand-800 text-white font-semibold text-sm hover:bg-brand-700 transition-all disabled:opacity-50 flex items-center justify-center gap-2">
              {submitting ? (
                <>
                  <span className="material-icons-outlined animate-spin text-lg">progress_activity</span>
                  جاري الدخول...
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-lg">admin_panel_settings</span>
                  دخول لوحة الإدارة
                </>
              )}
            </button>
          </form>
        </div>

        <p className="text-center text-xs text-grey-600 mt-6">
          ساس © ٢٠٢٦ — هذه اللوحة مخصصة لمسؤولي المنصة فقط
        </p>
      </div>
    </div>
  );
}
