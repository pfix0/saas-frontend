import Link from 'next/link';

const features = [
  {
    icon: 'bolt',
    title: 'إطلاق فوري',
    desc: 'متجرك جاهز خلال دقائق. بدون برمجة أو تعقيد.',
  },
  {
    icon: 'account_balance_wallet',
    title: 'بوابات دفع متكاملة',
    desc: 'سكايب كاش، سداد، وبوابات دفع محلية ودولية.',
  },
  {
    icon: 'local_shipping',
    title: 'شحن ذكي',
    desc: 'تكامل مع أرامكس و DHL وشركات الشحن المحلية.',
  },
  {
    icon: 'bar_chart',
    title: 'تقارير مفصّلة',
    desc: 'تابع مبيعاتك وأرباحك بلوحة تحكم واضحة.',
  },
  {
    icon: 'devices',
    title: 'متوافق مع كل الأجهزة',
    desc: 'متجرك يعمل بشكل مثالي على الجوال والكمبيوتر.',
  },
  {
    icon: 'support_agent',
    title: 'دعم عربي محلي',
    desc: 'فريق دعم يتحدث لغتك ويفهم سوقك.',
  },
];

const plans = [
  {
    name: 'أساس',
    price: '49',
    desc: 'للمشاريع الجديدة',
    features: ['50 منتج', 'موظف واحد', 'دومين فرعي', 'بوابة دفع واحدة', 'دعم بالبريد'],
    cta: 'ابدأ مجاناً',
    popular: false,
  },
  {
    name: 'نمو',
    price: '149',
    desc: 'للمتاجر النشطة',
    features: ['500 منتج', '3 موظفين', 'دومين مخصص', 'جميع بوابات الدفع', 'شحن متكامل', 'تقارير متقدمة', 'دعم أولوية'],
    cta: 'جرّب 14 يوم مجاناً',
    popular: true,
  },
  {
    name: 'احتراف',
    price: '349',
    desc: 'للمتاجر الكبيرة',
    features: ['منتجات غير محدودة', 'موظفين غير محدود', 'دومين مخصص', 'API مفتوح', 'تكاملات متقدمة', 'مدير حساب مخصص', 'دعم 24/7'],
    cta: 'تواصل معنا',
    popular: false,
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Navbar */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-lg border-b border-grey-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-1.5">
            <span className="font-tajawal text-2xl font-black text-brand-800">ساس</span>
            <span className="w-1.5 h-1.5 bg-brand-800 rounded-full" />
          </Link>
          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-grey-500">
            <a href="#features" className="hover:text-brand-800 transition-colors">المميزات</a>
            <a href="#pricing" className="hover:text-brand-800 transition-colors">الباقات</a>
          </nav>
          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-sm font-semibold text-grey-600 hover:text-brand-800 transition-colors"
            >
              دخول
            </Link>
            <Link
              href="/register"
              className="bg-brand-800 text-white text-sm font-bold px-5 py-2.5 rounded-xl hover:bg-brand-700 transition-all shadow-sm hover:shadow-md"
            >
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] rounded-full bg-brand-800/[0.03] blur-3xl" />
          <div className="absolute bottom-0 right-0 w-[400px] h-[400px] rounded-full bg-brand-800/[0.02] blur-2xl" />
        </div>

        <div className="max-w-4xl mx-auto px-6 pt-20 pb-24 text-center">
          <div className="inline-flex items-center gap-2 bg-brand-800/5 text-brand-800 text-xs font-bold px-4 py-2 rounded-full mb-8 border border-brand-800/10">
            <span className="material-icons-outlined text-base">rocket_launch</span>
            منصة جاهزة — ابدأ البيع اليوم
          </div>

          <h1 className="font-tajawal text-5xl md:text-6xl lg:text-7xl font-black text-grey-900 leading-[1.15] mb-8">
            متجرك الإلكتروني
            <br />
            <span className="text-brand-800">يبدأ من هنا</span>
          </h1>

          <p className="text-lg md:text-xl text-grey-400 leading-relaxed mb-12 max-w-2xl mx-auto">
            ساس منصة تجارة إلكترونية سحابية تمكّنك من إنشاء وإدارة متجرك الرقمي
            خلال دقائق — استضافة، دفع، شحن، تقارير — كل شيء في مكان واحد.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-16">
            <Link
              href="/register"
              className="group bg-brand-800 text-white text-base font-bold px-10 py-4 rounded-2xl hover:bg-brand-700 transition-all shadow-lg hover:shadow-xl flex items-center gap-3"
            >
              <span className="material-icons-outlined text-xl">storefront</span>
              أنشئ متجرك مجاناً
              <span className="material-icons-outlined text-lg opacity-60 group-hover:opacity-100 group-hover:-translate-x-1 transition-all">arrow_back</span>
            </Link>
            <Link
              href="/login"
              className="text-base font-semibold text-grey-500 px-8 py-4 rounded-2xl border-2 border-grey-200 hover:border-brand-800 hover:text-brand-800 transition-all"
            >
              لديك حساب؟ سجّل دخولك
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-6 max-w-lg mx-auto">
            {[
              { number: '٣٠', unit: 'ثانية', label: 'لإنشاء متجرك' },
              { number: '٠٪', unit: '', label: 'عمولة على باقة أساس' },
              { number: '٢٤/٧', unit: '', label: 'دعم فني متواصل' },
            ].map((s) => (
              <div key={s.label} className="text-center">
                <div className="font-tajawal text-3xl font-black text-brand-800">
                  {s.number}<span className="text-lg font-bold text-grey-400 mr-0.5">{s.unit}</span>
                </div>
                <div className="text-xs text-grey-400 mt-1">{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features */}
      <section id="features" className="bg-grey-50/50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-tajawal text-3xl md:text-4xl font-black text-grey-900 mb-4">
              كل ما تحتاجه لتجارتك
            </h2>
            <p className="text-grey-400 text-lg max-w-xl mx-auto">
              أدوات متكاملة تغنيك عن عشرات الخدمات المنفصلة
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f) => (
              <div
                key={f.icon}
                className="bg-white rounded-2xl p-8 border border-grey-100 hover:border-brand-800/20 hover:shadow-lg transition-all duration-300 group"
              >
                <div className="w-12 h-12 rounded-xl bg-brand-800/5 flex items-center justify-center mb-5 group-hover:bg-brand-800/10 transition-colors">
                  <span className="material-icons-outlined text-brand-800 text-2xl">{f.icon}</span>
                </div>
                <h3 className="font-tajawal text-lg font-bold text-grey-900 mb-2">{f.title}</h3>
                <p className="text-sm text-grey-400 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-tajawal text-3xl md:text-4xl font-black text-grey-900 mb-4">
              ثلاث خطوات فقط
            </h2>
            <p className="text-grey-400 text-lg">من التسجيل إلى أول طلب</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {[
              { step: '١', icon: 'person_add', title: 'سجّل حسابك', desc: 'أدخل بياناتك الأساسية واختر اسم متجرك.' },
              { step: '٢', icon: 'inventory_2', title: 'أضف منتجاتك', desc: 'ارفع الصور، حدد الأسعار، وصنّف منتجاتك.' },
              { step: '٣', icon: 'shopping_bag', title: 'ابدأ البيع', desc: 'شارك رابط متجرك واستقبل أول طلب.' },
            ].map((item) => (
              <div key={item.step} className="text-center">
                <div className="relative inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-brand-800 text-white mb-6 shadow-lg">
                  <span className="material-icons-outlined text-3xl">{item.icon}</span>
                  <span className="absolute -top-2 -right-2 w-7 h-7 bg-white text-brand-800 rounded-full font-tajawal font-black text-sm flex items-center justify-center shadow border border-grey-100">
                    {item.step}
                  </span>
                </div>
                <h3 className="font-tajawal text-lg font-bold text-grey-900 mb-2">{item.title}</h3>
                <p className="text-sm text-grey-400">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing */}
      <section id="pricing" className="bg-grey-50/50 py-24">
        <div className="max-w-5xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="font-tajawal text-3xl md:text-4xl font-black text-grey-900 mb-4">
              باقات واضحة — بدون مفاجآت
            </h2>
            <p className="text-grey-400 text-lg">اختر الباقة المناسبة لحجم تجارتك</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 items-start">
            {plans.map((plan) => (
              <div
                key={plan.name}
                className={`rounded-2xl p-8 transition-all ${
                  plan.popular
                    ? 'bg-brand-800 text-white shadow-xl scale-[1.03] border-2 border-brand-800'
                    : 'bg-white border border-grey-200 hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="inline-flex items-center gap-1 bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full mb-4">
                    <span className="material-icons-outlined text-xs">star</span>
                    الأكثر طلباً
                  </div>
                )}
                <h3 className={`font-tajawal text-xl font-bold mb-1 ${plan.popular ? 'text-white' : 'text-grey-900'}`}>
                  {plan.name}
                </h3>
                <p className={`text-sm mb-6 ${plan.popular ? 'text-white/70' : 'text-grey-400'}`}>
                  {plan.desc}
                </p>
                <div className="flex items-baseline gap-1 mb-8">
                  <span className={`font-tajawal text-4xl font-black ${plan.popular ? 'text-white' : 'text-grey-900'}`}>
                    {plan.price}
                  </span>
                  <span className={`text-sm ${plan.popular ? 'text-white/60' : 'text-grey-400'}`}>ر.ق / شهرياً</span>
                </div>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((f) => (
                    <li key={f} className="flex items-center gap-2 text-sm">
                      <span className={`material-icons-outlined text-base ${plan.popular ? 'text-white/80' : 'text-green-600'}`}>
                        check_circle
                      </span>
                      <span className={plan.popular ? 'text-white/90' : 'text-grey-600'}>{f}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href="/register"
                  className={`block text-center font-bold text-sm py-3.5 rounded-xl transition-all ${
                    plan.popular
                      ? 'bg-white text-brand-800 hover:bg-white/90 shadow-md'
                      : 'border-2 border-brand-800 text-brand-800 hover:bg-brand-800 hover:text-white'
                  }`}
                >
                  {plan.cta}
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <div className="bg-brand-800 rounded-3xl p-12 md:p-16 text-white shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-br from-white/5 to-transparent" />
            <div className="relative">
              <h2 className="font-tajawal text-3xl md:text-4xl font-black mb-4">
                جاهز تبدأ تجارتك؟
              </h2>
              <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                أنشئ متجرك الآن وابدأ البيع خلال دقائق. بدون التزام.
              </p>
              <Link
                href="/register"
                className="inline-flex items-center gap-2 bg-white text-brand-800 font-bold text-base px-10 py-4 rounded-2xl hover:bg-white/90 transition-all shadow-lg"
              >
                <span className="material-icons-outlined">storefront</span>
                أنشئ متجرك مجاناً
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-grey-100 py-10">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-1.5">
              <span className="font-tajawal text-xl font-black text-brand-800">ساس</span>
              <span className="w-1 h-1 bg-brand-800 rounded-full" />
              <span className="text-xs text-grey-400 mr-2">منصة التجارة الإلكترونية</span>
            </div>
            <div className="flex items-center gap-6 text-sm text-grey-400">
              <a href="#features" className="hover:text-brand-800 transition-colors">المميزات</a>
              <a href="#pricing" className="hover:text-brand-800 transition-colors">الباقات</a>
              <a href="mailto:support@saas.qa" className="hover:text-brand-800 transition-colors">تواصل معنا</a>
            </div>
            <p className="text-xs text-grey-300">
              © {new Date().getFullYear()} ساس — جميع الحقوق محفوظة
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}
