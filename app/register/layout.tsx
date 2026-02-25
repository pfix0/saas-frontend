import Link from 'next/link';

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-grey-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-tajawal text-3xl font-black text-brand-800">ساس</span>
            <span className="w-1.5 h-1.5 bg-brand-800 rounded-full" />
          </Link>
          <p className="text-sm text-grey-400 mt-2">منصة التجارة الإلكترونية</p>
        </div>
        <div className="bg-white rounded-saas shadow-saas border border-grey-100 p-8">{children}</div>
        <p className="text-center text-xs text-grey-400 mt-6">© 2026 ساس — جميع الحقوق محفوظة</p>
      </div>
    </div>
  );
}
