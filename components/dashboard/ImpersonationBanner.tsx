'use client';

/**
 * ساس — بانر الدخول كتاجر (Impersonation Banner)
 * يظهر فوق لوحة تحكم التاجر عندما يكون الدعم الفني داخل كتاجر
 */

import { useEffect, useState } from 'react';

interface ImpersonationInfo {
  adminEmail: string;
  adminRole: string;
  merchantName: string;
  tenantName: string;
}

const roleLabels: Record<string, string> = {
  founder: 'مؤسس',
  director: 'مدير',
  supervisor: 'مشرف',
  support: 'دعم فني',
};

export default function ImpersonationBanner() {
  const [info, setInfo] = useState<ImpersonationInfo | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem('saas_impersonation');
      if (raw) setInfo(JSON.parse(raw));
    } catch { /* ignore */ }
  }, []);

  if (!info) return null;

  const handleExit = () => {
    // مسح بيانات التاجر
    localStorage.removeItem('saas_access_token');
    localStorage.removeItem('saas_impersonation');
    document.cookie = 'saas_access_token=; path=/; max-age=0';
    // رجوع للوحة الأدمن
    window.location.href = '/admin/tenants';
  };

  return (
    <div className="fixed top-0 left-0 right-0 z-[100] bg-gradient-to-l from-amber-600 to-amber-500 shadow-lg">
      <div className="max-w-screen-xl mx-auto px-4 py-2 flex items-center justify-between gap-3">
        {/* Info */}
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-7 h-7 rounded-full bg-white/20 flex items-center justify-center flex-shrink-0">
            <span className="material-icons-outlined text-white text-sm">support_agent</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-white truncate">
              <span className="hidden sm:inline">وضع الدعم الفني — </span>
              أنت داخل متجر <span className="font-black">{info.tenantName}</span> كـ {info.merchantName}
            </p>
            <p className="text-[0.6rem] text-white/70 truncate">
              {roleLabels[info.adminRole] || info.adminRole}: {info.adminEmail}
            </p>
          </div>
        </div>

        {/* Exit Button */}
        <button onClick={handleExit}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/20 hover:bg-white/30 text-white text-xs font-bold transition-all flex-shrink-0 backdrop-blur-sm">
          <span className="material-icons-outlined text-sm">logout</span>
          <span className="hidden sm:inline">العودة للوحة الإدارة</span>
          <span className="sm:hidden">خروج</span>
        </button>
      </div>
    </div>
  );
}
