'use client';

/**
 * ساس — إعدادات المتجر
 * محادثة ٨
 */

import { useEffect, useState } from 'react';
import { useSettingsStore } from '@/stores/settings';

const tabs = [
  { key: 'store', label: 'المتجر', icon: 'storefront' },
  { key: 'payment', label: 'الدفع', icon: 'payments' },
  { key: 'shipping', label: 'الشحن', icon: 'local_shipping' },
  { key: 'checkout', label: 'الطلب', icon: 'shopping_cart_checkout' },
  { key: 'social', label: 'التواصل', icon: 'share' },
  { key: 'notifications', label: 'الإشعارات', icon: 'notifications' },
];

export default function SettingsPage() {
  const settings = useSettingsStore();
  const [activeTab, setActiveTab] = useState('store');
  const [toast, setToast] = useState('');

  useEffect(() => {
    settings.fetchSettings();
  }, []);

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 3000);
  };

  if (settings.isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-grey-900">الإعدادات</h1>
        <p className="text-sm text-grey-500 mt-0.5">تحكم في إعدادات متجرك</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 overflow-x-auto pb-1 -mx-4 px-4 lg:mx-0 lg:px-0">
        {tabs.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key)}
            className={`flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
              activeTab === tab.key
                ? 'bg-brand-800 text-white shadow-saas-brand'
                : 'bg-white text-grey-600 border border-grey-100 hover:bg-grey-50'
            }`}
          >
            <span className="material-icons-outlined text-sm">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="bg-white rounded-xl border border-grey-100 p-5">
        {activeTab === 'store' && <StoreTab settings={settings} showToast={showToast} />}
        {activeTab === 'payment' && <PaymentTab settings={settings} showToast={showToast} />}
        {activeTab === 'shipping' && <ShippingTab settings={settings} showToast={showToast} />}
        {activeTab === 'checkout' && <CheckoutTab settings={settings} showToast={showToast} />}
        {activeTab === 'social' && <SocialTab settings={settings} showToast={showToast} />}
        {activeTab === 'notifications' && <NotificationsTab settings={settings} showToast={showToast} />}
      </div>

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-grey-900 text-white px-5 py-3 rounded-xl shadow-lg z-50 flex items-center gap-2 animate-fade-in">
          <span className="material-icons-outlined text-lg text-emerald-400">check_circle</span>
          <span className="text-sm font-bold">{toast}</span>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════
