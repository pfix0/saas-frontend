'use client';

/**
 * ساس — Product Detail Page
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

interface ProductDetail {
  id: string; name: string; slug: string; description?: string;
  price: number; sale_price?: number; cost_price?: number;
  quantity: number; sku?: string; weight?: number;
  category_name?: string; category_slug?: string;
  tags?: string[]; is_featured?: boolean;
  images: { id: string; url: string; alt?: string; is_main: boolean }[];
}

export default function ProductPage({ params }: { params: { store: string; slug: string } }) {
  const { store, slug } = params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const { addItem } = useCartStore();

  const base = `/store/${store}`;
  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    fetch(`/api/store/${store}/products/${slug}`)
      .then(r => r.json())
      .then(d => {
        if (d.success) setProduct(d.data);
        else setNotFound(true);
        setLoading(false);
      })
      .catch(() => { setNotFound(true); setLoading(false); });
  }, [store, slug]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id, name: product.name, slug: product.slug,
      price: parseFloat(String(product.price)),
      salePrice: product.sale_price ? parseFloat(String(product.sale_price)) : undefined,
      image: product.images?.find(i => i.is_main)?.url || product.images?.[0]?.url,
    }, qty);
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="grid md:grid-cols-2 gap-8">
          <div className="aspect-square rounded-2xl bg-grey-100 animate-pulse" />
          <div className="space-y-4">
            <div className="h-6 bg-grey-100 rounded w-1/3 animate-pulse" />
            <div className="h-8 bg-grey-100 rounded w-2/3 animate-pulse" />
            <div className="h-10 bg-grey-100 rounded w-1/4 animate-pulse" />
            <div className="h-24 bg-grey-100 rounded animate-pulse" />
          </div>
        </div>
      </div>
    );
  }

  if (notFound || !product) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-20 text-center">
        <span className="material-icons-outlined text-5xl text-grey-200 mb-3 block">inventory_2</span>
        <h1 className="font-tajawal text-xl font-bold text-grey-800 mb-2">المنتج غير موجود</h1>
        <Link href={`${base}/products`} className="text-brand-800 text-sm font-semibold hover:underline">تصفح المنتجات</Link>
      </div>
    );
  }

  const mainImage = product.images?.find(i => i.is_main)?.url || product.images?.[0]?.url;
  const hasDiscount = product.sale_price && parseFloat(String(product.sale_price)) > 0;
  const currentPrice = hasDiscount ? product.sale_price! : product.price;
  const discount = hasDiscount ? Math.round((1 - parseFloat(String(product.sale_price)) / parseFloat(String(product.price))) * 100) : 0;
  const inStock = product.quantity > 0;

  return (
    <div className="max-w-6xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-grey-400 mb-6">
        <Link href={base} className="hover:text-grey-600">الرئيسية</Link>
        <span className="material-icons-outlined text-[10px]">chevron_left</span>
        <Link href={`${base}/products`} className="hover:text-grey-600">المنتجات</Link>
        {product.category_name && (
          <>
            <span className="material-icons-outlined text-[10px]">chevron_left</span>
            <Link href={`${base}/products?category=${product.category_slug}`} className="hover:text-grey-600">{product.category_name}</Link>
          </>
        )}
        <span className="material-icons-outlined text-[10px]">chevron_left</span>
        <span className="text-grey-600">{product.name}</span>
      </nav>

      <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
        {/* ═══ Images ═══ */}
        <div>
          <div className="aspect-square rounded-2xl bg-grey-50 border border-grey-100 overflow-hidden relative">
            {mainImage ? (
              <img src={mainImage} alt={product.name} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-icons-outlined text-6xl text-grey-200">inventory_2</span>
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                خصم {discount}%
              </span>
            )}
          </div>

          {/* Thumbnails */}
          {product.images && product.images.length > 1 && (
            <div className="flex gap-2 mt-3">
              {product.images.map((img) => (
                <div key={img.id} className="w-16 h-16 rounded-xl border border-grey-200 overflow-hidden cursor-pointer hover:border-brand-400 transition-colors">
                  <img src={img.url} alt={img.alt || product.name} className="w-full h-full object-cover" />
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ═══ Info ═══ */}
        <div>
          {product.category_name && (
            <Link href={`${base}/products?category=${product.category_slug}`}
              className="inline-block text-xs text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full font-semibold mb-3 hover:bg-brand-100 transition-colors">
              {product.category_name}
            </Link>
          )}

          <h1 className="font-tajawal text-2xl md:text-3xl font-bold text-grey-900 mb-4">{product.name}</h1>

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-6">
            <span className="font-tajawal text-3xl font-black text-grey-900">
              {fmtPrice(currentPrice)}
            </span>
            <span className="text-sm text-grey-400">ر.ق</span>
            {hasDiscount && (
              <span className="text-lg text-grey-300 line-through">{fmtPrice(product.price)}</span>
            )}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {inStock ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-green-600 font-semibold">متوفر</span>
                {product.quantity <= 5 && (
                  <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">بقي {product.quantity} فقط</span>
                )}
              </>
            ) : (
              <>
                <span className="w-2 h-2 rounded-full bg-red-400" />
                <span className="text-sm text-red-500 font-semibold">نفذ من المخزون</span>
              </>
            )}
          </div>

          {/* Description */}
          {product.description && (
            <div className="mb-6 p-4 rounded-xl bg-grey-50 border border-grey-100">
              <p className="text-sm text-grey-600 leading-relaxed whitespace-pre-line">{product.description}</p>
            </div>
          )}

          {/* Quantity + Add to Cart */}
          {inStock && (
            <div className="space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-sm text-grey-500">الكمية:</span>
                <div className="flex items-center border border-grey-200 rounded-xl overflow-hidden">
                  <button onClick={() => setQty(q => Math.max(1, q - 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-grey-50 transition-colors">
                    <span className="material-icons-outlined text-grey-500 text-lg">remove</span>
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-grey-800 border-x border-grey-200">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))}
                    className="w-10 h-10 flex items-center justify-center hover:bg-grey-50 transition-colors">
                    <span className="material-icons-outlined text-grey-500 text-lg">add</span>
                  </button>
                </div>
              </div>

              <button onClick={handleAdd}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 ${
                  added ? 'bg-green-500' : 'bg-brand-800 hover:bg-brand-700'
                }`}>
                <span className="material-icons-outlined text-lg">{added ? 'check_circle' : 'add_shopping_cart'}</span>
                {added ? 'تمت الإضافة!' : 'أضف للسلة'}
              </button>
            </div>
          )}

          {/* Details */}
          <div className="mt-6 space-y-2">
            {product.sku && (
              <div className="flex items-center gap-2 text-xs text-grey-400">
                <span className="material-icons-outlined text-sm">qr_code</span>
                رمز المنتج: <span className="font-mono text-grey-500">{product.sku}</span>
              </div>
            )}
            {product.tags && product.tags.length > 0 && (
              <div className="flex items-center gap-2 flex-wrap">
                <span className="material-icons-outlined text-grey-400 text-sm">label</span>
                {product.tags.map((tag, i) => (
                  <span key={i} className="text-[0.65rem] bg-grey-100 text-grey-500 px-2 py-0.5 rounded-full">{tag}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
