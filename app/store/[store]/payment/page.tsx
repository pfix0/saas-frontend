'use client';

/**
 * ساس — Payment Processing Page
 * محادثة ١٠: صفحة معالجة الدفع
 * - يعالج التوجيه لبوابة الدفع (SkipCash / SADAD)
 * - يستقبل الرد من البوابة (callback)
 * - يعرض حالة الدفع (نجاح / فشل / معلّق)
 */

import { useState, useEffect, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';

type PaymentPhase = 'loading' | 'redirecting' | 'verifying' | 'success' | 'failed' | 'expired' | 'bank_transfer';

interface PaymentData {
  order_number: string;
  amount: number;
  gateway: string;
  status: string;
  gateway_ref?: string;
  redirect_url?: string;
  bank_details?: {
    bank_name: string;
    account_name: string;
    iban: string;
    swift: string;
    instructions: string;
    reference: string;
  };
}

export default function PaymentPage({ params }: { params: { store: string } }) {
  const { store } = params;
  const router = useRouter();
  const searchParams = useSearchParams();
  const base = `/store/${store}`;
  const fmtPrice = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  const [phase, setPhase] = useState<PaymentPhase>('loading');
  const [data, setData] = useState<PaymentData | null>(null);
  const [error, setError] = useState('');
  const [countdown, setCountdown] = useState(5);
  const [copied, setCopied] = useState('');
  const [pollCount, setPollCount] = useState(0);

  // Get params
  const sessionId = searchParams.get('session');
  const orderId = searchParams.get('order');
  const gateway = searchParams.get('gateway');
  const callbackStatus = searchParams.get('status');
  const gatewayRef = searchParams.get('ref') || searchParams.get('transaction_id') || searchParams.get('PaymentId');

  // ═══ Initialize: either create payment session or verify callback ═══
  useEffect(() => {
    if (callbackStatus && sessionId) {
      // Returning from payment gateway — verify
      verifyPayment();
    } else if (orderId && gateway) {
      // Starting new payment — initiate
      initiatePayment();
    } else if (sessionId) {
      // Check status of existing session
      checkPaymentStatus();
    } else {
      setPhase('failed');
      setError('رابط غير صالح');
    }
  }, []);

  // ═══ Initiate Payment ═══
  const initiatePayment = async () => {
    setPhase('loading');
    try {
      const res = await fetch(`/api/store/${store}/payment/initiate`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ order_id: orderId, gateway }),
      });
      const result = await res.json();

      if (result.success) {
        setData(result.data);

        if (gateway === 'bank_transfer') {
          setPhase('bank_transfer');
        } else if (result.data.redirect_url) {
          setPhase('redirecting');
          // Redirect to gateway after a brief delay
          setTimeout(() => {
            window.location.href = result.data.redirect_url;
          }, 2000);
        } else {
          setPhase('failed');
          setError('لم يتم الحصول على رابط الدفع');
        }
      } else {
        setPhase('failed');
        setError(result.error || 'فشل إنشاء جلسة الدفع');
      }
    } catch {
      setPhase('failed');
      setError('خطأ في الاتصال. حاول مرة أخرى.');
    }
  };

  // ═══ Verify Payment (callback from gateway) ═══
  const verifyPayment = async () => {
    setPhase('verifying');
    try {
      const res = await fetch(`/api/store/${store}/payment/verify`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          session_id: sessionId,
          status: callbackStatus,
          gateway_ref: gatewayRef,
          // Pass all query params for gateway-specific verification
          raw_params: Object.fromEntries(searchParams.entries()),
        }),
      });
      const result = await res.json();

      if (result.success && result.data.status === 'paid') {
        setData(result.data);
        setPhase('success');
      } else if (result.data?.status === 'failed') {
        setData(result.data);
        setPhase('failed');
        setError('تم رفض الدفع من البوابة');
      } else {
        setData(result.data);
        setPhase('failed');
        setError(result.error || 'لم يتم تأكيد الدفع');
      }
    } catch {
      setPhase('failed');
      setError('خطأ في التحقق من الدفع');
    }
  };

  // ═══ Check Payment Status (polling) ═══
  const checkPaymentStatus = async () => {
    try {
      const res = await fetch(`/api/store/${store}/payment/status/${sessionId}`);
      const result = await res.json();

      if (result.success) {
        setData(result.data);
        if (result.data.status === 'paid') {
          setPhase('success');
        } else if (result.data.status === 'failed') {
          setPhase('failed');
          setError('فشل الدفع');
        } else if (result.data.status === 'expired') {
          setPhase('expired');
        } else {
          setPhase('verifying');
          // Poll again
          if (pollCount < 20) {
            setTimeout(() => {
              setPollCount(prev => prev + 1);
              checkPaymentStatus();
            }, 3000);
          } else {
            setPhase('failed');
            setError('انتهت مهلة التحقق. تواصل مع المتجر.');
          }
        }
      }
    } catch {
      setPhase('failed');
      setError('خطأ في الاتصال');
    }
  };

  // ═══ Success countdown redirect ═══
  useEffect(() => {
    if (phase === 'success' && countdown > 0) {
      const timer = setTimeout(() => setCountdown(c => c - 1), 1000);
      return () => clearTimeout(timer);
    }
    if (phase === 'success' && countdown === 0 && data) {
      router.push(`${base}/order/${data.order_number}`);
    }
  }, [phase, countdown, data, base, router]);

  // ═══ Copy helper ═══
  const copyText = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopied(field);
    setTimeout(() => setCopied(''), 2000);
  };

  // ═══ Gateway label ═══
  const gatewayLabel = (g?: string) => {
    const labels: Record<string, string> = {
      skipcash: 'سكاي باي كاش',
      sadad: 'سداد',
      bank_transfer: 'تحويل بنكي',
      cod: 'الدفع عند الاستلام',
    };
    return labels[g || ''] || g || '';
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-grey-50 to-white flex items-center justify-center p-4">
      <div className="w-full max-w-md">

        {/* ═══ Loading ═══ */}
        {phase === 'loading' && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-brand-50 flex items-center justify-center">
              <span className="material-icons-outlined text-4xl text-brand-800 animate-spin">sync</span>
            </div>
            <h1 className="font-tajawal text-xl font-bold text-grey-900 mb-2">جارِ تجهيز الدفع</h1>
            <p className="text-sm text-grey-500">يرجى الانتظار...</p>
          </div>
        )}

        {/* ═══ Redirecting ═══ */}
        {phase === 'redirecting' && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-blue-50 flex items-center justify-center relative">
              <span className="material-icons-outlined text-4xl text-blue-600">open_in_new</span>
              <div className="absolute inset-0 rounded-full border-2 border-blue-200 animate-ping" />
            </div>
            <h1 className="font-tajawal text-xl font-bold text-grey-900 mb-2">جارِ التوجيه لبوابة الدفع</h1>
            <p className="text-sm text-grey-500 mb-4">سيتم تحويلك إلى {gatewayLabel(gateway || data?.gateway)} خلال ثوانٍ...</p>

            {data && (
              <div className="bg-white rounded-2xl border border-grey-100 p-5 text-right mb-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs text-grey-400">المبلغ</span>
                  <span className="font-tajawal text-lg font-black text-grey-900">{fmtPrice(data.amount)} ر.ق</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-grey-400">الطلب</span>
                  <span className="text-sm font-semibold text-grey-700">#{data.order_number}</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-center gap-1.5 mb-2">
              {[0, 1, 2].map(i => (
                <div key={i} className="w-2.5 h-2.5 rounded-full bg-blue-400 animate-bounce" style={{ animationDelay: `${i * 0.15}s` }} />
              ))}
            </div>
            <p className="text-xs text-grey-400">لا تغلق هذه الصفحة</p>

            {data?.redirect_url && (
              <a href={data.redirect_url}
                className="mt-4 inline-flex items-center gap-2 text-sm text-brand-800 font-bold hover:underline">
                <span className="material-icons-outlined text-sm">open_in_new</span>
                انقر هنا إذا لم يتم التحويل تلقائياً
              </a>
            )}
          </div>
        )}

        {/* ═══ Verifying ═══ */}
        {phase === 'verifying' && (
          <div className="text-center animate-fade-in">
            <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-amber-50 flex items-center justify-center">
              <span className="material-icons-outlined text-4xl text-amber-600 animate-pulse">verified</span>
            </div>
            <h1 className="font-tajawal text-xl font-bold text-grey-900 mb-2">جارِ التحقق من الدفع</h1>
            <p className="text-sm text-grey-500 mb-6">نتأكد من عملية الدفع مع البوابة...</p>

            <div className="w-full bg-grey-100 rounded-full h-1.5 overflow-hidden mb-4">
              <div className="h-full bg-amber-500 rounded-full animate-progress" />
            </div>

            <p className="text-xs text-grey-400">قد تستغرق العملية بضع ثوانٍ</p>
          </div>
        )}

        {/* ═══ Success ═══ */}
        {phase === 'success' && data && (
          <div className="animate-fade-in">
            {/* Celebration */}
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-emerald-50 flex items-center justify-center relative">
                <span className="material-icons-outlined text-5xl text-emerald-500 animate-scale-in">check_circle</span>
                <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-emerald-400 flex items-center justify-center animate-bounce">
                  <span className="text-white text-sm">✓</span>
                </div>
              </div>
              <h1 className="font-tajawal text-2xl font-black text-grey-900 mb-1">تم الدفع بنجاح!</h1>
              <p className="text-sm text-grey-500">شكراً لك — تم تأكيد طلبك</p>
            </div>

            {/* Payment Details */}
            <div className="bg-white rounded-2xl border border-grey-100 p-5 mb-4 space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm text-grey-500">رقم الطلب</span>
                <span className="text-sm font-bold text-brand-800">#{data.order_number}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-grey-500">المبلغ</span>
                <span className="font-tajawal text-lg font-black text-grey-900">{fmtPrice(data.amount)} ر.ق</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-grey-500">بوابة الدفع</span>
                <span className="text-sm text-grey-700">{gatewayLabel(data.gateway)}</span>
              </div>
              {data.gateway_ref && (
                <div className="flex items-center justify-between">
                  <span className="text-sm text-grey-500">مرجع الدفع</span>
                  <span className="text-xs text-grey-400 font-mono">{data.gateway_ref}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <Link href={`${base}/order/${data.order_number}`}
              className="w-full py-4 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-800/15 mb-3">
              <span className="material-icons-outlined text-lg">receipt_long</span>
              عرض تفاصيل الطلب
            </Link>

            <Link href={base}
              className="w-full py-3 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-lg">storefront</span>
              متابعة التسوق
            </Link>

            <p className="text-center text-xs text-grey-400 mt-4">
              سيتم توجيهك تلقائياً خلال {countdown} ثوانٍ...
            </p>
          </div>
        )}

        {/* ═══ Failed ═══ */}
        {phase === 'failed' && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-red-50 flex items-center justify-center">
                <span className="material-icons-outlined text-5xl text-red-500">cancel</span>
              </div>
              <h1 className="font-tajawal text-2xl font-black text-grey-900 mb-2">فشل الدفع</h1>
              <p className="text-sm text-grey-500">{error || 'لم تتم عملية الدفع. يمكنك المحاولة مرة أخرى.'}</p>
            </div>

            {data && (
              <div className="bg-white rounded-2xl border border-grey-100 p-5 mb-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-grey-500">رقم الطلب</span>
                  <span className="text-sm font-bold text-grey-700">#{data.order_number}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-grey-500">المبلغ</span>
                  <span className="text-lg font-bold text-grey-900">{fmtPrice(data.amount)} ر.ق</span>
                </div>
              </div>
            )}

            <button onClick={() => { setPhase('loading'); initiatePayment(); }}
              className="w-full py-4 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-800/15 mb-3">
              <span className="material-icons-outlined text-lg">refresh</span>
              إعادة المحاولة
            </button>

            <Link href={`${base}/cart`}
              className="w-full py-3 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center justify-center gap-2">
              <span className="material-icons-outlined text-lg">arrow_forward</span>
              العودة للسلة
            </Link>
          </div>
        )}

        {/* ═══ Expired ═══ */}
        {phase === 'expired' && (
          <div className="animate-fade-in text-center">
            <div className="w-24 h-24 mx-auto mb-4 rounded-full bg-grey-100 flex items-center justify-center">
              <span className="material-icons-outlined text-5xl text-grey-400">timer_off</span>
            </div>
            <h1 className="font-tajawal text-2xl font-black text-grey-900 mb-2">انتهت صلاحية الدفع</h1>
            <p className="text-sm text-grey-500 mb-6">جلسة الدفع انتهت. يرجى إعادة الطلب.</p>

            <Link href={`${base}/cart`}
              className="inline-flex py-3 px-8 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all items-center gap-2">
              <span className="material-icons-outlined text-lg">shopping_cart</span>
              العودة للسلة
            </Link>
          </div>
        )}

        {/* ═══ Bank Transfer ═══ */}
        {phase === 'bank_transfer' && data?.bank_details && (
          <div className="animate-fade-in">
            <div className="text-center mb-6">
              <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-blue-50 flex items-center justify-center">
                <span className="material-icons-outlined text-4xl text-blue-600">account_balance</span>
              </div>
              <h1 className="font-tajawal text-xl font-bold text-grey-900 mb-1">تحويل بنكي</h1>
              <p className="text-sm text-grey-500">حوّل المبلغ التالي وسيتم تأكيد طلبك بعد التحقق</p>
            </div>

            {/* Amount */}
            <div className="bg-brand-800 rounded-2xl p-5 text-center mb-4">
              <p className="text-xs text-brand-200 mb-1">المبلغ المطلوب</p>
              <p className="font-tajawal text-3xl font-black text-white">
                {fmtPrice(data.amount)} <span className="text-base text-brand-200">ر.ق</span>
              </p>
              <p className="text-xs text-brand-300 mt-1">الطلب #{data.order_number}</p>
            </div>

            {/* Bank Details */}
            <div className="bg-white rounded-2xl border border-grey-100 p-5 space-y-4 mb-4">
              {[
                { label: 'البنك', value: data.bank_details.bank_name, key: 'bank' },
                { label: 'اسم الحساب', value: data.bank_details.account_name, key: 'name' },
                { label: 'IBAN', value: data.bank_details.iban, key: 'iban' },
                { label: 'SWIFT', value: data.bank_details.swift, key: 'swift' },
                { label: 'مرجع التحويل', value: data.bank_details.reference, key: 'ref' },
              ].map((field) => (
                <div key={field.key}>
                  <p className="text-xs text-grey-400 mb-1">{field.label}</p>
                  <div className="flex items-center gap-2">
                    <span className={`text-sm font-bold text-grey-800 flex-1 ${field.key === 'iban' || field.key === 'ref' ? 'font-mono text-xs' : ''}`}>
                      {field.value}
                    </span>
                    <button onClick={() => copyText(field.value, field.key)}
                      className="p-1.5 rounded-lg hover:bg-grey-100 transition-all flex-shrink-0">
                      <span className="material-icons-outlined text-sm text-grey-400">
                        {copied === field.key ? 'check' : 'content_copy'}
                      </span>
                    </button>
                  </div>
                </div>
              ))}

              {data.bank_details.instructions && (
                <div className="bg-amber-50 rounded-xl p-3">
                  <div className="flex gap-2">
                    <span className="material-icons-outlined text-amber-600 text-sm mt-0.5">info</span>
                    <p className="text-xs text-amber-700">{data.bank_details.instructions}</p>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-grey-50 rounded-2xl p-4 mb-4">
              <div className="flex gap-2 mb-2">
                <span className="material-icons-outlined text-grey-400 text-sm mt-0.5">warning</span>
                <p className="text-xs text-grey-600 font-bold">تعليمات مهمة:</p>
              </div>
              <ul className="text-xs text-grey-500 space-y-1 pr-5">
                <li>• اكتب مرجع التحويل في وصف الحوالة</li>
                <li>• سيتم تأكيد الطلب خلال ١-٢ يوم عمل بعد التحقق</li>
                <li>• لا تنسَ إرسال إيصال التحويل عبر واتساب</li>
              </ul>
            </div>

            <Link href={`${base}/order/${data.order_number}`}
              className="w-full py-4 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center justify-center gap-2 shadow-lg shadow-brand-800/15 mb-3">
              <span className="material-icons-outlined text-lg">receipt_long</span>
              عرض الطلب
            </Link>

            <Link href={base}
              className="w-full py-3 rounded-xl bg-grey-100 text-grey-600 text-sm font-bold hover:bg-grey-200 transition-all flex items-center justify-center gap-2">
              متابعة التسوق
            </Link>
          </div>
        )}

        {/* ═══ Security Footer ═══ */}
        <div className="flex items-center justify-center gap-4 mt-8 text-xs text-grey-300">
          <div className="flex items-center gap-1">
            <span className="material-icons-outlined text-[14px]">lock</span>
            اتصال مشفّر
          </div>
          <div className="flex items-center gap-1">
            <span className="material-icons-outlined text-[14px]">verified_user</span>
            دفع آمن
          </div>
        </div>

        <div className="text-center mt-4">
          <Link href={base} className="text-xs text-grey-400 hover:text-brand-800 transition-colors font-bold">
            ساس<span className="text-brand-800">.</span>
          </Link>
        </div>
      </div>

      {/* ═══ Animations ═══ */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(12px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes scaleIn { from { transform: scale(0); } to { transform: scale(1); } }
        @keyframes progress { 0% { width: 0; } 50% { width: 80%; } 100% { width: 100%; } }
        .animate-fade-in { animation: fadeIn 0.5s ease-out; }
        .animate-scale-in { animation: scaleIn 0.5s cubic-bezier(0.34,1.56,0.64,1) 0.2s both; }
        .animate-progress { animation: progress 3s ease-in-out infinite; }
      `}</style>
    </div>
  );
}
