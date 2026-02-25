export default function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { store: string };
}) {
  return (
    <div className="min-h-screen bg-white flex flex-col">
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
            </button>
          </div>
        </div>
      </header>
      <main className="flex-1">{children}</main>
      <footer className="bg-grey-50 border-t border-grey-100 py-8">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-xs text-grey-400">متجر مدعوم بـ <a href="/" className="text-brand-800 font-semibold">ساس</a></p>
        </div>
      </footer>
    </div>
  );
}
