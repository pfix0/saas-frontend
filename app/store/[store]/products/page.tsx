'use client';

/**
 * ساس — Storefront Products Page
 * Grid + Filters + Search + Pagination
 */

import { useEffect, useState, use } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useCartStore } from '@/stores/cart';

interface Product {
  id: string; name: string; slug: string; price: number;
  sale_price?: number; image?: string; category_name?: string; category_slug?: string;
}
interface Category { id: string; name: string; slug: string; }

export default function ProductsPage({ params }: { params: Promise<{ store: string }> }) {
  const { store } = use(params);
  const searchParams = useSearchParams();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const { addItem } = useCartStore();

  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [sort, setSort] = useState('created_at');
  const base = `/store/${store}`;
  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  const fetchProducts = () => {
    setLoading(true);
    const qs = new URLSearchParams();
    qs.set('page', String(page));
    qs.set('limit', '12');
    qs.set('sort', sort);
    if (category) qs.set('category', category);
    if (search) qs.set('search', search);

    fetch(`/api/store/${store}/products?${qs}`)
      .then(r => r.json())
      .then(d => { if (d.success) { setProducts(d.data); setTotal(d.pagination.total); } setLoading(false); })
      .catch(() => setLoading(false));
  };

  useEffect(() => {
    fetch(`/api/store/${store}/categories`).then(r => r.json())
      .then(d => { if (d.success) setCategories(d.data); });
  }, [store]);

  useEffect(() => { fetchProducts(); }, [store, category, sort, page]);

  // Debounced search
  useEffect(() => {
    const t = setTimeout(fetchProducts, 400);
    return () => clearTimeout(t);
  }, [search]);

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900">المنتجات</h1>
        <p className="text-sm text-grey-400 mt-1">{total} منتج</p>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 relative">
          <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg">search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="ابحث عن منتج..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-grey-50 border border-grey-200 text-grey-900 text-sm placeholder:text-grey-400 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
        </div>
        <select value={category} onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          className="px-4 py-2.5 rounded-xl bg-grey-50 border border-grey-200 text-grey-700 text-sm outline-none min-w-[140px]">
          <option value="">كل التصنيفات</option>
          {categories.map(c => <option key={c.id} value={c.slug}>{c.name}</option>)}
        </select>
        <select value={sort} onChange={(e) => setSort(e.target.value)}
          className="px-4 py-2.5 rounded-xl bg-grey-50 border border-grey-200 text-grey-700 text-sm outline-none min-w-[140px]">
          <option value="created_at">الأحدث</option>
          <option value="price_asc">السعر: الأقل</option>
          <option value="price_desc">السعر: الأعلى</option>
        </select>
      </div>

      {/* Active Filters */}
      {(category || search) && (
        <div className="flex items-center gap-2 mb-4">
          {category && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-brand-50 text-brand-800 text-xs font-semibold">
              {categories.find(c => c.slug === category)?.name || category}
              <button onClick={() => setCategory('')} className="hover:text-brand-600"><span className="material-icons-outlined text-xs">close</span></button>
            </span>
          )}
          {search && (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-grey-100 text-grey-600 text-xs font-semibold">
              "{search}"
              <button onClick={() => setSearch('')} className="hover:text-grey-800"><span className="material-icons-outlined text-xs">close</span></button>
            </span>
          )}
        </div>
      )}

      {/* Products Grid */}
      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {[1,2,3,4,5,6,7,8].map(i => (
            <div key={i} className="animate-pulse">
              <div className="aspect-square rounded-2xl bg-grey-100 mb-3" />
              <div className="h-4 bg-grey-100 rounded w-3/4 mb-2" />
              <div className="h-4 bg-grey-100 rounded w-1/2" />
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="text-center py-20">
          <span className="material-icons-outlined text-5xl text-grey-200 mb-3 block">search_off</span>
          <p className="text-grey-400 text-sm">لا توجد منتجات مطابقة</p>
          {(category || search) && (
            <button onClick={() => { setCategory(''); setSearch(''); }}
              className="mt-3 text-brand-800 text-sm font-semibold hover:underline">مسح الفلاتر</button>
          )}
        </div>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((product) => (
              <div key={product.id} className="group">
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
                      <span className="absolute top-2 right-2 bg-red-500 text-white text-[0.6rem] font-bold px-2 py-0.5 rounded-full">تخفيض</span>
                    )}
                  </div>
                </Link>
                <div className="px-0.5">
                  {product.category_name && <p className="text-[0.65rem] text-grey-400 mb-0.5">{product.category_name}</p>}
                  <Link href={`${base}/product/${product.slug}`}>
                    <h3 className="text-sm font-semibold text-grey-800 group-hover:text-brand-800 transition-colors line-clamp-1">{product.name}</h3>
                  </Link>
                  <div className="flex items-center justify-between mt-2">
                    <div className="flex items-baseline gap-1.5">
                      <span className="font-tajawal text-base font-bold text-grey-900">
                        {fmtPrice(product.sale_price && parseFloat(String(product.sale_price)) > 0 ? product.sale_price : product.price)}
                      </span>
                      <span className="text-[0.6rem] text-grey-400">ر.ق</span>
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

          {/* Pagination */}
          {total > 12 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                className="p-2 rounded-xl bg-grey-50 hover:bg-grey-100 disabled:opacity-30 transition-colors">
                <span className="material-icons-outlined text-grey-500 text-lg">chevron_right</span>
              </button>
              <span className="text-sm text-grey-500 px-3">صفحة {page} من {Math.ceil(total / 12)}</span>
              <button onClick={() => setPage(p => p + 1)} disabled={page >= Math.ceil(total / 12)}
                className="p-2 rounded-xl bg-grey-50 hover:bg-grey-100 disabled:opacity-30 transition-colors">
                <span className="material-icons-outlined text-grey-500 text-lg">chevron_left</span>
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
