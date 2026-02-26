'use client';

/**
 * ساس — Payment Gateways Configuration
 * محادثة ١٠: إعدادات بوابات الدفع المفصّلة
 * SkipCash + SADAD + COD + Bank Transfer
 */

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface GatewayState {
  // SkipCash
  skipcash_enabled: boolean;
  skipcash_merchant_id: string;
  skipcash_api_key: string;
  skipcash_secret_key: string;
  skipcash_sandbox: boolean;
  // SADAD
  sadad_enabled: boolean;
  sadad_merchant_id: string;
  sadad_terminal_id: string;
  sadad_secret_key: string;
  sadad_sandbox: boolean;
  // COD
  cod_enabled: boolean;
  cod_max_amount: number;
  // Bank Transfer
  bank_transfer_enabled: boolean;
  bank_name: string;
  account_name: string;
  iban: string;
  swift: string;
  bank_instructions: string;
}

const defaultState: GatewayState = {
  skipcash_enabled: false,
  skipcash_merchant_id: '',
  skipcash_api_key: '',
  skipcash_secret_key: '',
  skipcash_sandbox: true,
  sadad_enabled: false,
  sadad_merchant_id: '',
  sadad_terminal_id: '',
  sadad_secret_key: '',
  sadad_sandbox: true,
  cod_enabled: true,
  cod_max_amount: 5000,
  bank_transfer_enabled: false,
  bank_name: '',
  account_name: '',
  iban: '',
  swift: '',
  bank_instructions: '',
};

