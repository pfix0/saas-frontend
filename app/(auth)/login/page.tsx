import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'تسجيل الدخول',
};

export default function LoginPage() {
  return (
    <div>
      <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-2">
        مرحباً بعودتك
      </h1>
      <p className="text-sm text-grey-400 mb-8">
        سجّل دخولك لإدارة متجرك
      </p>

      {/* Login form - will be implemented in Session 2 */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            البريد الإلكتروني
          </label>
          <input
            type="email"
            className="input"
            placeholder="email@example.com"
            dir="ltr"
          />
        </div>

        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            كلمة المرور
          </label>
          <input
            type="password"
            className="input"
            placeholder="••••••••"
            dir="ltr"
          />
        </div>

        <button
          type="submit"
          className="btn-brand w-full py-3"
        >
          <span className="material-icons-outlined text-lg">login</span>
          تسجيل الدخول
        </button>
      </form>

      <p className="text-center text-sm text-grey-400 mt-6">
        ما عندك حساب؟{' '}
        <Link href="/register" className="text-brand-800 font-semibold hover:underline">
          سجّل الآن
        </Link>
      </p>
    </div>
  );
}