// Store Tab
// ═══════════════════════════════════════
function StoreTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({
    name: settings.store?.name || '',
    description: settings.store?.description || '',
    logo_url: settings.store?.logo_url || '',
    currency: settings.store?.currency || 'QAR',
    language: settings.store?.language || 'ar',
  });

  const handleSave = async () => {
    try {
      await settings.updateStore(form);
      showToast('تم حفظ بيانات المتجر');
    } catch { showToast('فشل الحفظ'); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-grey-900">بيانات المتجر</h2>

      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">اسم المتجر *</label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
          style={{ textAlign: 'right', direction: 'rtl' }}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">وصف المتجر</label>
        <textarea
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
          rows={3}
          className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800 resize-none"
          style={{ textAlign: 'right', direction: 'rtl' }}
        />
      </div>

      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">رابط الشعار</label>
        <input
          type="url"
          value={form.logo_url}
          onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          placeholder="https://..."
          className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
          dir="ltr"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-bold text-grey-700 mb-1.5">العملة</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
          >
            <option value="QAR">ريال قطري (ر.ق)</option>
            <option value="SAR">ريال سعودي (ر.س)</option>
            <option value="AED">درهم إماراتي (د.إ)</option>
            <option value="KWD">دينار كويتي (د.ك)</option>
            <option value="BHD">دينار بحريني (د.ب)</option>
            <option value="OMR">ريال عماني (ر.ع)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-bold text-grey-700 mb-1.5">اللغة</label>
          <select
            value={form.language}
            onChange={(e) => setForm({ ...form, language: e.target.value })}
            className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
          >
            <option value="ar">العربية</option>
            <option value="en">English</option>
          </select>
        </div>
      </div>

      {/* Store URL Info */}
      {settings.store && (
        <div className="bg-grey-25 rounded-lg p-3">
          <p className="text-xs text-grey-500">رابط المتجر</p>
          <p className="text-sm font-mono font-bold text-brand-800 mt-0.5">
            {settings.store.slug}.saas.qa
          </p>
        </div>
      )}

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Payment Tab
// ═══════════════════════════════════════
function PaymentTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ...settings.payment });

  const handleSave = async () => {
    try {
      await settings.updatePayment(form);
      showToast('تم حفظ إعدادات الدفع');
    } catch { showToast('فشل الحفظ'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-grey-900">طرق الدفع</h2>

      {/* COD */}
      <ToggleCard
        icon="payments"
        title="الدفع عند الاستلام (COD)"
        desc="العميل يدفع عند استلام الطلب"
        enabled={form.cod_enabled}
        onToggle={() => setForm({ ...form, cod_enabled: !form.cod_enabled })}
      />

      {/* Bank Transfer */}
      <ToggleCard
        icon="account_balance"
        title="التحويل البنكي"
        desc="العميل يحوّل لحسابك البنكي"
        enabled={form.bank_transfer_enabled}
        onToggle={() => setForm({ ...form, bank_transfer_enabled: !form.bank_transfer_enabled })}
      >
        {form.bank_transfer_enabled && (
          <div className="space-y-3 mt-4 pt-4 border-t border-grey-100">
            <input
              type="text"
              value={form.bank_name || ''}
              onChange={(e) => setForm({ ...form, bank_name: e.target.value })}
              placeholder="اسم البنك"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
            <input
              type="text"
              value={form.bank_account_name || ''}
              onChange={(e) => setForm({ ...form, bank_account_name: e.target.value })}
              placeholder="اسم صاحب الحساب"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
            <input
              type="text"
              value={form.bank_iban || ''}
              onChange={(e) => setForm({ ...form, bank_iban: e.target.value })}
              placeholder="IBAN — QA..."
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm font-mono focus:outline-none focus:border-brand-800"
              dir="ltr"
            />
          </div>
        )}
      </ToggleCard>

      {/* SkyPay Cash */}
      <ToggleCard
        icon="credit_card"
        title="سكاي باي كاش (SkyPay)"
        desc="بوابة دفع إلكتروني"
        enabled={form.skypay_enabled}
        onToggle={() => setForm({ ...form, skypay_enabled: !form.skypay_enabled })}
      >
        {form.skypay_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <input
              type="text"
              value={form.skypay_merchant_id || ''}
              onChange={(e) => setForm({ ...form, skypay_merchant_id: e.target.value })}
              placeholder="Merchant ID"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm font-mono focus:outline-none focus:border-brand-800"
              dir="ltr"
            />
          </div>
        )}
      </ToggleCard>

      {/* Sadad */}
      <ToggleCard
        icon="credit_card"
        title="سداد (Sadad)"
        desc="بوابة دفع إلكتروني"
        enabled={form.sadad_enabled}
        onToggle={() => setForm({ ...form, sadad_enabled: !form.sadad_enabled })}
      >
        {form.sadad_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <input
              type="text"
              value={form.sadad_merchant_id || ''}
              onChange={(e) => setForm({ ...form, sadad_merchant_id: e.target.value })}
              placeholder="Merchant ID"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm font-mono focus:outline-none focus:border-brand-800"
              dir="ltr"
            />
          </div>
        )}
      </ToggleCard>

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Shipping Tab
// ═══════════════════════════════════════
function ShippingTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ...settings.shipping });

  const handleSave = async () => {
    try {
      await settings.updateShipping(form);
      showToast('تم حفظ إعدادات الشحن');
    } catch { showToast('فشل الحفظ'); }
  };

  return (
    <div className="space-y-6">
      <h2 className="text-base font-bold text-grey-900">طرق التوصيل</h2>

      {/* Pickup */}
      <ToggleCard
        icon="store"
        title="استلام من المحل"
        desc="العميل يستلم الطلب بنفسه"
        enabled={form.pickup_enabled}
        onToggle={() => setForm({ ...form, pickup_enabled: !form.pickup_enabled })}
      >
        {form.pickup_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <input
              type="text"
              value={form.pickup_address || ''}
              onChange={(e) => setForm({ ...form, pickup_address: e.target.value })}
              placeholder="عنوان الاستلام"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        )}
      </ToggleCard>

      {/* Aramex */}
      <ToggleCard
        icon="local_shipping"
        title="أرامكس (Aramex)"
        desc="شحن محلي ودولي"
        enabled={form.aramex_enabled}
        onToggle={() => setForm({ ...form, aramex_enabled: !form.aramex_enabled })}
      >
        {form.aramex_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <label className="block text-xs text-grey-500 mb-1">تكلفة الشحن (ر.ق)</label>
            <input
              type="number"
              value={form.aramex_cost}
              onChange={(e) => setForm({ ...form, aramex_cost: parseFloat(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        )}
      </ToggleCard>

      {/* DHL */}
      <ToggleCard
        icon="flight"
        title="DHL"
        desc="شحن سريع دولي"
        enabled={form.dhl_enabled}
        onToggle={() => setForm({ ...form, dhl_enabled: !form.dhl_enabled })}
      >
        {form.dhl_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <label className="block text-xs text-grey-500 mb-1">تكلفة الشحن (ر.ق)</label>
            <input
              type="number"
              value={form.dhl_cost}
              onChange={(e) => setForm({ ...form, dhl_cost: parseFloat(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        )}
      </ToggleCard>

      {/* Free Shipping */}
      <ToggleCard
        icon="redeem"
        title="شحن مجاني"
        desc="شحن مجاني فوق مبلغ معين"
        enabled={form.free_shipping_enabled}
        onToggle={() => setForm({ ...form, free_shipping_enabled: !form.free_shipping_enabled })}
      >
        {form.free_shipping_enabled && (
          <div className="mt-4 pt-4 border-t border-grey-100">
            <label className="block text-xs text-grey-500 mb-1">الحد الأدنى للشحن المجاني (ر.ق)</label>
            <input
              type="number"
              value={form.free_shipping_min}
              onChange={(e) => setForm({ ...form, free_shipping_min: parseFloat(e.target.value) || 0 })}
              min="0"
              className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        )}
      </ToggleCard>

      {/* Delivery Notes */}
      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">ملاحظات التوصيل</label>
        <textarea
          value={form.delivery_notes || ''}
          onChange={(e) => setForm({ ...form, delivery_notes: e.target.value })}
          placeholder="ملاحظات تظهر للعميل عند الطلب..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800 resize-none"
          style={{ textAlign: 'right', direction: 'rtl' }}
        />
      </div>

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Checkout Tab
// ═══════════════════════════════════════
function CheckoutTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ...settings.checkout });

  const handleSave = async () => {
    try {
      await settings.updateCheckout(form);
      showToast('تم حفظ إعدادات الطلب');
    } catch { showToast('فشل الحفظ'); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-grey-900">إعدادات الطلب</h2>

      <ToggleRow
        title="طلب بدون تسجيل"
        desc="السماح للزوار بالطلب بدون إنشاء حساب"
        enabled={form.guest_checkout}
        onToggle={() => setForm({ ...form, guest_checkout: !form.guest_checkout })}
      />

      <ToggleRow
        title="العنوان مطلوب"
        desc="إجبار العميل على إدخال عنوان التوصيل"
        enabled={form.require_address}
        onToggle={() => setForm({ ...form, require_address: !form.require_address })}
      />

      <ToggleRow
        title="الإيميل مطلوب"
        desc="إجبار العميل على إدخال بريده الإلكتروني"
        enabled={form.require_email}
        onToggle={() => setForm({ ...form, require_email: !form.require_email })}
      />

      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">بادئة رقم الطلب</label>
        <input
          type="text"
          value={form.order_prefix}
          onChange={(e) => setForm({ ...form, order_prefix: e.target.value.toUpperCase() })}
          placeholder="SAS"
          maxLength={5}
          className="w-32 px-4 py-2.5 rounded-lg border border-grey-200 text-sm font-mono font-bold focus:outline-none focus:border-brand-800"
          dir="ltr"
        />
        <p className="text-xs text-grey-400 mt-1">مثال: {form.order_prefix || 'SAS'}-00001</p>
      </div>

      <div>
        <label className="block text-sm font-bold text-grey-700 mb-1.5">رسالة شكر بعد الطلب</label>
        <textarea
          value={form.thank_you_message || ''}
          onChange={(e) => setForm({ ...form, thank_you_message: e.target.value })}
          placeholder="شكراً لطلبك! سنتواصل معك قريباً..."
          rows={2}
          className="w-full px-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800 resize-none"
          style={{ textAlign: 'right', direction: 'rtl' }}
        />
      </div>

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Social Tab
// ═══════════════════════════════════════
function SocialTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ...settings.social });

  const handleSave = async () => {
    try {
      await settings.updateSocial(form);
      showToast('تم حفظ روابط التواصل');
    } catch { showToast('فشل الحفظ'); }
  };

  const socialFields = [
    { key: 'instagram', label: 'إنستقرام', icon: 'photo_camera', placeholder: '@username' },
    { key: 'twitter', label: 'X (تويتر)', icon: 'alternate_email', placeholder: '@username' },
    { key: 'snapchat', label: 'سناب شات', icon: 'camera', placeholder: 'username' },
    { key: 'tiktok', label: 'تيك توك', icon: 'movie', placeholder: '@username' },
    { key: 'whatsapp', label: 'واتساب', icon: 'chat', placeholder: '+974XXXXXXXX' },
    { key: 'phone', label: 'رقم الهاتف', icon: 'phone', placeholder: '+974XXXXXXXX' },
  ];

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-grey-900">روابط التواصل</h2>
      <p className="text-xs text-grey-400">تظهر في فوتر المتجر</p>

      <div className="space-y-3">
        {socialFields.map((field) => (
          <div key={field.key} className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-grey-50 flex items-center justify-center flex-shrink-0">
              <span className="material-icons-outlined text-grey-400 text-lg">{field.icon}</span>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-grey-500 mb-0.5">{field.label}</label>
              <input
                type="text"
                value={(form as any)[field.key] || ''}
                onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
                placeholder={field.placeholder}
                className="w-full px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
                dir="ltr"
              />
            </div>
          </div>
        ))}
      </div>

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Notifications Tab
// ═══════════════════════════════════════
function NotificationsTab({ settings, showToast }: { settings: any; showToast: (m: string) => void }) {
  const [form, setForm] = useState({ ...settings.notifications });

  const handleSave = async () => {
    try {
      await settings.updateNotifications(form);
      showToast('تم حفظ إعدادات الإشعارات');
    } catch { showToast('فشل الحفظ'); }
  };

  return (
    <div className="space-y-5">
      <h2 className="text-base font-bold text-grey-900">الإشعارات</h2>

      <ToggleRow
        title="إشعار طلب جديد"
        desc="تلقي إشعار عند وصول طلب جديد"
        enabled={form.email_new_order}
        onToggle={() => setForm({ ...form, email_new_order: !form.email_new_order })}
      />

      <ToggleRow
        title="تحديث حالة الطلب"
        desc="إرسال إشعار للعميل عند تغيير حالة طلبه"
        enabled={form.email_order_status}
        onToggle={() => setForm({ ...form, email_order_status: !form.email_order_status })}
      />

      <ToggleRow
        title="تنبيه مخزون منخفض"
        desc="إشعار عند انخفاض المخزون"
        enabled={form.email_low_stock}
        onToggle={() => setForm({ ...form, email_low_stock: !form.email_low_stock })}
      />

      {form.email_low_stock && (
        <div>
          <label className="block text-xs text-grey-500 mb-1">حد المخزون المنخفض</label>
          <input
            type="number"
            value={form.low_stock_threshold}
            onChange={(e) => setForm({ ...form, low_stock_threshold: parseInt(e.target.value) || 5 })}
            min="1"
            className="w-24 px-3 py-2 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
            style={{ textAlign: 'right', direction: 'rtl' }}
          />
        </div>
      )}

      <div className="pt-3 border-t border-grey-100">
        <ToggleRow
          title="إشعارات واتساب"
          desc="إرسال إشعارات عبر واتساب"
          enabled={form.whatsapp_enabled}
          onToggle={() => setForm({ ...form, whatsapp_enabled: !form.whatsapp_enabled })}
        />
        {form.whatsapp_enabled && (
          <input
            type="text"
            value={form.whatsapp_number || ''}
            onChange={(e) => setForm({ ...form, whatsapp_number: e.target.value })}
            placeholder="+974XXXXXXXX"
            className="w-full px-3 py-2 mt-3 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
            dir="ltr"
          />
        )}
      </div>

      <SaveButton onClick={handleSave} saving={settings.isSaving} />
    </div>
  );
}

// ═══════════════════════════════════════
// Shared Components
// ═══════════════════════════════════════

function ToggleCard({
  icon,
  title,
  desc,
  enabled,
  onToggle,
  children,
}: {
  icon: string;
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
  children?: React.ReactNode;
}) {
  return (
    <div className={`rounded-xl border p-4 transition-all ${enabled ? 'border-brand-200 bg-brand-25' : 'border-grey-100 bg-white'}`}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${enabled ? 'bg-brand-100' : 'bg-grey-50'}`}>
            <span className={`material-icons-outlined text-lg ${enabled ? 'text-brand-800' : 'text-grey-400'}`}>{icon}</span>
          </div>
          <div>
            <p className="text-sm font-bold text-grey-900">{title}</p>
            <p className="text-xs text-grey-400">{desc}</p>
          </div>
        </div>
        <button
          onClick={onToggle}
          className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-brand-800' : 'bg-grey-200'}`}
        >
          <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-1' : 'left-6'}`} />
        </button>
      </div>
      {children}
    </div>
  );
}

function ToggleRow({
  title,
  desc,
  enabled,
  onToggle,
}: {
  title: string;
  desc: string;
  enabled: boolean;
  onToggle: () => void;
}) {
  return (
    <div className="flex items-center justify-between py-2">
      <div>
        <p className="text-sm font-bold text-grey-700">{title}</p>
        <p className="text-xs text-grey-400">{desc}</p>
      </div>
      <button
        onClick={onToggle}
        className={`w-12 h-7 rounded-full transition-colors relative flex-shrink-0 ${enabled ? 'bg-brand-800' : 'bg-grey-200'}`}
      >
        <span className={`absolute top-1 w-5 h-5 rounded-full bg-white shadow transition-all ${enabled ? 'left-1' : 'left-6'}`} />
      </button>
    </div>
  );
}

function SaveButton({ onClick, saving }: { onClick: () => void; saving: boolean }) {
  return (
    <div className="pt-4 border-t border-grey-100">
      <button
        onClick={onClick}
        disabled={saving}
        className="btn-brand px-6 py-2.5 rounded-xl text-sm font-bold disabled:opacity-60 flex items-center gap-2"
      >
        {saving ? (
          <>
            <span className="material-icons-outlined text-lg animate-spin">sync</span>
            جاري الحفظ...
          </>
        ) : (
          <>
            <span className="material-icons-outlined text-lg">check</span>
            حفظ
          </>
        )}
      </button>
    </div>
  );
}
