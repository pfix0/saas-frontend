'use client';

/**
 * ساس — Storefront Layout
 * Header ديناميكي + Cart Drawer + Footer
 */

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

interface StoreData {
  id: string; name: string; slug: string;
  logo_url?: string; description?: string;
  currency: string;
}

export default function StorefrontLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ store: string }>;
}) {
  const { store } = use(params);
  const [storeData, setStoreData] = useState<StoreData | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const { items, isOpen, setCartOpen, removeItem, updateQuantity, totalItems, totalPrice } = useCartStore();

  const base = `/store/${store}`;
  const fmtPrice = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    fetch(`/api/store/${store}`)
      .then(r => r.json())
      .then(d => { if (d.success) setStoreData(d.data); else setNotFound(true); })
      .catch(() => setNotFound(true));
  }, [store]);

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
      {/* ═══ Header ═══ */}
      <header className="bg-white border-b border-grey-100 sticky top-0 z-40">
        <div className="max-w-6xl mx-auto px-4 h-14 flex items-center justify-between">
          {/* Logo / Name */}
          <Link href={base} className="flex items-center gap-2.5 min-w-0">
            {storeData?.logo_url ? (
              <img src={storeData.logo_url} alt={storeData.name} className="w-8 h-8 rounded-lg object-cover" />
            ) : (
              <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center flex-shrink-0">
                <span className="font-tajawal text-white text-sm font-black">{storeData?.name?.[0] || '...'}</span>
              </div>
            )}
            <span className="font-tajawal text-base font-bold text-grey-900 truncate">
              {storeData?.name || <span className="bg-grey-100 rounded w-24 h-4 inline-block animate-pulse" />}
            </span>
          </Link>

          {/* Nav Links — desktop */}
          <nav className="hidden md:flex items-center gap-6">
            <Link href={base} className="text-sm text-grey-600 hover:text-grey-900 transition-colors">الرئيسية</Link>
            <Link href={`${base}/products`} className="text-sm text-grey-600 hover:text-grey-900 transition-colors">المنتجات</Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-1">
            {/* Search */}
            <button onClick={() => setSearchOpen(!searchOpen)} className="p-2 rounded-xl hover:bg-grey-50 transition-colors">
              <span className="material-icons-outlined text-grey-500 text-xl">search</span>
            </button>
            {/* Cart */}
            <button onClick={() => setCartOpen(true)} className="p-2 rounded-xl hover:bg-grey-50 transition-colors relative">
              <span className="material-icons-outlined text-grey-500 text-xl">shopping_bag</span>
              {totalItems() > 0 && (
                <span className="absolute -top-0.5 -left-0.5 w-5 h-5 bg-brand-800 text-white text-[0.6rem] font-bold rounded-full flex items-center justify-center">
                  {totalItems()}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search Bar */}
        {searchOpen && (
          <div className="border-t border-grey-100 bg-grey-50/50 animate-fade-in">
            <div className="max-w-6xl mx-auto px-4 py-3">
              <form onSubmit={(e) => { e.preventDefault(); if (searchQuery.trim()) window.location.href = `${base}/products?search=${encodeURIComponent(searchQuery)}`; }}
                className="relative">
                <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
                <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ابحث عن منتج..." autoFocus
                  className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm placeholder:text-grey-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
              </form>
            </div>
          </div>
        )}
      </header>

      {/* ═══ Main ═══ */}
      <main className="flex-1">{children}</main>

      {/* ═══ Footer ═══ */}
      <footer className="bg-grey-50 border-t border-grey-100 mt-auto">
        <div className="max-w-6xl mx-auto px-4 py-8">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded bg-brand-800 flex items-center justify-center">
                <span className="font-tajawal text-white text-xs font-black">{storeData?.name?.[0] || 'S'}</span>
              </div>
              <span className="font-tajawal text-sm font-bold text-grey-700">{storeData?.name}</span>
            </div>
            <div className="flex items-center gap-4 text-xs text-grey-400">
              <Link href={base} className="hover:text-grey-600">الرئيسية</Link>
              <Link href={`${base}/products`} className="hover:text-grey-600">المنتجات</Link>
            </div>
            <p className="text-[0.65rem] text-grey-300">
              مدعوم بـ <a href="/" className="text-brand-800 font-semibold hover:underline">ساس</a>
            </p>
          </div>
        </div>
      </footer>

      {/* ═══ Cart Drawer ═══ */}
      {isOpen && (
        <>
          <div className="fixed inset-0 bg-black/30 z-50 backdrop-blur-sm" onClick={() => setCartOpen(false)} />
          <div className="fixed top-0 left-0 h-full w-full max-w-md bg-white z-50 shadow-2xl flex flex-col animate-slide-in-left">
            {/* Cart Header */}
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

            {/* Cart Items */}
            <div className="flex-1 overflow-y-auto p-5">
              {items.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center">
                  <span className="material-icons-outlined text-5xl text-grey-200 mb-3">shopping_bag</span>
                  <p className="text-grey-400 text-sm mb-1">السلة فارغة</p>
                  <p className="text-grey-300 text-xs">أضف منتجات للبدء</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {items.map((item) => (
                    <div key={item.id} className="flex gap-3">
                      {/* Image */}
                      <div className="w-16 h-16 rounded-xl bg-grey-100 flex-shrink-0 overflow-hidden">
                        {item.image ? (
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-icons-outlined text-grey-300 text-lg">inventory_2</span>
                          </div>
                        )}
                      </div>
                      {/* Info */}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold text-grey-800 truncate">{item.name}</p>
                        <p className="text-sm font-bold text-brand-800 mt-0.5">
                          {fmtPrice(item.salePrice || item.price)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span>
                        </p>
                        {/* Quantity */}
                        <div className="flex items-center gap-2 mt-1.5">
                          <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="w-6 h-6 rounded-md bg-grey-100 hover:bg-grey-200 flex items-center justify-center transition-colors">
                            <span className="material-icons-outlined text-grey-500 text-xs">remove</span>
                          </button>
                          <span className="text-sm font-semibold text-grey-700 w-6 text-center">{item.quantity}</span>
                          <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="w-6 h-6 rounded-md bg-grey-100 hover:bg-grey-200 flex items-center justify-center transition-colors">
                            <span className="material-icons-outlined text-grey-500 text-xs">add</span>
                          </button>
                          <button onClick={() => removeItem(item.id)} className="mr-auto p-1 hover:bg-red-50 rounded transition-colors">
                            <span className="material-icons-outlined text-grey-300 hover:text-red-400 text-sm">delete</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Cart Footer */}
            {items.length > 0 && (
              <div className="border-t border-grey-100 p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-grey-500">المجموع</span>
                  <span className="font-tajawal text-xl font-bold text-grey-900">
                    {fmtPrice(totalPrice())} <span className="text-xs text-grey-400 font-normal">ر.ق</span>
                  </span>
                </div>
                <Link href={`${base}/cart`} onClick={() => setCartOpen(false)}
                  className="block w-full py-3 rounded-xl bg-brand-800 text-white text-center text-sm font-bold hover:bg-brand-700 transition-all">
                  إتمام الطلب
                </Link>
              </div>
            )}
          </div>
        </>
      )}

      {/* Animation styles */}
      <style jsx global>{`
        @keyframes slideInLeft { from { transform: translateX(-100%); } to { transform: translateX(0); } }
        .animate-slide-in-left { animation: slideInLeft 0.3s cubic-bezier(0.16,1,0.3,1); }
      `}</style>
    </div>
  );
}
