'use client';

/**
 * ساس — Checkout Page
 * صفحة إتمام الطلب — Mobile-First
 * Step 1: بيانات العميل + العنوان
 * Step 2: الشحن + الدفع
 * Step 3: مراجعة + تأكيد
 */

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useCartStore } from '@/stores/cart';

// ═══ Qatar Cities ═══
const QATAR_CITIES = [
  'الدوحة', 'الوكرة', 'الخور', 'الشمال', 'الريان',
  'أم صلال', 'الضعاين', 'مسيعيد', 'دخان', 'الذخيرة',
];

const SHIPPING_METHODS: any[] = []; // loaded dynamically
const PAYMENT_METHODS: any[] = []; // loaded dynamically

interface CouponData {
  code: string;
  type: string;
  value: number;
  discount: number;
  description: string;
}

export default function CheckoutPage({ params }: { params: { store: string } }) {
  const { store } = params;
  const router = useRouter();
  const { items, totalPrice, totalItems, clearCart } = useCartStore();
  const base = `/store/${store}`;
  const fmtPrice = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  // ═══ State ═══
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  // Customer
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');

  // Address
  const [city, setCity] = useState('الدوحة');
  const [area, setArea] = useState('');
  const [street, setStreet] = useState('');
  const [building, setBuilding] = useState('');
  const [floor, setFloor] = useState('');
  const [apartment, setApartment] = useState('');
  const [addressNotes, setAddressNotes] = useState('');

  // Shipping & Payment
  const [shippingMethod, setShippingMethod] = useState('');
  const [paymentMethod, setPaymentMethod] = useState('');
  const [customerNotes, setCustomerNotes] = useState('');
  const [shippingMethods, setShippingMethods] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [freeShipping, setFreeShipping] = useState({ enabled: false, min: 0 });

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [couponData, setCouponData] = useState<CouponData | null>(null);
  const [couponLoading, setCouponLoading] = useState(false);
  const [couponError, setCouponError] = useState('');

  // Redirect if cart is empty
  useEffect(() => {
    if (items.length === 0) {
      router.push(`${base}/cart`);
    }
  }, [items.length, base, router]);

  // Fetch checkout options (dynamic payment/shipping)
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const res = await fetch(`/api/store/${store}/checkout-options`);
        const data = await res.json();
        if (data.success) {
          const sm = data.data.shipping_methods.map((m: any) => ({
            id: m.key, name: m.label, icon: m.icon, cost: m.cost, address: m.address,
          }));
          const pm = data.data.payment_methods.map((m: any) => ({
            id: m.key, name: m.label, icon: m.icon, details: m.details,
          }));
          setShippingMethods(sm);
          setPaymentMethods(pm);
          setFreeShipping(data.data.free_shipping || { enabled: false, min: 0 });
          if (sm.length > 0 && !shippingMethod) setShippingMethod(sm[0].id);
          if (pm.length > 0 && !paymentMethod) setPaymentMethod(pm[0].id);
        }
      } catch {}
    };
    fetchOptions();
  }, [store]);

  // ═══ Calculations ═══
  const subtotal = totalPrice();
  const rawShippingCost = shippingMethods.find(m => m.id === shippingMethod)?.cost || 0;
  const isFreeShipping = freeShipping.enabled && subtotal >= freeShipping.min;
  const shippingCost = isFreeShipping ? 0 : rawShippingCost;
  const discount = couponData?.discount || 0;
  const total = subtotal - discount + shippingCost;

  // ═══ Coupon Validation ═══
  const validateCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');
    setCouponData(null);

    try {
      const res = await fetch(`/api/store/${store}/coupon/validate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, subtotal }),
      });
      const data = await res.json();
      if (data.success) {
        setCouponData(data.data);
      } else {
        setCouponError(data.error || 'كوبون غير صالح');
      }
    } catch {
      setCouponError('خطأ في التحقق من الكوبون');
    }
    setCouponLoading(false);
  };

  const removeCoupon = () => {
    setCouponData(null);
    setCouponCode('');
    setCouponError('');
  };

  // ═══ Validation ═══
  const validateStep1 = () => {
    if (!name.trim()) { setError('الاسم مطلوب'); return false; }
    if (!phone.trim() || phone.length < 8) { setError('رقم الجوال مطلوب (٨ أرقام على الأقل)'); return false; }
    if (!city) { setError('المدينة مطلوبة'); return false; }
    if (!area.trim()) { setError('المنطقة مطلوبة'); return false; }
    setError('');
    return true;
  };

  const goToStep2 = () => {
    if (validateStep1()) setStep(2);
  };

  const goToStep3 = () => {
    setError('');
    setStep(3);
  };

  // ═══ Submit Order ═══
  const submitOrder = async () => {
    setLoading(true);
    setError('');

    try {
      const orderData = {
        customer: { name, phone, email: email || undefined },
        address: {
          city, area,
          street: street || undefined,
          building: building || undefined,
          floor_number: floor || undefined,
          apartment: apartment || undefined,
          notes: addressNotes || undefined,
        },
        items: items.map(item => ({
          product_id: item.id,
          name: item.name,
          quantity: item.quantity,
          options: {},
        })),
        shipping_method: shippingMethod,
        payment_method: paymentMethod,
        coupon_code: couponData?.code || undefined,
        customer_notes: customerNotes || undefined,
      };

      const res = await fetch(`/api/store/${store}/checkout`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData),
      });

      const data = await res.json();

      if (data.success) {
        clearCart();
        router.push(`${base}/order/${data.data.order_number}`);
      } else {
        setError(data.error || 'حدث خطأ في إنشاء الطلب');
      }
    } catch {
      setError('حدث خطأ في الاتصال. حاول مرة أخرى.');
    }
    setLoading(false);
  };

  if (items.length === 0) return null;

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 pb-32 lg:pb-8">
      {/* ═══ Header ═══ */}
      <div className="flex items-center gap-3 mb-6">
        <Link href={`${base}/cart`} className="p-2 rounded-xl hover:bg-grey-100 transition-colors">
          <span className="material-icons-outlined text-grey-500">arrow_forward</span>
        </Link>
        <div>
          <h1 className="font-tajawal text-xl font-bold text-grey-900">إتمام الطلب</h1>
          <p className="text-xs text-grey-400 mt-0.5">{totalItems()} منتج</p>
        </div>
      </div>

      {/* ═══ Steps Indicator ═══ */}
      <div className="flex items-center gap-2 mb-8">
        {[
          { num: 1, label: 'البيانات' },
          { num: 2, label: 'التوصيل' },
          { num: 3, label: 'التأكيد' },
        ].map((s, i) => (
          <div key={s.num} className="flex items-center gap-2 flex-1">
            <button
              onClick={() => { if (s.num < step) setStep(s.num); }}
              className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all flex-shrink-0
                ${step === s.num
                  ? 'bg-brand-800 text-white shadow-lg shadow-brand-800/20'
                  : step > s.num
                    ? 'bg-green-500 text-white'
                    : 'bg-grey-100 text-grey-400'
                }`}
            >
              {step > s.num ? (
                <span className="material-icons-outlined text-sm">check</span>
              ) : s.num}
            </button>
            <span className={`text-xs font-semibold hidden sm:inline ${step >= s.num ? 'text-grey-800' : 'text-grey-400'}`}>
              {s.label}
            </span>
            {i < 2 && (
              <div className={`flex-1 h-0.5 rounded ${step > s.num ? 'bg-green-400' : 'bg-grey-200'}`} />
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══ Form Section ═══ */}
        <div className="lg:col-span-2">
          {/* Error */}
          {error && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <span className="material-icons-outlined text-red-400 text-lg">error</span>
              <p className="text-sm text-red-600 font-semibold">{error}</p>
            </div>
          )}

          {/* ═══ STEP 1: Customer + Address ═══ */}
          {step === 1 && (
            <div className="space-y-6 animate-fade-in">
              {/* Customer Info */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">person</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">بياناتك</h2>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="block text-xs text-grey-500 font-semibold mb-1.5">الاسم الكامل *</label>
                    <input type="text" value={name} onChange={e => setName(e.target.value)}
                      placeholder="مثال: محمد أحمد"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                        placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                  </div>
                  <div>
                    <label className="block text-xs text-grey-500 font-semibold mb-1.5">رقم الجوال *</label>
                    <div className="flex gap-2">
                      <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-500 font-semibold flex-shrink-0">
                        <span className="text-xs">🇶🇦</span>
                        <span>+974</span>
                      </div>
                      <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                        placeholder="55001234" dir="ltr" maxLength={8}
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-grey-500 font-semibold mb-1.5">البريد الإلكتروني <span className="text-grey-300">(اختياري)</span></label>
                    <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                      placeholder="example@email.com" dir="ltr"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                        placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                  </div>
                </div>
              </div>

              {/* Address */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">location_on</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">عنوان التوصيل</h2>
                </div>

                <div className="space-y-3">
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-grey-500 font-semibold mb-1.5">المدينة *</label>
                      <select value={city} onChange={e => setCity(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all appearance-none cursor-pointer">
                        {QATAR_CITIES.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div>
                      <label className="block text-xs text-grey-500 font-semibold mb-1.5">المنطقة *</label>
                      <input type="text" value={area} onChange={e => setArea(e.target.value)}
                        placeholder="مثال: الدفنة"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-grey-500 font-semibold mb-1.5">الشارع</label>
                    <input type="text" value={street} onChange={e => setStreet(e.target.value)}
                      placeholder="اسم الشارع أو رقمه"
                      className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                        placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                  </div>

                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs text-grey-500 font-semibold mb-1.5">المبنى</label>
                      <input type="text" value={building} onChange={e => setBuilding(e.target.value)}
                        placeholder="رقم"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-grey-500 font-semibold mb-1.5">الطابق</label>
                      <input type="text" value={floor} onChange={e => setFloor(e.target.value)}
                        placeholder="رقم"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                    </div>
                    <div>
                      <label className="block text-xs text-grey-500 font-semibold mb-1.5">الشقة</label>
                      <input type="text" value={apartment} onChange={e => setApartment(e.target.value)}
                        placeholder="رقم"
                        className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all" />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs text-grey-500 font-semibold mb-1.5">ملاحظات التوصيل</label>
                    <textarea value={addressNotes} onChange={e => setAddressNotes(e.target.value)}
                      placeholder="تعليمات إضافية للسائق (مثال: البوابة الخلفية)"
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                        placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all resize-none" />
                  </div>
                </div>
              </div>

              {/* Next Button */}
              <button onClick={goToStep2}
                className="w-full py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                التالي: اختر طريقة التوصيل
                <span className="material-icons-outlined text-lg">arrow_back</span>
              </button>
            </div>
          )}

          {/* ═══ STEP 2: Shipping + Payment ═══ */}
          {step === 2 && (
            <div className="space-y-6 animate-fade-in">
              {/* Shipping */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">local_shipping</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">طريقة التوصيل</h2>
                </div>

                {/* Free shipping indicator */}
                {freeShipping.enabled && (
                  isFreeShipping ? (
                    <div className="bg-green-50 border border-green-200 rounded-xl p-3 mb-2 flex items-center gap-2">
                      <span className="material-icons-outlined text-green-600 text-lg">local_offer</span>
                      <span className="text-xs font-bold text-green-700">شحن مجاني! طلبك تجاوز {fmtPrice(freeShipping.min)} ر.ق</span>
                    </div>
                  ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-3 mb-2 flex items-center gap-2">
                      <span className="material-icons-outlined text-amber-600 text-sm">info</span>
                      <span className="text-xs text-amber-700">أضف {fmtPrice(freeShipping.min - subtotal)} ر.ق للحصول على شحن مجاني!</span>
                    </div>
                  )
                )}

                <div className="space-y-2">
                  {shippingMethods.map(method => (
                    <label key={method.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${shippingMethod === method.id
                          ? 'border-brand-800 bg-brand-50/50'
                          : 'border-grey-200 bg-white hover:border-grey-300'
                        }`}>
                      <input type="radio" name="shipping" value={method.id}
                        checked={shippingMethod === method.id}
                        onChange={() => setShippingMethod(method.id)}
                        className="sr-only" />

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${shippingMethod === method.id ? 'bg-brand-800 text-white' : 'bg-grey-100 text-grey-400'}`}>
                        <span className="material-icons-outlined text-lg">{method.icon}</span>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-grey-900">{method.name}</p>
                        <p className="text-xs text-grey-400 mt-0.5">{method.eta || ''}</p>
                      </div>

                      <div className="text-left">
                        {method.cost > 0 ? (
                          isFreeShipping ? (
                            <div>
                              <span className="text-sm font-bold text-green-600">مجاني</span>
                              <span className="text-[0.6rem] text-grey-400 line-through block">{fmtPrice(method.cost)} ر.ق</span>
                            </div>
                          ) : (
                            <span className="text-sm font-bold text-grey-800">{fmtPrice(method.cost)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></span>
                          )
                        ) : (
                          <span className="text-sm font-bold text-green-600">مجاني</span>
                        )}
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Payment */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">credit_card</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">طريقة الدفع</h2>
                </div>

                <div className="space-y-2">
                  {paymentMethods.map(method => (
                    <label key={method.id}
                      className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-all
                        ${paymentMethod === method.id
                          ? 'border-brand-800 bg-brand-50/50'
                          : 'border-grey-200 bg-white hover:border-grey-300'
                        }`}>
                      <input type="radio" name="payment" value={method.id}
                        checked={paymentMethod === method.id}
                        onChange={() => setPaymentMethod(method.id)}
                        className="sr-only" />

                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0
                        ${paymentMethod === method.id ? 'bg-brand-800 text-white' : 'bg-grey-100 text-grey-400'}`}>
                        <span className="material-icons-outlined text-lg">{method.icon}</span>
                      </div>

                      <div className="flex-1">
                        <p className="text-sm font-bold text-grey-900">{method.name}</p>
                      </div>

                      <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
                        ${paymentMethod === method.id ? 'border-brand-800' : 'border-grey-300'}`}>
                        {paymentMethod === method.id && <div className="w-2.5 h-2.5 rounded-full bg-brand-800" />}
                      </div>
                    </label>
                  ))}
                </div>

                {/* Bank transfer details */}
                {paymentMethod === 'bank_transfer' && paymentMethods.find(m => m.id === 'bank_transfer')?.details && (
                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3 mt-3">
                    <p className="text-xs font-bold text-blue-800 mb-2">بيانات التحويل البنكي</p>
                    {(() => {
                      const d = paymentMethods.find(m => m.id === 'bank_transfer')?.details;
                      return (
                        <div className="space-y-1 text-xs text-blue-700">
                          {d?.bank_name && <p>البنك: <strong>{d.bank_name}</strong></p>}
                          {d?.account_name && <p>الاسم: <strong>{d.account_name}</strong></p>}
                          {d?.iban && <p dir="ltr" className="text-left font-mono">IBAN: <strong>{d.iban}</strong></p>}
                        </div>
                      );
                    })()}
                    <p className="text-[0.6rem] text-blue-500 mt-2">أرسل إيصال التحويل عبر واتساب بعد إتمام الطلب</p>
                  </div>
                )}
              </div>

              {/* Coupon */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">confirmation_number</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">كوبون خصم</h2>
                </div>

                {couponData ? (
                  <div className="flex items-center gap-3 p-3 rounded-xl bg-green-50 border border-green-200">
                    <span className="material-icons-outlined text-green-500 text-lg">check_circle</span>
                    <div className="flex-1">
                      <p className="text-sm font-bold text-green-700">{couponData.description}</p>
                      <p className="text-xs text-green-500 mt-0.5">خصم: {fmtPrice(couponData.discount)} ر.ق</p>
                    </div>
                    <button onClick={removeCoupon} className="p-1.5 rounded-lg hover:bg-green-100 transition-colors">
                      <span className="material-icons-outlined text-green-400 text-lg">close</span>
                    </button>
                  </div>
                ) : (
                  <div>
                    <div className="flex gap-2">
                      <input type="text" value={couponCode} onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }}
                        placeholder="أدخل كود الكوبون" dir="ltr"
                        className="flex-1 px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                          placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all font-mono tracking-wide" />
                      <button onClick={validateCoupon} disabled={couponLoading || !couponCode.trim()}
                        className="px-5 py-3 rounded-xl bg-grey-800 text-white text-sm font-bold hover:bg-grey-700 disabled:opacity-50 disabled:cursor-not-allowed transition-all">
                        {couponLoading ? (
                          <span className="material-icons-outlined animate-spin text-sm">autorenew</span>
                        ) : 'تطبيق'}
                      </button>
                    </div>
                    {couponError && (
                      <p className="text-xs text-red-500 font-semibold mt-2 flex items-center gap-1">
                        <span className="material-icons-outlined text-xs">error</span>
                        {couponError}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Customer Notes */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-lg">edit_note</span>
                  <h2 className="font-tajawal text-base font-bold text-grey-900">ملاحظات <span className="text-grey-400 text-xs font-normal">(اختياري)</span></h2>
                </div>
                <textarea value={customerNotes} onChange={e => setCustomerNotes(e.target.value)}
                  placeholder="أي ملاحظات إضافية على الطلب..."
                  rows={2}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm
                    placeholder:text-grey-300 focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none transition-all resize-none" />
              </div>

              {/* Navigation Buttons */}
              <div className="flex gap-3">
                <button onClick={() => setStep(1)}
                  className="px-5 py-3.5 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center gap-1">
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                  السابق
                </button>
                <button onClick={goToStep3}
                  className="flex-1 py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2">
                  مراجعة الطلب
                  <span className="material-icons-outlined text-lg">arrow_back</span>
                </button>
              </div>
            </div>
          )}

          {/* ═══ STEP 3: Review + Confirm ═══ */}
          {step === 3 && (
            <div className="space-y-4 animate-fade-in">
              {/* Customer Summary */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-brand-800 text-sm">person</span>
                    <h3 className="text-sm font-bold text-grey-900">بيانات العميل</h3>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-brand-800 font-semibold hover:underline">تعديل</button>
                </div>
                <div className="space-y-1.5 text-sm text-grey-600">
                  <p><span className="text-grey-400">الاسم:</span> {name}</p>
                  <p><span className="text-grey-400">الجوال:</span> <span dir="ltr">+974 {phone}</span></p>
                  {email && <p><span className="text-grey-400">الإيميل:</span> <span dir="ltr">{email}</span></p>}
                </div>
              </div>

              {/* Address Summary */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-brand-800 text-sm">location_on</span>
                    <h3 className="text-sm font-bold text-grey-900">عنوان التوصيل</h3>
                  </div>
                  <button onClick={() => setStep(1)} className="text-xs text-brand-800 font-semibold hover:underline">تعديل</button>
                </div>
                <p className="text-sm text-grey-600">
                  {[city, area, street, building && `مبنى ${building}`, floor && `طابق ${floor}`, apartment && `شقة ${apartment}`].filter(Boolean).join('، ')}
                </p>
                {addressNotes && <p className="text-xs text-grey-400 mt-1">📝 {addressNotes}</p>}
              </div>

              {/* Shipping + Payment Summary */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-brand-800 text-sm">local_shipping</span>
                    <h3 className="text-sm font-bold text-grey-900">التوصيل والدفع</h3>
                  </div>
                  <button onClick={() => setStep(2)} className="text-xs text-brand-800 font-semibold hover:underline">تعديل</button>
                </div>
                <div className="space-y-1.5 text-sm text-grey-600">
                  <p>
                    <span className="text-grey-400">التوصيل:</span>{' '}
                    {shippingMethods.find(m => m.id === shippingMethod)?.name}
                  </p>
                  <p>
                    <span className="text-grey-400">الدفع:</span>{' '}
                    {paymentMethods.find(m => m.id === paymentMethod)?.name}
                  </p>
                </div>
              </div>

              {/* Order Items */}
              <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-icons-outlined text-brand-800 text-sm">shopping_bag</span>
                  <h3 className="text-sm font-bold text-grey-900">المنتجات ({totalItems()})</h3>
                </div>
                <div className="space-y-3">
                  {items.map(item => {
                    const price = item.salePrice || item.price;
                    return (
                      <div key={item.id} className="flex gap-3">
                        <div className="w-14 h-14 rounded-xl bg-white border border-grey-100 overflow-hidden flex-shrink-0">
                          {item.image ? (
                            <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <span className="material-icons-outlined text-grey-300 text-sm">inventory_2</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-grey-800 truncate">{item.name}</p>
                          <p className="text-xs text-grey-400 mt-0.5">{item.quantity} × {fmtPrice(price)} ر.ق</p>
                        </div>
                        <p className="text-sm font-bold text-grey-900 flex-shrink-0">{fmtPrice(price * item.quantity)} ر.ق</p>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Navigation */}
              <div className="flex gap-3">
                <button onClick={() => setStep(2)}
                  className="px-5 py-3.5 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center gap-1">
                  <span className="material-icons-outlined text-sm">arrow_forward</span>
                  السابق
                </button>
                <button onClick={submitOrder} disabled={loading}
                  className="flex-1 py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 disabled:cursor-not-allowed transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-800/15">
                  {loading ? (
                    <>
                      <span className="material-icons-outlined animate-spin text-lg">autorenew</span>
                      جارِ إنشاء الطلب...
                    </>
                  ) : (
                    <>
                      <span className="material-icons-outlined text-lg">check_circle</span>
                      تأكيد الطلب
                    </>
                  )}
                </button>
              </div>
            </div>
          )}
        </div>

        {/* ═══ Order Summary (Sidebar) ═══ */}
        <div className="hidden lg:block lg:col-span-1">
          <div className="sticky top-20 rounded-2xl bg-grey-50 border border-grey-100 p-5">
            <h2 className="font-tajawal text-base font-bold text-grey-900 mb-4 flex items-center gap-2">
              <span className="material-icons-outlined text-brand-800 text-lg">receipt_long</span>
              ملخص الطلب
            </h2>

            {/* Items Preview */}
            <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
              {items.map(item => (
                <div key={item.id} className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-lg bg-white border border-grey-100 overflow-hidden flex-shrink-0">
                    {item.image ? (
                      <img src={item.image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-grey-200 text-[10px]">inventory_2</span>
                      </div>
                    )}
                  </div>
                  <span className="text-xs text-grey-600 truncate flex-1">{item.name} ×{item.quantity}</span>
                  <span className="text-xs font-semibold text-grey-700">{fmtPrice((item.salePrice || item.price) * item.quantity)}</span>
                </div>
              ))}
            </div>

            <hr className="border-grey-200 mb-4" />

            {/* Totals */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">المجموع الفرعي</span>
                <span className="text-grey-700 font-semibold">{fmtPrice(subtotal)} ر.ق</span>
              </div>

              {discount > 0 && (
                <div className="flex items-center justify-between text-sm">
                  <span className="text-green-600 flex items-center gap-1">
                    <span className="material-icons-outlined text-xs">confirmation_number</span>
                    الخصم
                  </span>
                  <span className="text-green-600 font-semibold">- {fmtPrice(discount)} ر.ق</span>
                </div>
              )}

              <div className="flex items-center justify-between text-sm">
                <span className="text-grey-500">التوصيل</span>
                {shippingCost > 0 ? (
                  <span className="text-grey-700 font-semibold">{fmtPrice(shippingCost)} ر.ق</span>
                ) : (
                  <span className="text-green-600 font-semibold text-xs">مجاني</span>
                )}
              </div>

              <hr className="border-grey-200" />

              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-grey-900">الإجمالي</span>
                <span className="font-tajawal text-xl font-black text-grey-900">
                  {fmtPrice(total)} <span className="text-xs text-grey-400 font-normal">ر.ق</span>
                </span>
              </div>
            </div>

            <p className="text-center text-[0.6rem] text-grey-400 mt-4 flex items-center justify-center gap-1">
              <span className="material-icons-outlined text-[10px]">verified_user</span>
              طلبك محمي ومؤمن
            </p>
          </div>
        </div>
      </div>

      {/* ═══ Mobile Bottom Summary ═══ */}
      <div className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-grey-200 p-4 z-30 shadow-[0_-4px_20px_rgba(0,0,0,0.06)]">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div>
            <p className="text-xs text-grey-400">الإجمالي</p>
            <p className="font-tajawal text-lg font-black text-grey-900">
              {fmtPrice(total)} <span className="text-xs text-grey-400 font-normal">ر.ق</span>
            </p>
            {discount > 0 && (
              <p className="text-[0.6rem] text-green-600 font-semibold">وفرت {fmtPrice(discount)} ر.ق</p>
            )}
          </div>
          <div className="text-left text-[0.6rem] text-grey-300">
            {totalItems()} منتج • {shippingMethods.find(m => m.id === shippingMethod)?.name}
          </div>
        </div>
      </div>

      {/* ═══ Animations ═══ */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
      `}</style>
    </div>
  );
}
