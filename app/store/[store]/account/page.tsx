'use client';

/**
 * ساس — Customer Account Page (Storefront)
 * محادثة ٧: حساب المستهلك — دخول OTP + طلباتي + عناويني + بياناتي
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';

// ═══ Types ═══
interface CustomerProfile { id: string; name: string; phone: string; email: string | null; orders_count: number; total_spent: number; }
interface OrderItem { id: string; order_number: string; status: string; total: number; payment_status: string; items_count: number; created_at: string; }
interface Address { id: string; label: string; city: string; area: string; street: string; building: string; is_default: boolean; }

const STATUS_MAP: Record<string, { label: string; color: string; icon: string }> = {
  new:        { label: 'جديد',         color: 'text-blue-600 bg-blue-50',     icon: 'fiber_new' },
  confirmed:  { label: 'مؤكد',         color: 'text-indigo-600 bg-indigo-50', icon: 'check_circle' },
  processing: { label: 'قيد التجهيز',  color: 'text-amber-600 bg-amber-50',   icon: 'inventory' },
  shipped:    { label: 'تم الشحن',     color: 'text-purple-600 bg-purple-50', icon: 'local_shipping' },
  delivered:  { label: 'تم التوصيل',   color: 'text-green-600 bg-green-50',   icon: 'done_all' },
  cancelled:  { label: 'ملغي',         color: 'text-red-600 bg-red-50',       icon: 'cancel' },
  returned:   { label: 'مسترجع',       color: 'text-orange-600 bg-orange-50', icon: 'assignment_return' },
};

const TABS = [
  { id: 'orders', label: 'طلباتي', icon: 'shopping_bag' },
  { id: 'addresses', label: 'عناويني', icon: 'location_on' },
  { id: 'profile', label: 'بياناتي', icon: 'person' },
];

export default function AccountPage({ params }: { params: { store: string } }) {
  const { store } = params;
  const base = `/store/${store}`;
  const apiBase = `/api/store/${store}/account`;
  const fmtPrice = (n: number) => Number(n).toLocaleString('ar-QA', { minimumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric', year: 'numeric' });

  // ═══ Auth State ═══
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, setToken] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState('');

  // ═══ Account State ═══
  const [tab, setTab] = useState('orders');
  const [profile, setProfile] = useState<CustomerProfile | null>(null);
  const [orders, setOrders] = useState<OrderItem[]>([]);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(false);

  // ═══ Profile Edit ═══
  const [editName, setEditName] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // Check existing token
  useEffect(() => {
    const savedToken = localStorage.getItem(`saas_customer_token_${store}`);
    if (savedToken) {
      setToken(savedToken);
      setIsLoggedIn(true);
    }
  }, [store]);

  // Load data when logged in
  useEffect(() => {
    if (isLoggedIn && token) {
      loadProfile();
      loadOrders();
      loadAddresses();
    }
  }, [isLoggedIn, token]);

  const authHeaders = { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' };

  // ═══ Auth Functions ═══
  const sendOtp = async () => {
    if (!phone || phone.length < 8) { setAuthError('أدخل رقم الجوال (٨ أرقام)'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${apiBase}/send-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });
      const data = await res.json();
      if (data.success) { setOtpSent(true); }
      else { setAuthError(data.error); }
    } catch { setAuthError('خطأ في الاتصال'); }
    setAuthLoading(false);
  };

  const verifyOtp = async () => {
    if (!otp || otp.length < 4) { setAuthError('أدخل رمز التحقق'); return; }
    setAuthLoading(true); setAuthError('');
    try {
      const res = await fetch(`${apiBase}/verify-otp`, {
        method: 'POST', headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, otp }),
      });
      const data = await res.json();
      if (data.success) {
        setToken(data.data.token);
        localStorage.setItem(`saas_customer_token_${store}`, data.data.token);
        setIsLoggedIn(true);
      } else { setAuthError(data.error); }
    } catch { setAuthError('خطأ في الاتصال'); }
    setAuthLoading(false);
  };

  const logout = () => {
    localStorage.removeItem(`saas_customer_token_${store}`);
    setIsLoggedIn(false); setToken(''); setProfile(null);
    setOrders([]); setAddresses([]);
    setPhone(''); setOtp(''); setOtpSent(false);
  };

  // ═══ Data Functions ═══
  const loadProfile = async () => {
    try {
      const res = await fetch(`${apiBase}/me`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) { setProfile(data.data); setEditName(data.data.name || ''); setEditEmail(data.data.email || ''); }
      else if (res.status === 401) logout();
    } catch {}
  };

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch(`${apiBase}/orders?limit=50`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setOrders(data.data || []);
    } catch {}
    setLoading(false);
  };

  const loadAddresses = async () => {
    try {
      const res = await fetch(`${apiBase}/addresses`, { headers: authHeaders });
      const data = await res.json();
      if (data.success) setAddresses(data.data || []);
    } catch {}
  };

  const saveProfile = async () => {
    try {
      const res = await fetch(`${apiBase}/me`, {
        method: 'PUT', headers: authHeaders,
        body: JSON.stringify({ name: editName, email: editEmail || undefined }),
      });
      const data = await res.json();
      if (data.success) { setProfileSaved(true); loadProfile(); setTimeout(() => setProfileSaved(false), 2000); }
    } catch {}
  };

  const deleteAddress = async (addrId: string) => {
    try {
      await fetch(`${apiBase}/addresses/${addrId}`, { method: 'DELETE', headers: authHeaders });
      loadAddresses();
    } catch {}
  };

  // ═══ LOGIN SCREEN ═══
  if (!isLoggedIn) {
    return (
      <div className="max-w-md mx-auto px-4 py-16">
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-2xl bg-brand-50 flex items-center justify-center mx-auto mb-4">
            <span className="material-icons-outlined text-brand-800 text-3xl">person</span>
          </div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-1">حسابي</h1>
          <p className="text-sm text-grey-400">ادخل برقم جوالك لتتبع طلباتك</p>
        </div>

        <div className="rounded-2xl bg-grey-50 border border-grey-100 p-6">
          {authError && (
            <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 flex items-center gap-2">
              <span className="material-icons-outlined text-red-400 text-sm">error</span>
              <p className="text-sm text-red-600 font-semibold">{authError}</p>
            </div>
          )}

          {!otpSent ? (
            <div className="space-y-4">
              <div>
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">رقم الجوال</label>
                <div className="flex gap-2">
                  <div className="flex items-center gap-1.5 px-3 py-3 rounded-xl bg-grey-100 border border-grey-200 text-sm text-grey-500 font-semibold flex-shrink-0">
                    <span className="text-xs">🇶🇦</span>+974
                  </div>
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                    placeholder="55001234" dir="ltr" maxLength={8}
                    className="flex-1 px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
                </div>
              </div>
              <button onClick={sendOtp} disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {authLoading ? <span className="material-icons-outlined animate-spin text-lg">autorenew</span> : <span className="material-icons-outlined text-lg">send</span>}
                إرسال رمز التحقق
              </button>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm text-grey-600 text-center">تم إرسال رمز التحقق إلى <span className="font-bold font-mono" dir="ltr">+974 {phone}</span></p>
              <div>
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">رمز التحقق</label>
                <input type="text" value={otp} onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                  placeholder="٠٠٠٠" dir="ltr" maxLength={4} autoFocus
                  className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-center text-xl font-mono tracking-[0.5em] focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
              </div>
              <button onClick={verifyOtp} disabled={authLoading}
                className="w-full py-3.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-60 transition-all flex items-center justify-center gap-2">
                {authLoading ? <span className="material-icons-outlined animate-spin text-lg">autorenew</span> : <span className="material-icons-outlined text-lg">login</span>}
                تسجيل الدخول
              </button>
              <button onClick={() => { setOtpSent(false); setOtp(''); setAuthError(''); }} className="w-full text-sm text-grey-500 hover:text-grey-700">
                تغيير رقم الجوال
              </button>
            </div>
          )}
        </div>
      </div>
    );
  }

  // ═══ ACCOUNT SCREEN ═══
  return (
    <div className="max-w-3xl mx-auto px-4 py-6 pb-20">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-full bg-brand-50 flex items-center justify-center">
            <span className="font-tajawal text-lg font-bold text-brand-800">{profile?.name?.[0] || '؟'}</span>
          </div>
          <div>
            <h1 className="font-tajawal text-lg font-bold text-grey-900">{profile?.name || 'مرحباً'}</h1>
            <p className="text-xs text-grey-400 font-mono" dir="ltr">+974 {profile?.phone}</p>
          </div>
        </div>
        <button onClick={logout} className="text-xs text-red-400 hover:text-red-500 font-semibold flex items-center gap-1">
          <span className="material-icons-outlined text-sm">logout</span> خروج
        </button>
      </div>

      {/* Quick Stats */}
      {profile && (
        <div className="grid grid-cols-2 gap-3 mb-6">
          <div className="rounded-2xl bg-grey-50 border border-grey-100 p-4 text-center">
            <p className="text-2xl font-bold text-grey-900">{profile.orders_count}</p>
            <p className="text-xs text-grey-400 mt-0.5">طلب</p>
          </div>
          <div className="rounded-2xl bg-grey-50 border border-grey-100 p-4 text-center">
            <p className="text-2xl font-bold text-brand-800">{fmtPrice(profile.total_spent)}</p>
            <p className="text-xs text-grey-400 mt-0.5">ر.ق مشتريات</p>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-6 bg-grey-100 rounded-xl p-1">
        {TABS.map(t => (
          <button key={t.id} onClick={() => setTab(t.id)}
            className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg text-xs font-bold transition-all
              ${tab === t.id ? 'bg-white text-brand-800 shadow-sm' : 'text-grey-500 hover:text-grey-700'}`}>
            <span className="material-icons-outlined text-sm">{t.icon}</span>
            {t.label}
          </button>
        ))}
      </div>

      {/* ═══ TAB: Orders ═══ */}
      {tab === 'orders' && (
        <div>
          {loading ? (
            <div className="text-center py-12">
              <span className="material-icons-outlined animate-spin text-2xl text-brand-800 mb-2 block">autorenew</span>
              <p className="text-sm text-grey-400">جارِ التحميل...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-outlined text-5xl text-grey-200 mb-3 block">shopping_bag</span>
              <h3 className="text-base font-bold text-grey-700 mb-1">لا توجد طلبات</h3>
              <Link href={`${base}/products`} className="text-brand-800 text-sm font-semibold hover:underline">تصفح المنتجات</Link>
            </div>
          ) : (
            <div className="space-y-3">
              {orders.map(o => {
                const st = STATUS_MAP[o.status] || STATUS_MAP.new;
                return (
                  <Link key={o.id} href={`${base}/order/${o.order_number}`}
                    className="block rounded-2xl bg-grey-50 border border-grey-100 p-4 hover:border-grey-200 transition-all">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-brand-800" dir="ltr">{o.order_number}</p>
                        <p className="text-xs text-grey-400 mt-0.5">{fmtDate(o.created_at)}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${st.color}`}>
                        <span className="material-icons-outlined text-[11px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-grey-400">{o.items_count} منتج</span>
                      <span className="text-sm font-bold text-grey-900">{fmtPrice(o.total)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Addresses ═══ */}
      {tab === 'addresses' && (
        <div>
          {addresses.length === 0 ? (
            <div className="text-center py-12">
              <span className="material-icons-outlined text-5xl text-grey-200 mb-3 block">location_on</span>
              <h3 className="text-base font-bold text-grey-700 mb-1">لا توجد عناوين</h3>
              <p className="text-sm text-grey-400">ستُضاف عناوينك تلقائياً عند الطلب</p>
            </div>
          ) : (
            <div className="space-y-3">
              {addresses.map(a => (
                <div key={a.id} className="rounded-2xl bg-grey-50 border border-grey-100 p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="material-icons-outlined text-brand-800 text-lg">location_on</span>
                      <span className="text-sm font-bold text-grey-800">{a.label}</span>
                      {a.is_default && <span className="text-[0.55rem] bg-brand-50 text-brand-800 px-1.5 py-0.5 rounded font-semibold">افتراضي</span>}
                    </div>
                    <button onClick={() => deleteAddress(a.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                      <span className="material-icons-outlined text-grey-300 hover:text-red-400 text-lg">delete</span>
                    </button>
                  </div>
                  <p className="text-sm text-grey-600">{[a.city, a.area, a.street].filter(Boolean).join('، ')}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ TAB: Profile ═══ */}
      {tab === 'profile' && (
        <div className="space-y-4">
          <div className="rounded-2xl bg-grey-50 border border-grey-100 p-5">
            <div className="space-y-3">
              <div>
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">الاسم</label>
                <input type="text" value={editName} onChange={e => { setEditName(e.target.value); setProfileSaved(false); }}
                  className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">الجوال</label>
                <input type="text" value={`+974 ${profile?.phone || ''}`} disabled dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-grey-100 border border-grey-200 text-grey-500 text-sm cursor-not-allowed" />
              </div>
              <div>
                <label className="block text-xs text-grey-500 font-semibold mb-1.5">البريد الإلكتروني</label>
                <input type="email" value={editEmail} onChange={e => { setEditEmail(e.target.value); setProfileSaved(false); }}
                  placeholder="example@email.com" dir="ltr"
                  className="w-full px-4 py-3 rounded-xl bg-white border border-grey-200 text-grey-900 text-sm focus:border-brand-500 focus:ring-2 focus:ring-brand-500/10 outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-2 mt-4">
              <button onClick={saveProfile}
                className="px-6 py-3 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 transition-all flex items-center gap-2">
                <span className="material-icons-outlined text-sm">save</span> حفظ التعديلات
              </button>
              {profileSaved && <span className="text-xs text-green-600 font-semibold animate-fade-in">✓ تم الحفظ</span>}
            </div>
          </div>

          <button onClick={logout}
            className="w-full py-3 rounded-xl bg-red-50 text-red-500 text-sm font-bold hover:bg-red-100 transition-all flex items-center justify-center gap-2">
            <span className="material-icons-outlined text-sm">logout</span> تسجيل الخروج
          </button>
        </div>
      )}
    </div>
  );
}
