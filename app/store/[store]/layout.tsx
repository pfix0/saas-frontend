'use client';

/**
 * ساس — Storefront Layout (محادثة ٨: بحث فوري + مفضلة + صفحات)
 */

import { useEffect, useState, useRef, useCallback } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';
import { useWishlistStore } from '@/stores/wishlist';

interface StoreData {
  id: string; name: string; slug: string;
  logo_url?: string; description?: string;
  currency: string; status?: string;
}
interface SearchResult {
  id: string; name: string; slug: string; price: number; sale_price?: number; image?: string;
}
interface PageLink { id: string; title: string; slug: string; }

export default function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: { store: string };
}) {
  const { store } = params;
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<SearchResult[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [pages, setPages] = useState<PageLink[]>([]);
  const searchRef = useRef<HTMLDivElement>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();

  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();
  const { count: wishlistCount } = useWishlistStore();

  const base = `/store/${store}`;
  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    fetch(`/api/store/${store}`)
      .then(r => r.json())
      .then(d => { if (d.success) setStoreData(d.data); else setNotFound(true); })
      .catch(() => setNotFound(true));
    fetch(`/api/store/${store}/pages`)
      .then(r => r.json())
      .then(d => { if (d.success) setPages(d.data); })
      .catch(() => {});
  }, [store]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSuggestions([]);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleSearch = useCallback((q: string) => {
    setSearchQuery(q);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (q.trim().length < 2) { setSuggestions([]); return; }
    setSearchLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/store/${store}/search?q=${encodeURIComponent(q)}&limit=6`);
        const data = await res.json();
        if (data.success) setSuggestions(data.data);
      } catch {} finally { setSearchLoading(false); }
    }, 300);
  }, [store]);

  const isTrial = storeData?.status === 'trial';

  if (notFound) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center">
          <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">storefront</span>
          <h1 className="font-tajawal text-2xl font-bold text-grey-800 mb-2">المتجر غير موجود</h1>
          <p className="text-grey-400 text-sm mb-6">تأكد من الرابط أو تواصل مع صاحب المتجر</p>
          <Link href="/" className="text-brand-800 text-sm font-semibold hover:underline">العودة للرئيسية</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {isTrial && (
        <div className="bg-amber-50 border-b border-amber-200">
          <div className="max-w-6xl mx-auto px-4 py-2 flex items-center justify-center gap-2">
            <span className="material-icons-outlined text-amber-500 text-sm">info</span>
            <p className="text-xs text-amber-700 font-semibold">هذا المتجر في الوضع التجريبي — معاينة فقط</p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white border-b border-grey-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          <Link href={base} className="flex items-center gap-2.5 min-w-0">
            {storeData?.logo_url ? (
              <img src={storeData.logo_url} alt={storeData.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center flex-shrink-0">
                <span className="font-tajawal text-white text-sm font-black">{storeData?.name?.[0] || '...'}</span>
              </div>
            )}
            <span className="font-tajawal text-base font-bold text-grey-900 truncate">{storeData?.name || ''}</span>
          </Link>
          <nav className="hidden md:flex items-center gap-6">
            <Link href={base} className="text-sm text-grey-600 hover:text-grey-900 transition-colors">الرئيسية</Link>
            <Link href={`${base}/products`} className="text-sm text-grey-600 hover:text-grey-900 transition-colors">المنتجات</Link>
            <Link href={`${base}/account`} className="text-sm text-grey-600 hover:text-grey-900 transition-colors">حسابي</Link>
          </nav>
          <div className="flex items-center gap-1">
            <button onClick={() => { setSearchOpen(!searchOpen); setSuggestions([]); setSearchQuery(''); }}
              className="p-2 rounded-xl hover:bg-grey-50 transition-colors">
              <span className="material-icons-outlined text-grey-500 text-xl">search</span>
            </button>
            <Link href={`${base}/wishlist`} className="p-2 rounded-xl hover:bg-grey-50 transition-colors relative">
              <span className="material-icons-outlined text-grey-500 text-xl">favorite_border</span>
              {wishlistCount() > 0 && (
                <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[0.55rem] font-bold rounded-full flex items-center justify-center">{wishlistCount()}</span>
              )}
            </Link>
            <Link href={`${base}/account`} className="p-2 rounded-xl hover:bg-grey-50 transition-colors hidden sm:block">
              <span className="material-icons-outlined text-grey-500 text-xl">person_outline</span>
            </Link>
            <button onClick={() => setCartOpen(true)} className="p-2 rounded-xl hover:bg-grey-50 transition-colors relative">
              <span className="material-icons-outlined text-grey-500 text-xl">shopping_bag</span>
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -left-0.5 w-5 h-5 bg-brand-800 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">{totalItems()}</span>
              )}
            </button>
          </div>
        </div>

        {/* Search with Suggestions */}
        {searchOpen && (
          <div className="border-t border-grey-100 bg-grey-50/50" ref={searchRef}>
            <div className="max-w-6xl mx-auto px-4 py-3 relative">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) { window.location.href = `${base}/products?search=${encodeURIComponent(searchQuery)}`; setSuggestions([]); } }}
                className="relative">
                <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
                <input type="text" value={searchQuery} onChange={(e) => handleSearch(e.target.value)}
                  placeholder="ابحث عن منتج..." autoFocus
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm placeholder:text-grey-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
                {searchLoading && <span className="material-icons-outlined absolute left-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg animate-spin">sync</span>}
              </form>
              {suggestions.length > 0 && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl border border-grey-200 shadow-xl z-50 overflow-hidden max-h-80 overflow-y-auto">
                  {suggestions.map((item) => (
                    <Link key={item.id} href={`${base}/product/${item.slug}`}
                      onClick={() => { setSearchOpen(false); setSuggestions([]); }}
                      className="flex items-center gap-3 px-4 py-3 hover:bg-grey-50 transition-colors border-b border-grey-50 last:border-0">
                      <div className="w-10 h-10 rounded-lg bg-grey-100 flex-shrink-0 overflow-hidden">
                        {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : (
                          <div className="w-full h-full flex items-center justify-center"><span className="material-icons-outlined text-grey-300 text-sm">inventory_2</span></div>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-grey-800 truncate">{item.name}</p>
                        <p className="text-xs font-bold text-brand-800">{fmtPrice(item.sale_price || item.price)} <span className="text-grey-400 font-normal">ر.ق</span></p>
                      </div>
                      <span className="material-icons-outlined text-grey-300 text-lg">arrow_back</span>
                    </Link>
                  ))}
                  <Link href={`${base}/products?search=${encodeURIComponent(searchQuery)}`}
                    onClick={() => { setSearchOpen(false); setSuggestions([]); }}
                    className="block px-4 py-2.5 text-center text-xs font-semibold text-brand-800 bg-brand-50/50 hover:bg-brand-50 transition-colors">
                    عرض كل النتائج
                  </Link>
                </div>
              )}
              {searchQuery.trim().length >= 2 && suggestions.length === 0 && !searchLoading && (
                <div className="absolute left-4 right-4 top-full mt-1 bg-white rounded-xl border border-grey-200 shadow-xl z-50 p-6 text-center">
                  <span className="material-icons-outlined text-3xl text-grey-200 block mb-2">search_off</span>
                  <p className="text-sm text-grey-400">لا توجد نتائج</p>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-grey-50 border-t border-grey-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-6">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <div className="w-7 h-7 rounded bg-brand-800 flex items-center justify-center">
                  <span className="font-tajawal text-white text-xs font-black">{storeData?.name?.[0] || 'S'}</span>
                </div>
                <span className="font-tajawal text-sm font-bold text-grey-700">{storeData?.name}</span>
              </div>
              {storeData?.description && <p className="text-xs text-grey-400 leading-relaxed">{storeData.description}</p>}
            </div>
            <div>
              <h4 className="font-tajawal text-xs font-bold text-grey-600 mb-3">روابط سريعة</h4>
              <div className="space-y-2">
                <Link href={base} className="block text-xs text-grey-400 hover:text-grey-600">الرئيسية</Link>
                <Link href={`${base}/products`} className="block text-xs text-grey-400 hover:text-grey-600">المنتجات</Link>
                <Link href={`${base}/wishlist`} className="block text-xs text-grey-400 hover:text-grey-600">المفضلة</Link>
                <Link href={`${base}/account`} className="block text-xs text-grey-400 hover:text-grey-600">حسابي</Link>
              </div>
            </div>
            {pages.length > 0 && (
              <div>
                <h4 className="font-tajawal text-xs font-bold text-grey-600 mb-3">معلومات</h4>
                <div className="space-y-2">
                  {pages.map((pg) => (
                    <Link key={pg.id} href={`${base}/page/${pg.slug}`} className="block text-xs text-grey-400 hover:text-grey-600">{pg.title}</Link>
                  ))}
                </div>
              </div>
            )}
          </div>
          <div className="border-t border-grey-200/50 pt-4 text-center">
            <p className="text-[0.65rem] text-grey-300">مدعوم بـ <a href="/" className="text-brand-800 font-semibold hover:underline">ساس</a></p>
          </div>
        </div>
      </footer>

      {/* Cart Drawer */}
      {isOpen && (<>
        <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
        <div className="fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-left">
          <div className="flex items-center justify-between px-5 py-4 border-b border-grey-100">
            <div className="flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-xl">shopping_bag</span>
              <h2 className="font-tajawal text-base font-bold text-grey-900">سلة المشتريات</h2>
              <span className="text-xs bg-grey-100 text-grey-500 px-2 py-0.5 rounded-full font-semibold">{totalItems()}</span>
            </div>
            <button onClick={() => setCartOpen(false)} className="p-1.5 rounded-lg hover:bg-grey-100">
              <span className="material-icons-outlined text-grey-400 text-xl">close</span>
            </button>
          </div>
          <div className="flex-1 overflow-y-auto p-5">
            {items.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <span className="material-icons-outlined text-5xl text-grey-200 mb-3">shopping_bag</span>
                <p className="text-grey-400 text-sm mb-1">السلة فارغة</p>
              </div>
            ) : (
              <div className="space-y-4">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3">
                    <div className="w-16 h-16 rounded-xl bg-grey-100 flex-shrink-0 overflow-hidden">
                      {item.image ? <img src={item.image} alt={item.name} className="w-full h-full object-cover" /> : (
                        <div className="w-full h-full flex items-center justify-center"><span className="material-icons-outlined text-grey-300 text-lg">inventory_2</span></div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grey-800 truncate">{item.name}</p>
                      <p className="text-sm font-bold text-brand-800 mt-0.5">{fmtPrice(item.salePrice || item.price)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="w-6 h-6 rounded-md bg-grey-100 hover:bg-grey-200 flex items-center justify-center"><span className="material-icons-outlined text-grey-500 text-xs">remove</span></button>
                        <span className="text-sm font-semibold text-grey-700 w-6 text-center">{item.quantity}</span>
                        <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="w-6 h-6 rounded-md bg-grey-100 hover:bg-grey-200 flex items-center justify-center"><span className="material-icons-outlined text-grey-500 text-xs">add</span></button>
                        <button onClick={() => removeItem(item.id)} className="mr-auto p-1 hover:bg-red-50 rounded"><span className="material-icons-outlined text-grey-300 hover:text-red-400 text-sm">delete</span></button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          {items.length > 0 && (
            <div className="border-t border-grey-100 p-5 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-grey-500">المجموع</span>
                <span className="font-tajawal text-xl font-bold text-grey-900">{fmtPrice(totalPrice())} <span className="text-xs text-grey-400 font-normal">ر.ق</span></span>
              </div>
              <Link href={`${base}/cart`} onClick={() => setCartOpen(false)} className="block w-full py-3 rounded-xl bg-brand-800 text-white text-center text-sm font-bold hover:bg-brand-700 transition-all">إتمام الطلب</Link>
            </div>
          )}
        </div>
      </>)}

      {/* Mobile Bottom Nav */}
      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-grey-100 z-30 sm:hidden safe-area-bottom">
        <div className="flex items-center justify-around h-14">
          <Link href={base} className="flex flex-col items-center gap-0.5 text-grey-400"><span className="material-icons-outlined text-xl">home</span><span className="text-[0.6rem] font-semibold">الرئيسية</span></Link>
          <Link href={`${base}/products`} className="flex flex-col items-center gap-0.5 text-grey-400"><span className="material-icons-outlined text-xl">grid_view</span><span className="text-[0.6rem] font-semibold">المنتجات</span></Link>
          <Link href={`${base}/wishlist`} className="flex flex-col items-center gap-0.5 text-grey-400 relative"><span className="material-icons-outlined text-xl">favorite_border</span><span className="text-[0.6rem] font-semibold">المفضلة</span></Link>
          <Link href={`${base}/account`} className="flex flex-col items-center gap-0.5 text-grey-400"><span className="material-icons-outlined text-xl">person_outline</span><span className="text-[0.6rem] font-semibold">حسابي</span></Link>
        </div>
      </nav>

      <style jsx global>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1); }
        .safe-area-bottom { padding-bottom: env(safe-area-inset-bottom, 0); }
        @media (max-width: 640px) { main { padding-bottom: 60px; } }
      `}</style>
    </div>
  );
}
