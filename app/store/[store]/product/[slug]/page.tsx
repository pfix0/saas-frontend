'use client';

/**
 * ساس — Product Detail Page (محادثة ٨: تقييمات + مفضلة)
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
  avg_rating?: number; review_count?: number;
  images: { id: string; url: string; alt?: string; is_main: boolean }[];
}

interface Review {
  id: string; customer_name: string; rating: number; comment?: string; created_at: string;
}
interface ReviewStats {
  total: number; avg_rating: number; r5: number; r4: number; r3: number; r2: number; r1: number;
}

export default function ProductPage({ params }: { params: { store: string; slug: string } }) {
  const { store, slug } = params;
  const [product, setProduct] = useState<ProductDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [qty, setQty] = useState(1);
  const [added, setAdded] = useState(false);
  const [mainImg, setMainImg] = useState(0);
  const [isWished, setIsWished] = useState(false);
  const { addItem } = useCartStore();

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewStats, setReviewStats] = useState<ReviewStats | null>(null);
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [reviewName, setReviewName] = useState('');
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [reviewSubmitting, setReviewSubmitting] = useState(false);
  const [reviewSuccess, setReviewSuccess] = useState(false);

  const base = `/store/${store}`;
  const fmtPrice = (n: number) => parseFloat(String(n)).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  useEffect(() => {
    fetch(`/api/store/${store}/products/${slug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setProduct(d.data); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));

    // Fetch reviews
    fetch(`/api/store/${store}/products/${slug}/reviews`)
      .then(r => r.json())
      .then(d => { if (d.success) { setReviews(d.data.reviews); setReviewStats(d.data.stats); } })
      .catch(() => {});

    // Check wishlist
    const cid = localStorage.getItem(`saas_customer_${store}`);
    if (cid) {
      fetch(`/api/store/${store}/wishlist/${cid}`)
        .then(r => r.json())
        .then(d => { if (d.success) setIsWished(d.data.some((i: any) => i.slug === slug)); })
        .catch(() => {});
    }
  }, [store, slug]);

  const handleAdd = () => {
    if (!product) return;
    addItem({
      id: product.id, name: product.name,
      price: product.price, salePrice: product.sale_price || undefined,
      image: product.images?.[0]?.url, quantity: qty,
    });
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  const toggleWishlist = async () => {
    const cid = localStorage.getItem(`saas_customer_${store}`);
    if (!cid || !product) return;
    try {
      const res = await fetch(`/api/store/${store}/wishlist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customer_id: cid, product_id: product.id }),
      });
      const data = await res.json();
      if (data.success) setIsWished(data.action === 'added');
    } catch {}
  };

  const submitReview = async () => {
    if (!reviewName.trim() || !product) return;
    setReviewSubmitting(true);
    try {
      const cid = localStorage.getItem(`saas_customer_${store}`);
      const res = await fetch(`/api/store/${store}/products/${slug}/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          customer_name: reviewName, rating: reviewRating,
          comment: reviewComment || null, customer_id: cid || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setReviewSuccess(true);
        setShowReviewForm(false);
        setReviewName(''); setReviewComment(''); setReviewRating(5);
        // Refresh reviews
        const rr = await fetch(`/api/store/${store}/products/${slug}/reviews`);
        const rd = await rr.json();
        if (rd.success) { setReviews(rd.data.reviews); setReviewStats(rd.data.stats); }
        setTimeout(() => setReviewSuccess(false), 3000);
      }
    } catch {} finally { setReviewSubmitting(false); }
  };

  const renderStars = (rating: number, size = 'text-sm') => (
    <div className="flex items-center gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`material-icons-outlined ${size} ${s <= rating ? 'text-amber-400' : 'text-grey-200'}`}>star</span>
      ))}
    </div>
  );

  if (loading) return (
    <div className="max-w-5xl mx-auto px-4 py-8 animate-pulse">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="aspect-square bg-grey-100 rounded-2xl" />
        <div className="space-y-4"><div className="h-8 bg-grey-100 rounded w-3/4" /><div className="h-6 bg-grey-100 rounded w-1/2" /></div>
      </div>
    </div>
  );

  if (notFound || !product) return (
    <div className="max-w-5xl mx-auto px-4 py-16 text-center">
      <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">inventory_2</span>
      <h1 className="font-tajawal text-xl font-bold text-grey-800 mb-2">المنتج غير موجود</h1>
      <Link href={`${base}/products`} className="text-brand-800 text-sm font-semibold">تصفح المنتجات</Link>
    </div>
  );

  const hasDiscount = product.sale_price && product.sale_price < product.price;
  const inStock = product.quantity > 0;

  return (
    <div className="max-w-5xl mx-auto px-4 py-6">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-grey-400 mb-4 overflow-x-auto">
        <Link href={base} className="hover:text-grey-600 whitespace-nowrap">الرئيسية</Link>
        <span>/</span>
        <Link href={`${base}/products`} className="hover:text-grey-600 whitespace-nowrap">المنتجات</Link>
        {product.category_name && (<><span>/</span><span className="whitespace-nowrap">{product.category_name}</span></>)}
        <span>/</span>
        <span className="text-grey-600 font-semibold truncate">{product.name}</span>
      </nav>

      {/* Product Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
        {/* Images */}
        <div className="space-y-3">
          <div className="aspect-square rounded-2xl overflow-hidden bg-grey-50 border border-grey-100 relative">
            {product.images?.[mainImg] ? (
              <img src={product.images[mainImg].url} alt={product.name} className="w-full h-full object-contain" />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <span className="material-icons-outlined text-6xl text-grey-200">inventory_2</span>
              </div>
            )}
            {hasDiscount && (
              <span className="absolute top-3 right-3 bg-red-500 text-white text-xs font-bold px-3 py-1 rounded-full">
                خصم {Math.round((1 - product.sale_price! / product.price) * 100)}%
              </span>
            )}
            {/* Wishlist button */}
            <button onClick={toggleWishlist}
              className="absolute top-3 left-3 w-10 h-10 rounded-full bg-white/90 backdrop-blur-sm flex items-center justify-center shadow-md hover:bg-red-50 transition-colors">
              <span className={`material-icons-outlined text-xl ${isWished ? 'text-red-500' : 'text-grey-400'}`}>
                {isWished ? 'favorite' : 'favorite_border'}
              </span>
            </button>
          </div>
          {product.images?.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {product.images.map((img, i) => (
                <button key={img.id} onClick={() => setMainImg(i)}
                  className={`w-16 h-16 rounded-xl overflow-hidden flex-shrink-0 border-2 transition-all ${i === mainImg ? 'border-brand-800' : 'border-grey-100'}`}>
                  <img src={img.url} alt="" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Details */}
        <div>
          {product.category_name && (
            <span className="text-xs text-brand-800 bg-brand-50 px-2.5 py-1 rounded-full font-semibold mb-2 inline-block">{product.category_name}</span>
          )}
          <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-2">{product.name}</h1>

          {/* Rating */}
          {reviewStats && reviewStats.total > 0 && (
            <div className="flex items-center gap-2 mb-4">
              {renderStars(Math.round(reviewStats.avg_rating))}
              <span className="text-sm font-bold text-grey-700">{reviewStats.avg_rating}</span>
              <span className="text-xs text-grey-400">({reviewStats.total} تقييم)</span>
            </div>
          )}

          {/* Price */}
          <div className="flex items-baseline gap-3 mb-4">
            <span className="font-tajawal text-3xl font-bold text-brand-800">
              {fmtPrice(hasDiscount ? product.sale_price! : product.price)}
            </span>
            <span className="text-sm text-grey-400">ر.ق</span>
            {hasDiscount && <span className="text-lg text-grey-300 line-through">{fmtPrice(product.price)}</span>}
          </div>

          {/* Stock */}
          <div className="flex items-center gap-2 mb-6">
            {inStock ? (
              <>
                <span className="w-2 h-2 rounded-full bg-green-400" />
                <span className="text-sm text-green-600 font-semibold">متوفر</span>
                {product.quantity <= 5 && <span className="text-xs text-amber-500 bg-amber-50 px-2 py-0.5 rounded-full">بقي {product.quantity} فقط</span>}
              </>
            ) : (
              <><span className="w-2 h-2 rounded-full bg-red-400" /><span className="text-sm text-red-500 font-semibold">نفذ من المخزون</span></>
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
                  <button onClick={() => setQty(q => Math.max(1, q - 1))} className="w-10 h-10 flex items-center justify-center hover:bg-grey-50">
                    <span className="material-icons-outlined text-grey-500 text-lg">remove</span>
                  </button>
                  <span className="w-12 h-10 flex items-center justify-center text-sm font-bold text-grey-800 border-x border-grey-200">{qty}</span>
                  <button onClick={() => setQty(q => Math.min(product.quantity, q + 1))} className="w-10 h-10 flex items-center justify-center hover:bg-grey-50">
                    <span className="material-icons-outlined text-grey-500 text-lg">add</span>
                  </button>
                </div>
              </div>
              <button onClick={handleAdd}
                className={`w-full py-3.5 rounded-xl text-white text-sm font-bold transition-all flex items-center justify-center gap-2 ${added ? 'bg-green-500' : 'bg-brand-800 hover:bg-brand-700'}`}>
                <span className="material-icons-outlined text-lg">{added ? 'check_circle' : 'add_shopping_cart'}</span>
                {added ? 'تمت الإضافة!' : 'أضف للسلة'}
              </button>
            </div>
          )}

          {/* Meta */}
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

      {/* ═══ Reviews Section ═══ */}
      <div className="border-t border-grey-100 pt-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <span className="material-icons-outlined text-brand-800 text-2xl">rate_review</span>
            <h2 className="font-tajawal text-lg font-bold text-grey-900">التقييمات</h2>
            {reviewStats && <span className="text-xs bg-grey-100 text-grey-500 px-2 py-0.5 rounded-full font-semibold">{reviewStats.total}</span>}
          </div>
          <button onClick={() => setShowReviewForm(!showReviewForm)}
            className="text-sm font-semibold text-brand-800 hover:text-brand-700 flex items-center gap-1">
            <span className="material-icons-outlined text-lg">add</span>
            أضف تقييمك
          </button>
        </div>

        {/* Rating Summary */}
        {reviewStats && reviewStats.total > 0 && (
          <div className="flex flex-col sm:flex-row gap-6 mb-8 p-5 rounded-xl bg-grey-50 border border-grey-100">
            <div className="text-center flex-shrink-0">
              <div className="font-tajawal text-4xl font-bold text-grey-900">{reviewStats.avg_rating}</div>
              {renderStars(Math.round(reviewStats.avg_rating), 'text-lg')}
              <p className="text-xs text-grey-400 mt-1">{reviewStats.total} تقييم</p>
            </div>
            <div className="flex-1 space-y-1.5">
              {[5,4,3,2,1].map(r => {
                const count = reviewStats[`r${r}` as keyof ReviewStats] as number;
                const pct = reviewStats.total > 0 ? (count / reviewStats.total) * 100 : 0;
                return (
                  <div key={r} className="flex items-center gap-2">
                    <span className="text-xs text-grey-500 w-4">{r}</span>
                    <span className="material-icons-outlined text-amber-400 text-xs">star</span>
                    <div className="flex-1 h-2 bg-grey-200 rounded-full overflow-hidden">
                      <div className="h-full bg-amber-400 rounded-full transition-all" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-xs text-grey-400 w-8 text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Review Success */}
        {reviewSuccess && (
          <div className="mb-4 p-3 rounded-xl bg-green-50 border border-green-200 flex items-center gap-2">
            <span className="material-icons-outlined text-green-500 text-lg">check_circle</span>
            <p className="text-sm text-green-700 font-semibold">شكراً لتقييمك!</p>
          </div>
        )}

        {/* Review Form */}
        {showReviewForm && (
          <div className="mb-8 p-5 rounded-xl bg-white border border-grey-200 shadow-sm">
            <h3 className="font-tajawal text-sm font-bold text-grey-800 mb-4">أضف تقييمك</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-grey-500 mb-1">التقييم</label>
                <div className="flex gap-1">
                  {[1,2,3,4,5].map(s => (
                    <button key={s} onClick={() => setReviewRating(s)} className="p-0.5">
                      <span className={`material-icons-outlined text-2xl ${s <= reviewRating ? 'text-amber-400' : 'text-grey-200'}`}>star</span>
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-grey-500 mb-1">الاسم *</label>
                <input type="text" value={reviewName} onChange={(e) => setReviewName(e.target.value)}
                  placeholder="اسمك" className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-grey-500 mb-1">تعليقك (اختياري)</label>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)}
                  placeholder="شاركنا رأيك..." rows={3}
                  className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none resize-none" />
              </div>
              <button onClick={submitReview} disabled={!reviewName.trim() || reviewSubmitting}
                className="px-6 py-2.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:bg-grey-200 disabled:text-grey-400 transition-all">
                {reviewSubmitting ? 'جاري الإرسال...' : 'إرسال التقييم'}
              </button>
            </div>
          </div>
        )}

        {/* Reviews List */}
        {reviews.length > 0 ? (
          <div className="space-y-4">
            {reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-xl bg-white border border-grey-100">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-brand-50 flex items-center justify-center">
                      <span className="font-tajawal text-xs font-bold text-brand-800">{review.customer_name[0]}</span>
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-grey-800">{review.customer_name}</p>
                      <p className="text-[0.65rem] text-grey-400">{new Date(review.created_at).toLocaleDateString('ar-QA')}</p>
                    </div>
                  </div>
                  {renderStars(review.rating, 'text-xs')}
                </div>
                {review.comment && <p className="text-sm text-grey-600 leading-relaxed mt-2">{review.comment}</p>}
              </div>
            ))}
          </div>
        ) : !showReviewForm && (
          <div className="text-center py-8">
            <span className="material-icons-outlined text-3xl text-grey-200 block mb-2">rate_review</span>
            <p className="text-sm text-grey-400 mb-2">لا توجد تقييمات بعد</p>
            <button onClick={() => setShowReviewForm(true)} className="text-sm text-brand-800 font-semibold hover:underline">كن أول من يقيّم!</button>
          </div>
        )}
      </div>
    </div>
  );
}
