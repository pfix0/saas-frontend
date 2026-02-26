'use client';

/**
 * ساس — Shipping Carriers Configuration
 * محادثة ١١: إعدادات شركات الشحن
 * Aramex + DHL + توصيل محلي + استلام من المتجر
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface CarrierState {
  // Aramex
  aramex_enabled: boolean;
  aramex_username: string;
  aramex_password: string;
  aramex_account_number: string;
  aramex_account_pin: string;
  aramex_entity: string;
  aramex_country_code: string;
  aramex_sandbox: boolean;
  // DHL
  dhl_enabled: boolean;
  dhl_api_key: string;
  dhl_api_secret: string;
  dhl_account_number: string;
  dhl_sandbox: boolean;
  // Local Delivery
  local_enabled: boolean;
  local_name: string;
  local_cost: number;
  local_estimated_days: number;
  local_areas: string;
  // Pickup
  pickup_enabled: boolean;
  pickup_address: string;
  pickup_hours: string;
  pickup_notes: string;
  // Free shipping
  free_shipping_enabled: boolean;
  free_shipping_min: number;
}

const defaultState: CarrierState = {
  aramex_enabled: false,
  aramex_username: '',
  aramex_password: '',
  aramex_account_number: '',
  aramex_account_pin: '',
  aramex_entity: 'DOH',
  aramex_country_code: 'QA',
  aramex_sandbox: true,
  dhl_enabled: false,
  dhl_api_key: '',
  dhl_api_secret: '',
  dhl_account_number: '',
  dhl_sandbox: true,
  local_enabled: true,
  local_name: 'توصيل محلي',
  local_cost: 20,
  local_estimated_days: 1,
  local_areas: '',
  pickup_enabled: false,
  pickup_address: '',
  pickup_hours: '',
  pickup_notes: '',
  free_shipping_enabled: false,
  free_shipping_min: 200,
};

export default function ShippingCarriersPage() {
  const [form, setForm] = useState<CarrierState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeCarrier, setActiveCarrier] = useState('aramex');
  const [testing, setTesting] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/api/settings/shipping-carriers');
      if (res.data) setForm({ ...defaultState, ...res.data });
    } catch {}
    setLoading(false);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/settings/shipping-carriers', form);
      if (res.success) showToast('تم حفظ إعدادات الشحن بنجاح');
      else showToast('فشل الحفظ');
    } catch { showToast('خطأ في الحفظ'); }
    setSaving(false);
  };

  const testCarrier = async (carrier: string) => {
    setTesting(carrier);
    try {
      const res = await api.post('/api/settings/shipping-carriers/test', { carrier });
      showToast(res.success ? `✅ اتصال ${carrier} ناجح!` : `❌ فشل: ${res.error}`);
    } catch { showToast('❌ خطأ في الاختبار'); }
    setTesting('');
  };

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };
  const update = (key: keyof CarrierState, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const carriers = [
    { key: 'aramex', label: 'Aramex', icon: 'local_shipping', desc: 'شحن سريع دولي ومحلي', enabled: form.aramex_enabled, color: 'bg-orange-500' },
    { key: 'dhl', label: 'DHL', icon: 'flight', desc: 'شحن دولي سريع', enabled: form.dhl_enabled, color: 'bg-yellow-500' },
    { key: 'local', label: 'توصيل محلي', icon: 'delivery_dining', desc: 'توصيل داخل قطر', enabled: form.local_enabled, color: 'bg-emerald-500' },
    { key: 'pickup', label: 'استلام من المتجر', icon: 'storefront', desc: 'العميل يستلم بنفسه', enabled: form.pickup_enabled, color: 'bg-blue-500' },
  ];

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-grey-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xl z-50 animate-slide-down">{toast}</div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/settings" className="p-1 rounded-lg hover:bg-grey-100">
              <span className="material-icons-outlined text-grey-400 text-lg">arrow_forward</span>
            </Link>
            <h1 className="text-xl font-bold text-grey-900">شركات الشحن</h1>
          </div>
          <p className="text-sm text-grey-500">إعداد وربط شركات الشحن والتوصيل</p>
        </div>
        <button onClick={saveConfig} disabled={saving}
          className="px-6 py-2.5 rounded-xl bg-brand-800 text-white text-sm font-bold hover:bg-brand-700 disabled:opacity-50 transition-all flex items-center gap-2 shadow-lg shadow-brand-800/15">
          {saving ? (
            <><span className="material-icons-outlined text-sm animate-spin">sync</span> جارِ الحفظ...</>
          ) : (
            <><span className="material-icons-outlined text-sm">save</span> حفظ الإعدادات</>
          )}
        </button>
      </div>

      {/* Free Shipping Banner */}
      <div className="bg-emerald-50 rounded-xl border border-emerald-100 p-4 flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <span className="material-icons-outlined text-emerald-600 text-2xl">redeem</span>
          <div>
            <h3 className="text-sm font-bold text-emerald-800">شحن مجاني</h3>
            <p className="text-xs text-emerald-600">فعّل الشحن المجاني للطلبات فوق مبلغ معين</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {form.free_shipping_enabled && (
            <div className="flex items-center gap-2">
              <span className="text-xs text-emerald-600">الحد الأدنى:</span>
              <input type="number" value={form.free_shipping_min}
                onChange={(e) => update('free_shipping_min', parseFloat(e.target.value) || 0)}
                className="w-24 px-3 py-1.5 rounded-lg border border-emerald-200 text-sm text-center focus:border-emerald-400 outline-none" />
              <span className="text-xs text-emerald-600">ر.ق</span>
            </div>
          )}
          <Toggle enabled={form.free_shipping_enabled} onChange={(v) => update('free_shipping_enabled', v)} />
        </div>
      </div>

      {/* Carrier Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {carriers.map((c) => (
          <button key={c.key} onClick={() => setActiveCarrier(c.key)}
            className={`relative bg-white rounded-xl border-2 p-4 transition-all text-right
              ${activeCarrier === c.key ? 'border-brand-800 shadow-lg shadow-brand-800/5' : 'border-grey-100 hover:border-grey-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${c.color} flex items-center justify-center`}>
                <span className="material-icons-outlined text-white text-lg">{c.icon}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${c.enabled ? 'bg-emerald-400' : 'bg-grey-200'}`} />
            </div>
            <h3 className="text-sm font-bold text-grey-900 mb-0.5">{c.label}</h3>
            <p className="text-xs text-grey-400">{c.enabled ? 'مفعّل' : 'معطّل'}</p>
          </button>
        ))}
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">

        {/* ═══ Aramex ═══ */}
        {activeCarrier === 'aramex' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-orange-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">local_shipping</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">Aramex</h2>
                  <p className="text-xs text-grey-500">شحن سريع محلي ودولي</p>
                </div>
              </div>
              <Toggle enabled={form.aramex_enabled} onChange={(v) => update('aramex_enabled', v)} />
            </div>

            {form.aramex_enabled && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-amber-600 text-lg">science</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800">وضع الاختبار (Sandbox)</p>
                      <p className="text-xs text-amber-600">للتجربة بدون شحنات حقيقية</p>
                    </div>
                  </div>
                  <Toggle enabled={form.aramex_sandbox} onChange={(v) => update('aramex_sandbox', v)} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField label="اسم المستخدم" value={form.aramex_username}
                    onChange={(v) => update('aramex_username', v)} placeholder="Aramex Username" />
                  <FormField label="كلمة المرور" value={form.aramex_password}
                    onChange={(v) => update('aramex_password', v)} placeholder="••••••" secret />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField label="رقم الحساب" value={form.aramex_account_number}
                    onChange={(v) => update('aramex_account_number', v)} placeholder="Account Number" />
                  <FormField label="رمز PIN" value={form.aramex_account_pin}
                    onChange={(v) => update('aramex_account_pin', v)} placeholder="Account PIN" secret />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <FormField label="الكيان (Entity)" value={form.aramex_entity}
                    onChange={(v) => update('aramex_entity', v)} placeholder="DOH" />
                  <FormField label="رمز الدولة" value={form.aramex_country_code}
                    onChange={(v) => update('aramex_country_code', v)} placeholder="QA" />
                </div>

                <div className="bg-orange-50 rounded-xl p-4">
                  <p className="text-xs text-orange-700 font-bold mb-1">خدمات Aramex المتاحة:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Express', 'Economy', 'Value Express', 'Domestic'].map(s => (
                      <span key={s} className="px-3 py-1 rounded-full bg-white text-xs text-orange-600 border border-orange-200">{s}</span>
                    ))}
                  </div>
                </div>

                <button onClick={() => testCarrier('aramex')} disabled={!!testing}
                  className="w-full py-3 rounded-xl border-2 border-orange-200 text-orange-600 text-sm font-bold hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
                  {testing === 'aramex' ? (
                    <><span className="material-icons-outlined text-sm animate-spin">sync</span> جارِ الاختبار...</>
                  ) : (
                    <><span className="material-icons-outlined text-sm">play_arrow</span> اختبار الاتصال</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ DHL ═══ */}
        {activeCarrier === 'dhl' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-yellow-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">flight</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">DHL Express</h2>
                  <p className="text-xs text-grey-500">شحن دولي سريع — MyDHL API</p>
                </div>
              </div>
              <Toggle enabled={form.dhl_enabled} onChange={(v) => update('dhl_enabled', v)} />
            </div>

            {form.dhl_enabled && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-amber-600 text-lg">science</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800">وضع الاختبار</p>
                      <p className="text-xs text-amber-600">للتجربة بدون شحنات حقيقية</p>
                    </div>
                  </div>
                  <Toggle enabled={form.dhl_sandbox} onChange={(v) => update('dhl_sandbox', v)} />
                </div>

                <FormField label="API Key" value={form.dhl_api_key}
                  onChange={(v) => update('dhl_api_key', v)} placeholder="dhl_api_..." />
                <FormField label="API Secret" value={form.dhl_api_secret}
                  onChange={(v) => update('dhl_api_secret', v)} placeholder="dhl_secret_..." secret />
                <FormField label="رقم الحساب" value={form.dhl_account_number}
                  onChange={(v) => update('dhl_account_number', v)} placeholder="DHL Account Number" />

                <div className="bg-yellow-50 rounded-xl p-4">
                  <p className="text-xs text-yellow-700 font-bold mb-1">خدمات DHL المتاحة:</p>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {['Express Worldwide', 'Express 12:00', 'Express Easy'].map(s => (
                      <span key={s} className="px-3 py-1 rounded-full bg-white text-xs text-yellow-600 border border-yellow-200">{s}</span>
                    ))}
                  </div>
                </div>

                <button onClick={() => testCarrier('dhl')} disabled={!!testing}
                  className="w-full py-3 rounded-xl border-2 border-yellow-300 text-yellow-700 text-sm font-bold hover:bg-yellow-50 transition-all flex items-center justify-center gap-2">
                  {testing === 'dhl' ? (
                    <><span className="material-icons-outlined text-sm animate-spin">sync</span> جارِ الاختبار...</>
                  ) : (
                    <><span className="material-icons-outlined text-sm">play_arrow</span> اختبار الاتصال</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ Local Delivery ═══ */}
        {activeCarrier === 'local' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">delivery_dining</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">توصيل محلي</h2>
                  <p className="text-xs text-grey-500">توصيل داخل قطر بسعر ثابت أو مخصص</p>
                </div>
              </div>
              <Toggle enabled={form.local_enabled} onChange={(v) => update('local_enabled', v)} />
            </div>

            {form.local_enabled && (
              <div className="space-y-4 animate-fade-in">
                <FormField label="اسم خدمة التوصيل" value={form.local_name}
                  onChange={(v) => update('local_name', v)} placeholder="توصيل محلي" />
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-bold text-grey-700 mb-1.5 block">تكلفة التوصيل (ر.ق)</label>
                    <input type="number" value={form.local_cost}
                      onChange={(e) => update('local_cost', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none" />
                  </div>
                  <div>
                    <label className="text-sm font-bold text-grey-700 mb-1.5 block">أيام التوصيل المتوقعة</label>
                    <input type="number" value={form.local_estimated_days}
                      onChange={(e) => update('local_estimated_days', parseInt(e.target.value) || 1)}
                      className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-sm font-bold text-grey-700 mb-1.5 block">المناطق المتاحة</label>
                  <textarea value={form.local_areas}
                    onChange={(e) => update('local_areas', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none resize-none h-20"
                    placeholder="اتركه فارغاً لتوصيل لكل قطر، أو اكتب المناطق (سطر لكل منطقة)" />
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Pickup ═══ */}
        {activeCarrier === 'pickup' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">storefront</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">استلام من المتجر</h2>
                  <p className="text-xs text-grey-500">العميل يستلم الطلب بنفسه — مجاني</p>
                </div>
              </div>
              <Toggle enabled={form.pickup_enabled} onChange={(v) => update('pickup_enabled', v)} />
            </div>

            {form.pickup_enabled && (
              <div className="space-y-4 animate-fade-in">
                <FormField label="عنوان الاستلام" value={form.pickup_address}
                  onChange={(v) => update('pickup_address', v)} placeholder="العنوان الكامل..." />
                <FormField label="ساعات العمل" value={form.pickup_hours}
                  onChange={(v) => update('pickup_hours', v)} placeholder="السبت-الخميس: ٩ص-٩م" />
                <div>
                  <label className="text-sm font-bold text-grey-700 mb-1.5 block">ملاحظات إضافية</label>
                  <textarea value={form.pickup_notes}
                    onChange={(e) => update('pickup_notes', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none resize-none h-20"
                    placeholder="تعليمات تظهر للعميل..." />
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ═══ Shared Components ═══

function Toggle({ enabled, onChange }: { enabled: boolean; onChange: (v: boolean) => void }) {
  return (
    <button onClick={() => onChange(!enabled)}
      className={`relative w-12 h-7 rounded-full transition-all duration-200 flex-shrink-0
        ${enabled ? 'bg-brand-800' : 'bg-grey-200'}`}>
      <div className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all duration-200
        ${enabled ? 'right-1' : 'right-6'}`} />
    </button>
  );
}

function FormField({ label, value, onChange, placeholder, secret = false }: {
  label: string; value: string; onChange: (v: string) => void; placeholder?: string; secret?: boolean;
}) {
  const [show, setShow] = useState(false);
  return (
    <div>
      <label className="text-sm font-bold text-grey-700 mb-1.5 block">{label}</label>
      <div className="relative">
        <input type={secret && !show ? 'password' : 'text'} value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none font-mono"
          placeholder={placeholder} dir="ltr" />
        {secret && (
          <button type="button" onClick={() => setShow(!show)}
            className="absolute left-3 top-1/2 -translate-y-1/2 p-1 rounded hover:bg-grey-100">
            <span className="material-icons-outlined text-sm text-grey-400">{show ? 'visibility_off' : 'visibility'}</span>
          </button>
        )}
      </div>
    </div>
  );
}
