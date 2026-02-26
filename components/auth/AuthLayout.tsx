/**
 * ساس — Auth Layout (مشترك)
 * تصميم Split: جانب للبراندنج + جانب للنموذج
 * يستخدم في login و register
 */

import Link from 'next/link';

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col lg:flex-row">
      {/* ═══ الجانب الأيسر: البراندنج (Desktop فقط) ═══ */}
      <div className="hidden lg:flex lg:w-[45%] bg-brand-gradient relative overflow-hidden">
        {/* زخارف الخلفية */}
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute -top-32 -right-20 w-[400px] h-[400px] bg-white/[0.03] rounded-full" />
          <div className="absolute -bottom-40 -left-28 w-[500px] h-[500px] bg-white/[0.02] rounded-full" />
          <div className="absolute top-[45%] left-[35%] w-[180px] h-[180px] bg-white/[0.04] rounded-full" />
        </div>

        {/* المحتوى */}
        <div className="relative z-10 flex flex-col justify-center px-14 xl:px-16 py-12 w-full">
          {/* الشعار */}
          <Link href="/" className="inline-flex items-center gap-1 mb-14">
            <span className="font-tajawal text-3xl font-black text-white">ساس</span>
            <span className="w-1.5 h-1.5 bg-white rounded-full" />
          </Link>

          {/* الرسالة */}
          <h2 className="text-white text-3xl xl:text-[2.2rem] font-extrabold font-tajawal leading-tight mb-4">
            ابدأ البيع بثبات.
          </h2>
          <p className="text-white/60 text-[0.92rem] leading-relaxed max-w-[320px]">
            منصة تجارة إلكترونية سحابية تمكّنك من إنشاء وإدارة متجرك الرقمي بكل سهولة.
          </p>

          {/* الميزات */}
          <div className="mt-12 space-y-4">
            {[
              { icon: 'rocket_launch', text: 'إطلاق متجرك خلال دقائق' },
              { icon: 'smartphone', text: 'متوافق ١٠٠% مع الجوال' },
              { icon: 'payments', text: 'بوابات دفع محلية (SADAD + SkipCash)' },
              { icon: 'local_shipping', text: 'ربط شحن تلقائي (Aramex + DHL)' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3.5 text-white/70">
                <div className="w-9 h-9 rounded-[10px] bg-white/[0.08] flex items-center justify-center flex-shrink-0">
                  <span className="material-icons-outlined text-[18px]">{f.icon}</span>
                </div>
                <span className="text-[0.82rem] font-medium">{f.text}</span>
              </div>
            ))}
          </div>

          {/* فوتر */}
          <p className="mt-auto pt-14 text-white/25 text-xs">
            © {new Date().getFullYear()} ساس — منصتك تبدأ من هنا
          </p>
        </div>
      </div>

      {/* ═══ الجانب الأيمن: النموذج ═══ */}
      <div className="flex-1 flex flex-col min-h-screen bg-white">
        {/* شعار الجوال */}
        <div className="lg:hidden bg-brand-gradient px-6 py-7 text-center">
          <Link href="/" className="inline-flex items-center gap-1">
            <span className="font-tajawal text-2xl font-black text-white">ساس</span>
            <span className="w-1 h-1 bg-white rounded-full" />
          </Link>
          <p className="text-white/50 text-xs mt-1.5">ابدأ البيع بثبات</p>
        </div>

        {/* النموذج */}
        <div className="flex-1 flex items-center justify-center px-6 py-10">
          <div className="w-full max-w-[420px]">
            {children}
          </div>
        </div>

        {/* فوتر */}
        <p className="text-center text-xs text-grey-300 pb-6 lg:hidden">
          © {new Date().getFullYear()} ساس — جميع الحقوق محفوظة
        </p>
      </div>
    </div>
  );
}