export default function PaymentGatewaysPage() {
  const [form, setForm] = useState<GatewayState>(defaultState);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState('');
  const [activeGateway, setActiveGateway] = useState<string>('skipcash');
  const [testing, setTesting] = useState('');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      const res = await api.get('/api/settings/payment-gateways');
      if (res.data) setForm({ ...defaultState, ...res.data });
    } catch {}
    setLoading(false);
  };

  const saveConfig = async () => {
    setSaving(true);
    try {
      const res = await api.put('/api/settings/payment-gateways', form);
      if (res.success) {
        showToast('تم حفظ إعدادات الدفع بنجاح');
      } else {
        showToast('فشل الحفظ — حاول مرة أخرى');
      }
    } catch {
      showToast('خطأ في الحفظ');
    }
    setSaving(false);
  };

  const testGateway = async (gateway: string) => {
    setTesting(gateway);
    try {
      const res = await api.post(`/api/settings/payment-gateways/test`, { gateway });
      if (res.success) {
        showToast(`✅ اتصال ${gateway} ناجح!`);
      } else {
        showToast(`❌ فشل الاتصال: ${res.error}`);
      }
    } catch {
      showToast('❌ خطأ في الاختبار');
    }
    setTesting('');
  };

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  const update = (key: keyof GatewayState, val: any) => setForm(prev => ({ ...prev, [key]: val }));

  const gateways = [
    { key: 'skipcash', label: 'SkipCash', icon: 'credit_card', desc: 'بوابة دفع إلكتروني قطرية', enabled: form.skipcash_enabled, color: 'bg-violet-500' },
    { key: 'sadad', label: 'SADAD', icon: 'account_balance', desc: 'بوابة سداد للدفع الإلكتروني', enabled: form.sadad_enabled, color: 'bg-blue-500' },
    { key: 'cod', label: 'الدفع عند الاستلام', icon: 'payments', desc: 'العميل يدفع نقداً عند التوصيل', enabled: form.cod_enabled, color: 'bg-emerald-500' },
    { key: 'bank_transfer', label: 'تحويل بنكي', icon: 'account_balance_wallet', desc: 'تحويل مباشر لحسابك البنكي', enabled: form.bank_transfer_enabled, color: 'bg-amber-500' },
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
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 bg-grey-900 text-white px-5 py-3 rounded-xl text-sm font-bold shadow-xl z-50 animate-slide-down">
          {toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/dashboard/settings" className="p-1 rounded-lg hover:bg-grey-100">
              <span className="material-icons-outlined text-grey-400 text-lg">arrow_forward</span>
            </Link>
            <h1 className="text-xl font-bold text-grey-900">بوابات الدفع</h1>
          </div>
          <p className="text-sm text-grey-500">إعداد وربط بوابات الدفع الإلكتروني لمتجرك</p>
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

      {/* Gateway Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {gateways.map((gw) => (
          <button key={gw.key} onClick={() => setActiveGateway(gw.key)}
            className={`relative bg-white rounded-xl border-2 p-4 transition-all text-right
              ${activeGateway === gw.key ? 'border-brand-800 shadow-lg shadow-brand-800/5' : 'border-grey-100 hover:border-grey-200'}`}>
            <div className="flex items-center justify-between mb-3">
              <div className={`w-10 h-10 rounded-xl ${gw.color} flex items-center justify-center`}>
                <span className="material-icons-outlined text-white text-lg">{gw.icon}</span>
              </div>
              <div className={`w-3 h-3 rounded-full ${gw.enabled ? 'bg-emerald-400' : 'bg-grey-200'}`} />
            </div>
            <h3 className="text-sm font-bold text-grey-900 mb-0.5">{gw.label}</h3>
            <p className="text-xs text-grey-400">{gw.enabled ? 'مفعّل' : 'معطّل'}</p>
          </button>
        ))}
      </div>

      {/* Configuration Panel */}
      <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
        {/* ═══ SkipCash ═══ */}
        {activeGateway === 'skipcash' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-violet-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">credit_card</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">SkipCash — سكاي باي كاش</h2>
                  <p className="text-xs text-grey-500">بوابة دفع إلكتروني لقطر</p>
                </div>
              </div>
              <Toggle enabled={form.skipcash_enabled} onChange={(v) => update('skipcash_enabled', v)} />
            </div>

            {form.skipcash_enabled && (
              <div className="space-y-4 animate-fade-in">
                {/* Sandbox Toggle */}
                <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-amber-600 text-lg">science</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800">وضع الاختبار (Sandbox)</p>
                      <p className="text-xs text-amber-600">للتجربة بدون مبالغ حقيقية</p>
                    </div>
                  </div>
                  <Toggle enabled={form.skipcash_sandbox} onChange={(v) => update('skipcash_sandbox', v)} />
                </div>

                <FormField label="Merchant ID" value={form.skipcash_merchant_id}
                  onChange={(v) => update('skipcash_merchant_id', v)} placeholder="SKIP-XXXX-XXXX" />
                <FormField label="API Key" value={form.skipcash_api_key}
                  onChange={(v) => update('skipcash_api_key', v)} placeholder="sk_live_..." secret />
                <FormField label="Secret Key" value={form.skipcash_secret_key}
                  onChange={(v) => update('skipcash_secret_key', v)} placeholder="whsec_..." secret />

                <div className="bg-grey-50 rounded-xl p-4">
                  <p className="text-xs text-grey-500 mb-2 font-bold">رابط الـ Callback (Webhook)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white rounded-lg px-3 py-2 border border-grey-200 text-grey-600 flex-1 overflow-x-auto">
                      https://yourdomain.com/api/webhooks/skipcash
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText('https://yourdomain.com/api/webhooks/skipcash'); showToast('تم النسخ'); }}
                      className="p-2 rounded-lg hover:bg-grey-200">
                      <span className="material-icons-outlined text-sm text-grey-400">content_copy</span>
                    </button>
                  </div>
                </div>

                <button onClick={() => testGateway('skipcash')} disabled={!!testing}
                  className="w-full py-3 rounded-xl border-2 border-violet-200 text-violet-600 text-sm font-bold hover:bg-violet-50 transition-all flex items-center justify-center gap-2">
                  {testing === 'skipcash' ? (
                    <><span className="material-icons-outlined text-sm animate-spin">sync</span> جارِ الاختبار...</>
                  ) : (
                    <><span className="material-icons-outlined text-sm">play_arrow</span> اختبار الاتصال</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ SADAD ═══ */}
        {activeGateway === 'sadad' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-blue-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">account_balance</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">SADAD — سداد</h2>
                  <p className="text-xs text-grey-500">بوابة الدفع الإلكتروني</p>
                </div>
              </div>
              <Toggle enabled={form.sadad_enabled} onChange={(v) => update('sadad_enabled', v)} />
            </div>

            {form.sadad_enabled && (
              <div className="space-y-4 animate-fade-in">
                <div className="flex items-center justify-between bg-amber-50 rounded-xl p-4">
                  <div className="flex items-center gap-2">
                    <span className="material-icons-outlined text-amber-600 text-lg">science</span>
                    <div>
                      <p className="text-sm font-bold text-amber-800">وضع الاختبار (Sandbox)</p>
                      <p className="text-xs text-amber-600">للتجربة بدون مبالغ حقيقية</p>
                    </div>
                  </div>
                  <Toggle enabled={form.sadad_sandbox} onChange={(v) => update('sadad_sandbox', v)} />
                </div>

                <FormField label="Merchant ID" value={form.sadad_merchant_id}
                  onChange={(v) => update('sadad_merchant_id', v)} placeholder="MID-XXXXX" />
                <FormField label="Terminal ID" value={form.sadad_terminal_id}
                  onChange={(v) => update('sadad_terminal_id', v)} placeholder="TID-XXXXX" />
                <FormField label="Secret Key" value={form.sadad_secret_key}
                  onChange={(v) => update('sadad_secret_key', v)} placeholder="sadad_sk_..." secret />

                <div className="bg-grey-50 rounded-xl p-4">
                  <p className="text-xs text-grey-500 mb-2 font-bold">رابط الـ Callback (Webhook)</p>
                  <div className="flex items-center gap-2">
                    <code className="text-xs bg-white rounded-lg px-3 py-2 border border-grey-200 text-grey-600 flex-1 overflow-x-auto">
                      https://yourdomain.com/api/webhooks/sadad
                    </code>
                    <button onClick={() => { navigator.clipboard.writeText('https://yourdomain.com/api/webhooks/sadad'); showToast('تم النسخ'); }}
                      className="p-2 rounded-lg hover:bg-grey-200">
                      <span className="material-icons-outlined text-sm text-grey-400">content_copy</span>
                    </button>
                  </div>
                </div>

                <button onClick={() => testGateway('sadad')} disabled={!!testing}
                  className="w-full py-3 rounded-xl border-2 border-blue-200 text-blue-600 text-sm font-bold hover:bg-blue-50 transition-all flex items-center justify-center gap-2">
                  {testing === 'sadad' ? (
                    <><span className="material-icons-outlined text-sm animate-spin">sync</span> جارِ الاختبار...</>
                  ) : (
                    <><span className="material-icons-outlined text-sm">play_arrow</span> اختبار الاتصال</>
                  )}
                </button>
              </div>
            )}
          </div>
        )}

        {/* ═══ COD ═══ */}
        {activeGateway === 'cod' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">payments</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">الدفع عند الاستلام</h2>
                  <p className="text-xs text-grey-500">العميل يدفع نقداً عند التوصيل</p>
                </div>
              </div>
              <Toggle enabled={form.cod_enabled} onChange={(v) => update('cod_enabled', v)} />
            </div>

            {form.cod_enabled && (
              <div className="space-y-4 animate-fade-in">
                <div>
                  <label className="text-sm font-bold text-grey-700 mb-1.5 block">الحد الأقصى للمبلغ (ر.ق)</label>
                  <input type="number" value={form.cod_max_amount}
                    onChange={(e) => update('cod_max_amount', parseFloat(e.target.value) || 0)}
                    className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none"
                    placeholder="5000" />
                  <p className="text-xs text-grey-400 mt-1">الطلبات فوق هذا المبلغ لن يظهر لها خيار الدفع عند الاستلام</p>
                </div>

                <div className="bg-emerald-50 rounded-xl p-4">
                  <div className="flex gap-2">
                    <span className="material-icons-outlined text-emerald-600 text-sm mt-0.5">info</span>
                    <p className="text-xs text-emerald-700">الدفع عند الاستلام يحتاج تأكيد يدوي من التاجر بعد التحصيل</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ Bank Transfer ═══ */}
        {activeGateway === 'bank_transfer' && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-amber-500 flex items-center justify-center">
                  <span className="material-icons-outlined text-white text-2xl">account_balance_wallet</span>
                </div>
                <div>
                  <h2 className="text-base font-bold text-grey-900">التحويل البنكي</h2>
                  <p className="text-xs text-grey-500">العميل يحوّل المبلغ لحسابك مباشرة</p>
                </div>
              </div>
              <Toggle enabled={form.bank_transfer_enabled} onChange={(v) => update('bank_transfer_enabled', v)} />
            </div>

            {form.bank_transfer_enabled && (
              <div className="space-y-4 animate-fade-in">
                <FormField label="اسم البنك" value={form.bank_name}
                  onChange={(v) => update('bank_name', v)} placeholder="مثال: QNB" />
                <FormField label="اسم صاحب الحساب" value={form.account_name}
                  onChange={(v) => update('account_name', v)} placeholder="الاسم كما يظهر في الحساب" />
                <FormField label="IBAN" value={form.iban}
                  onChange={(v) => update('iban', v)} placeholder="QA00 0000 0000 0000 0000 0000 0000" />
                <FormField label="SWIFT Code" value={form.swift}
                  onChange={(v) => update('swift', v)} placeholder="QNBAQAQA" />
                <div>
                  <label className="text-sm font-bold text-grey-700 mb-1.5 block">تعليمات إضافية</label>
                  <textarea value={form.bank_instructions}
                    onChange={(e) => update('bank_instructions', e.target.value)}
                    className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none resize-none h-20"
                    placeholder="تعليمات تظهر للعميل بعد اختيار التحويل البنكي..." />
                </div>

                <div className="bg-amber-50 rounded-xl p-4">
                  <div className="flex gap-2">
                    <span className="material-icons-outlined text-amber-600 text-sm mt-0.5">info</span>
                    <p className="text-xs text-amber-700">التحويل البنكي يحتاج تأكيد يدوي من التاجر بعد استلام المبلغ</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Quick Stats */}
      <div className="bg-white rounded-xl border border-grey-100 p-5">
        <h3 className="text-sm font-bold text-grey-900 mb-4 flex items-center gap-2">
          <span className="material-icons-outlined text-brand-800 text-lg">insights</span>
          نصائح
        </h3>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="bg-grey-50 rounded-xl p-4">
            <span className="material-icons-outlined text-violet-500 text-2xl mb-2">credit_card</span>
            <h4 className="text-sm font-bold text-grey-800 mb-1">فعّل الدفع الإلكتروني</h4>
            <p className="text-xs text-grey-500">٧٠٪ من العملاء يفضلون الدفع أونلاين — فعّل SkipCash أو SADAD لزيادة المبيعات.</p>
          </div>
          <div className="bg-grey-50 rounded-xl p-4">
            <span className="material-icons-outlined text-emerald-500 text-2xl mb-2">payments</span>
            <h4 className="text-sm font-bold text-grey-800 mb-1">لا تلغِ الدفع عند الاستلام</h4>
            <p className="text-xs text-grey-500">بعض العملاء يثقون بالدفع عند الاستلام. أبقِه كخيار إضافي.</p>
          </div>
          <div className="bg-grey-50 rounded-xl p-4">
            <span className="material-icons-outlined text-amber-500 text-2xl mb-2">science</span>
            <h4 className="text-sm font-bold text-grey-800 mb-1">اختبر قبل التفعيل</h4>
            <p className="text-xs text-grey-500">استخدم وضع Sandbox للاختبار، ثم عطّله عند الجاهزية.</p>
          </div>
        </div>
      </div>

      {/* Animations */}
      <style jsx global>{`
        @keyframes fadeIn { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
        @keyframes slideDown { from { opacity: 0; transform: translate(-50%, -20px); } to { opacity: 1; transform: translate(-50%, 0); } }
        .animate-fade-in { animation: fadeIn 0.3s ease-out; }
        .animate-slide-down { animation: slideDown 0.3s ease-out; }
      `}</style>
    </div>
  );
}

// ═══ Components ═══

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
        <input
          type={secret && !show ? 'password' : 'text'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="w-full px-4 py-3 rounded-xl border border-grey-200 text-sm focus:border-brand-800 focus:ring-1 focus:ring-brand-800 outline-none font-mono"
          placeholder={placeholder}
          dir="ltr"
        />
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
