/**
 * ساس — Storefront Layout
 * 
 * Public-facing store layout with Header + Footer
 * Will be fully implemented in Session 4
 */

export default function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { store: string };
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* Store Header - will be dynamic in Session 4 */}
      <header className="bg-white border-b border-grey-100 sticky top-0 z-30">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <span className="font-tajawal text-lg font-bold text-grey-900">
            {decodeURIComponent(params.store)}
          </span>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-lg hover:bg-grey-50">
              <span className="material-icons-outlined text-grey-500">search</span>
            </button>
            <button className="p-2 rounded-lg hover:bg-grey-50 relative">
              <span className="material-icons-outlined text-grey-500">shopping_cart</span>
              <span className="absolute -top-0.5 -left-0.5 w-4 h-4 bg-brand-800 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                0
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* Page Content */}
      <main className="flex-1">
        {children}
      </main>

      {/* Store Footer */}
      <footer className="bg-grey-50 border-t border-grey-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-grey-400">
            متجر مدعوم بـ{' '}
            <a href="/" className="text-brand-800 font-semibold">ساس</a>
          </p>
        </div>
      </footer>
    </div>
  );
}
