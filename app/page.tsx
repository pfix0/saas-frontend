import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Header */}
      <header className="bg-brand-gradient text-white">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="font-tajawal text-2xl font-black">ساس</span>
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-white/80 hover:text-white transition-colors"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="bg-white text-brand-800 text-sm font-bold px-5 py-2 rounded-saas hover:bg-white/90 transition-colors"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="flex-1 flex items-center justify-center">
        <div className="max-w-2xl mx-auto px-6 py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-50 text-brand-800 text-xs font-bold px-4 py-1.5 rounded-full mb-6">
            <span className="material-icons-outlined text-sm">rocket_launch</span>
            منصة جاهزة — ابدأ البيع اليوم
          </div>
          
          <h1 className="font-tajawal text-4xl md:text-5xl font-black text-grey-900 leading-tight mb-6">
            متجرك الإلكتروني
            <br />
            <span className="text-brand-800">يبدأ من هنا</span>
          </h1>
          
          <p className="text-lg text-grey-500 leading-relaxed mb-10 max-w-lg mx-auto">
            ساس منصة تجارة إلكترونية سحابية تمكّنك من إنشاء وإدارة متجرك الرقمي خلال دقائق.
            استضافة، دفع، شحن — كل شيء في مكان واحد.
          </p>

          <div className="flex items-center justify-center gap-4">
            <Link
              href="/register"
              className="btn-brand text-base px-8 py-3"
            >
              <span className="material-icons-outlined text-lg">storefront</span>
              أنشئ متجرك
            </Link>
            <Link
              href="/login"
              className="btn-outline text-base px-8 py-3"
            >
              تسجيل الدخول
            </Link>
          </div>

          {/* Features grid */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-16">
            {[
              { icon: 'speed', label: 'إطلاق فوري' },
              { icon: 'payments', label: 'دفع إلكتروني' },
              { icon: 'local_shipping', label: 'شحن متكامل' },
              { icon: 'phone_android', label: 'متوافق جوال' },
            ].map((f) => (
              <div key={f.icon} className="bg-grey-50 rounded-saas p-4">
                <span className="material-icons-outlined text-brand-800 text-2xl mb-2 block">
                  {f.icon}
                </span>
                <span className="text-sm font-semibold text-grey-700">{f.label}</span>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-grey-100 py-6 text-center">
        <p className="text-xs text-grey-400">
          © {new Date().getFullYear()} ساس — منصة التجارة الإلكترونية
        </p>
      </footer>
    </div>
  );
}
