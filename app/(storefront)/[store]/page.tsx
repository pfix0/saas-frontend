/**
 * ساس — Storefront Home Page
 * Will be fully implemented in Session 4
 */

export default function StorefrontHome({
  params,
}: {
  params: { store: string };
}) {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12 text-center">
      <div className="bg-brand-gradient text-white rounded-saas p-12 mb-8">
        <h1 className="font-tajawal text-3xl font-black mb-3">
          مرحباً بكم في {decodeURIComponent(params.store)}
        </h1>
        <p className="text-white/80">متجرنا الإلكتروني — تسوّق بسهولة</p>
      </div>

      <div className="text-grey-300 py-12">
        <span className="material-icons-outlined text-5xl mb-3 block">storefront</span>
        <p className="text-sm">واجهة المتجر قيد الإعداد — ستكون جاهزة في المحادثة ٤</p>
      </div>
    </div>
  );
}
