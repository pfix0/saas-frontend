'use client';

/**
 * ساس — Cart Page
 * سلة المشتريات الكاملة + ملخص الطلب
 */


import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

export default function CartPage({ params }: { params: { store: string } }) {
  const { store } = params;
  const { items, removeItem, updateQuantity, clearCart, totalItems, totalPrice } = useCartStore();
  const base = `/store/${store}`;
  const fmtPrice = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  if (items.length === 0) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-20 text-center">
        <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">shopping_bag</span>
        <h1 className="font-tajawal text-2xl font-bold text-grey-800 mb-2">السلة فارغة</h1>
        <p className="text-grey-400 text-sm mb-6">أضف منتجات من المتجر للبدء</p>
        <Link href={`${base}/products`}
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all">
          <span className="material-icons-outlined text-lg">storefront</span>
          تصفح المنتجات
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">سلة المشتريات</h1>
          <p className="text-sm text-grey-400 mt-1">{totalItems()} منتج</p>
        </div>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-500 font-semibold flex items-center gap-1">
          <span className="material-icons-outlined text-sm">delete_sweep</span>
          تفريغ السلة
        </button>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══ Items ═══ */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item) => {
            const price = item.salePrice || item.price;
            return (
              <div key={item.id} className="flex gap-4 p-4 rounded-2xl bg-grey-50 border border-grey-100">
                {/* Image */}
                <div className="w-20 h-20 rounded-xl bg-white border border-grey-100 overflow-hidden flex-shrink-0">
                  {item.image ? (
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <span className="material-icons-outlined text-grey-300 text-xl">inventory_2</span>
                    </div>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <Link href={`${base}/product/${item.slug}`}>
                    <h3 className="text-sm font-semibold text-grey-800 hover:text-brand-800 transition-colors">{item.name}</h3>
                  </Link>
                  <p className="text-sm font-bold text-brand-800 mt-1">
                    {fmtPrice(price)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span>
                  </p>

                  {/* Quantity + Remove */}
                  <div className="flex items-center justify-between mt-3">
                    <div className="flex items-center border border-grey-200 rounded-lg overflow-hidden bg-white">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-grey-50">
                        <span className="material-icons-outlined text-grey-500 text-sm">remove</span>
                      </button>
                      <span className="w-10 h-8 flex items-center justify-center text-sm font-bold text-grey-800 border-x border-grey-200">{item.quantity}</span>
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)}
                        className="w-8 h-8 flex items-center justify-center hover:bg-grey-50">
                        <span className="material-icons-outlined text-grey-500 text-sm">add</span>
                      </button>
                    </div>

                    <div className="flex items-center gap-3">
                      <span className="text-sm font-bold text-grey-900">{fmtPrice(price * item.quantity)} ر.ق</span>
                      <button onClick={() => removeItem(item.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                        <span className="material-icons-outlined text-grey-300 hover:text-red-400 text-lg">delete</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}

          <Link href={`${base}/products`} className="inline-flex items-center gap-1 text-sm text-brand-800 font-semibold hover:underline mt-2">
            <span className="material-icons-outlined text-sm">arrow_forward</span>
            متابعة التسوق
          </Link>
        </div>

        {/* ═══ Summary ═══ */}
        <div className="lg:col-span-1">
          <div className="sticky top-20 rounded-2xl bg-grey-50 border border-grey-100 p-5">
            <h2 className="font-tajawal text-base font-bold text-grey-900 mb-4">ملخص الطلب</h2>

            <div className="space-y-3 mb-4">
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">المجموع الفرعي</span>
                <span className="text-grey-700 font-semibold">{fmtPrice(totalPrice())} ر.ق</span>
              </div>
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">التوصيل</span>
                <span className="text-green-500 font-semibold text-xs">يحدد عند الدفع</span>
              </div>
              <hr className="border-grey-200" />
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-grey-900">الإجمالي</span>
                <span className="font-tajawal text-xl font-black text-grey-900">
                  {fmtPrice(totalPrice())} <span className="text-xs text-grey-400 font-normal">ر.ق</span>
                </span>
              </div>
            </div>

            <Link href={`${base}/checkout`}
              className="w-full py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-lg">lock</span>
              إتمام الطلب
            </Link>

            <p className="text-center text-[0.6rem] text-grey-400 mt-3 flex items-center justify-center gap-1">
              <span className="material-icons-outlined text-[10px]">verified_user</span>
              دفع آمن ومشفر
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
