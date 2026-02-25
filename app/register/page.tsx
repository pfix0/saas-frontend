import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'إنشاء حساب جديد',
};

export default function RegisterPage() {
  return (
    <div>
      <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-2">
        أنشئ متجرك
      </h1>
      <p className="text-sm text-grey-400 mb-8">
        سجّل الآن وابدأ البيع خلال دقائق
      </p>

      {/* Register form - will be implemented in Session 2 */}
      <form className="space-y-4">
        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            اسمك الكامل
          </label>
          <input type="text" className="input" placeholder="محمد أحمد" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            البريد الإلكتروني
          </label>
          <input type="email" className="input" placeholder="email@example.com" dir="ltr" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            رقم الجوال
          </label>
          <input type="tel" className="input" placeholder="+974 XXXX XXXX" dir="ltr" />
        </div>

        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            اسم المتجر
          </label>
          <input type="text" className="input" placeholder="متجر العطور" />
          <p className="text-xs text-grey-400 mt-1">
            سيكون رابط متجرك: <span className="font-mono text-brand-800" dir="ltr">store-name.saas.qa</span>
          </p>
        </div>

        <div>
          <label className="block text-sm font-semibold text-grey-700 mb-1.5">
            كلمة المرور
          </label>
          <input type="password" className="input" placeholder="٨ أحرف على الأقل" dir="ltr" />
        </div>

        <button type="submit" className="btn-brand w-full py-3">
          <span className="material-icons-outlined text-lg">storefront</span>
          أنشئ متجرك مجاناً
        </button>
      </form>

      <p className="text-center text-sm text-grey-400 mt-6">
        عندك حساب؟{' '}
        <Link href="/login" className="text-brand-800 font-semibold hover:underline">
          سجّل دخولك
        </Link>
      </p>
    </div>
  );
}
