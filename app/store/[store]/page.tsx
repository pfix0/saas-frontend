'use client';

/**
 * ساس — Storefront Homepage
 * Hero + Categories + Featured Products
 */

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

interface Product {
  id: string; name: string; slug: string; price: number;
  sale_price?: number; image?: string; category_name?: string; is_featured?: boolean;
}
interface Category { id: string; name: string; slug: string; image_url?: string; }

export default function StorefrontHome({ params }: { params: Promise<{ store: string }> }) {
  const { store } = use(params);
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [storeName, setStoreName] = useState('');
  const [loading, setLoading] = useState(true);
  const { addItem } = useCartStore();
  const base = `/store/${store}`;

  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    Promise.all([
      fetch(`/api/store/${store}`).then(r => r.json()),
      fetch(`/api/store/${store}/products?limit=8`).then(r => r.json()),
      fetch(`/api/store/${store}/categories`).then(r => r.json()),
    ]).then(([storeRes, prodRes, catRes]) => {
      if (storeRes.success) setStoreName(storeRes.data.name);
      if (prodRes.success) setProducts(prodRes.data);
      if (catRes.success) setCategories(catRes.data);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [store]);

  const featured = products.filter(p => p.is_featured);
  const latest = products.slice(0, 8);

  return (
    <div>
      {/* ═══ Hero ═══ */}
      <section className="relative overflow-hidden bg-gradient-to-bl from-brand-900 via-brand-800 to-brand-900">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 rounded-full bg-white/20 blur-3xl" />
          <div className="absolute bottom-10 left-20 w-48 h-48 rounded-full bg-white/10 blur-3xl" />
        </div>
        <div className="max-w-6xl mx-auto px-4 py-16 md:py-24 relative z-10 text-center">
          <h1 className="font-tajawal text-3xl md:text-5xl font-black text-white mb-4 leading-tight">
            {storeName || <span className="bg-white/10 rounded-lg inline-block w-48 h-10 animate-pulse" />}
          </h1>
          <p className="text-white/60 text-sm md:text-base max-w-md mx-auto mb-8">
            تسوّق من أفضل المنتجات بأسعار مناسبة وتوصيل سريع
          </p>
          <Link href={`${base}/products`}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-white text-brand-800 text-sm font-bold hover:bg-grey-50 transition-all shadow-lg shadow-black/20">
            <span className="material-icons-outlined text-lg">storefront</span>
            تصفح المنتجات
          </Link>
        </div>
      </section>

      {/* ═══ Categories ═══ */}
      {categories.length > 0 && (
        <section className="max-w-6xl mx-auto px-4 py-10">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-tajawal text-lg font-bold text-grey-900">التصنيفات</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {categories.map((cat) => (
              <Link key={cat.id} href={`${base}/products?category=${cat.slug}`}
                className="group relative overflow-hidden rounded-2xl bg-grey-50 border border-grey-100 hover:border-brand-200 p-5 text-center transition-all hover:shadow-md">
                <div className="w-12 h-12 mx-auto mb-3 rounded-xl bg-brand-50 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                  <span className="material-icons-outlined text-brand-700 text-xl">category</span>
                </div>
                <p className="font-tajawal text-sm font-bold text-grey-800 group-hover:text-brand-800 transition-colors">{cat.name}</p>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* ═══ Products Grid ═══ */}
      <section className="max-w-6xl mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-tajawal text-lg font-bold text-grey-900">
            {featured.length > 0 ? 'منتجات مميزة' : 'أحدث المنتجات'}
          </h2>
          <Link href={`${base}/products`} className="text-xs text-brand-800 font-semibold hover:underline flex items-center gap-1">
            عرض الكل
            <span className="material-icons-outlined text-sm">arrow_back</span>
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[1,2,3,4].map(i => (
              <div key={i} className="animate-pulse">
                <div className="aspect-square rounded-2xl bg-grey-100 mb-3" />
                <div className="h-4 bg-grey-100 rounded w-3/4 mb-2" />
                <div className="h-4 bg-grey-100 rounded w-1/2" />
              </div>
            ))}
          </div>
        ) : latest.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons-outlined text-5xl text-grey-200 mb-3 block">inventory_2</span>
            <p className="text-grey-400 text-sm">لا توجد منتجات حالياً</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {(featured.length > 0 ? featured : latest).map((product) => (
              <div key={product.id} className="group">
                {/* Image */}
                <Link href={`${base}/product/${product.slug}`}>
                  <div className="aspect-square rounded-2xl bg-grey-50 border border-grey-100 overflow-hidden mb-3 relative group-hover:border-brand-200 transition-all">
                    {product.image ? (
                      <img src={product.image} alt={product.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-4xl text-grey-200">inventory_2</span>
                      </div>
                    )}
                    {product.sale_price && parseFloat(String(product.sale_price)) > 0 && (
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">
                        تخفيض
                      </span>
                    )}
                  </div>
                </Link>

                {/* Info */}
                <div className="px-0.5">
                  {product.category_name && (
                    <p className="text-[0.65rem] text-grey-400 mb-0.5">{product.category_name}</p>
                  )}
                  <Link href={`${base}/product/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-grey-800 group-hover:text-brand-800 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-tajawal text-base font-bold text-grey-900">
                        {fmtPrice(product.sale_price && parseFloat(String(product.sale_price)) > 0 ? product.sale_price : product.price)}
                      </span>
                      <span className="text-[0.6rem] text-grey-400">ر.ق</span>
                      {product.sale_price && parseFloat(String(product.sale_price)) > 0 && (
                        <span className="text-xs text-grey-300 line-through">{fmtPrice(product.price)}</span>
                      )}
                    </div>
                    <button onClick={() => addItem({
                      id: product.id, name: product.name, slug: product.slug,
                      price: parseFloat(String(product.price)),
                      salePrice: product.sale_price ? parseFloat(String(product.sale_price)) : undefined,
                      image: product.image,
                    })} className="w-8 h-8 rounded-xl bg-brand-50 hover:bg-brand-100 flex items-center justify-center transition-colors">
                      <span className="material-icons-outlined text-brand-700 text-sm">add_shopping_cart</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
