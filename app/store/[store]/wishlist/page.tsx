'use client';

/**
 * ساس — محادثة ٨: صفحة المفضلة
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

interface WishlistItem {
  id: string; product_id: string; name: string; slug: string;
  price: number; sale_price?: number; image?: string; product_status: string;
  created_at: string;
}

export default function WishlistPage({ params }: { params: { store: string } }) {
  const { store } = params;
  const [items, setItems] = useState<WishlistItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [customerId, setCustomerId] = useState<string | null>(null);
  const { addItem } = useCartStore();
  const base = `/store/${store}`;

  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    const cid = localStorage.getItem(`saas_customer_${store}`);
    if (cid) {
      setCustomerId(cid);
      fetch(`/api/store/${store}/wishlist/${cid}`)
        .then(r => r.json())
        .then(d => { if (d.success) setItems(d.data); })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, [store]);

  const removeFromWishlist = async (productId: string) => {
    if (!customerId) return;
    try {
      await fetch(`/api/store/${store}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: customerId, product_id: productId }),
      });
      setItems(prev => prev.filter(i => i.product_id !== productId));
    } catch {}
  };

  const addToCart = (item: WishlistItem) => {
    addItem({
      id: item.product_id,
      name: item.name,
      price: item.price,
      salePrice: item.sale_price || undefined,
      image: item.image || undefined,
      quantity: 1,
    });
  };

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-12">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-grey-100 rounded w-32" />
          <div className="grid grid-cols-2 gap-4">
            {[1,2,3,4].map(i => <div key={i} className="h-64 bg-grey-100 rounded-xl" />)}
          </div>
        </div>
      </div>
    );
  }

  if (!customerId) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16 text-center">
        <span className="material-icons-outlined text-6xl text-grey-200 block mb-4">favorite_border</span>
        <h1 className="font-tajawal text-xl font-bold text-grey-800 mb-2">المفضلة</h1>
        <p className="text-grey-400 text-sm mb-6">سجل دخول لحفظ منتجاتك المفضلة</p>
        <Link href={`${base}/account`}
          className="inline-flex items-center gap-2 px-6 py-3 bg-brand-800 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all">
          <span className="material-icons-outlined text-lg">login</span>
          تسجيل الدخول
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <span className="material-icons-outlined text-brand-800 text-2xl">favorite</span>
          <h1 className="font-tajawal text-xl font-bold text-grey-900">المفضلة</h1>
          <span className="text-xs bg-grey-100 text-grey-500 px-2 py-0.5 rounded-full font-semibold">{items.length}</span>
        </div>
      </div>

      {items.length === 0 ? (
        <div className="text-center py-16">
          <span className="material-icons-outlined text-6xl text-grey-200 block mb-4">favorite_border</span>
          <p className="text-grey-400 text-sm mb-2">لا توجد منتجات في المفضلة</p>
          <Link href={`${base}/products`} className="text-brand-800 text-sm font-semibold hover:underline">تصفح المنتجات</Link>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
          {items.map((item) => (
            <div key={item.id} className="bg-white rounded-xl border border-grey-100 overflow-hidden group hover:shadow-lg transition-all">
              {/* Image */}
              <Link href={`${base}/product/${item.slug}`} className="block relative aspect-square bg-grey-50">
                {item.image ? (
                  <img src={item.image} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="material-icons-outlined text-4xl text-grey-200">inventory_2</span>
                  </div>
                )}
                {/* Remove button */}
                <button onClick={(e) => { e.preventDefault(); removeFromWishlist(item.product_id); }}
                  className="absolute top-2 left-2 w-8 h-8 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-red-50 transition-colors">
                  <span className="material-icons-outlined text-red-500 text-lg">favorite</span>
                </button>
                {/* Sale badge */}
                {item.sale_price && item.sale_price < item.price && (
                  <span className="absolute top-2 right-2 bg-red-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                    خصم {Math.round((1 - item.sale_price / item.price) * 100)}%
                  </span>
                )}
              </Link>

              {/* Info */}
              <div className="p-3">
                <Link href={`${base}/product/${item.slug}`}>
                  <h3 className="text-sm font-semibold text-grey-800 truncate mb-1">{item.name}</h3>
                </Link>
                <div className="flex items-center gap-2 mb-3">
                  <span className="text-sm font-bold text-brand-800">{fmtPrice(item.sale_price || item.price)}</span>
                  <span className="text-[0.6rem] text-grey-400">ر.ق</span>
                  {item.sale_price && item.sale_price < item.price && (
                    <span className="text-xs text-grey-300 line-through">{fmtPrice(item.price)}</span>
                  )}
                </div>
                <button onClick={() => addToCart(item)}
                  disabled={item.product_status !== 'active'}
                  className="w-full py-2 rounded-lg bg-brand-800 text-white text-xs font-bold hover:bg-brand-700 disabled:bg-grey-200 disabled:text-grey-400 transition-all flex items-center justify-center gap-1.5">
                  <span className="material-icons-outlined text-sm">add_shopping_cart</span>
                  {item.product_status === 'active' ? 'أضف للسلة' : 'غير متوفر'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
