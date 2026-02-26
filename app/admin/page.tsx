'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore, ROLE_CONFIG } from '@/stores/admin';

export default function AdminDashboard() {
  const { stats, admin, fetchStats, hasAccess } = useAdminStore();
  useEffect(() => { fetchStats(); }, []);

  const fmt = (n: number) => (n ?? 0).toLocaleString('ar-QA');
  const fmtCurrency = (n: number) => (n || 0).toLocaleString('ar-QA', { style: 'currency', currency: 'QAR', minimumFractionDigits: 0 });
  const roleCfg = admin ? ROLE_CONFIG[admin.role] : null;

  const planLabels: Record<string, string> = { basic: 'أساس', growth: 'نمو', pro: 'احتراف' };
  const statusLabels: Record<string, { label: string; color: string }> = {
    active: { label: 'نشط', color: 'text-green-400' },
    trial: { label: 'تجريبي', color: 'text-yellow-400' },
    suspended: { label: 'موقوف', color: 'text-red-400' },
  };

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-white">نظرة عامة</h1>
        <p className="text-sm text-grey-500 mt-1">
          مرحباً {admin?.name} — 
          <span className={`font-bold ${roleCfg?.color || ''}`}> {roleCfg?.label}</span>
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: 'store', label: 'المتاجر', value: stats?.totalTenants, href: '/admin/tenants', color: 'text-brand-400', bg: 'bg-brand-500/10', section: 'tenants' },
          { icon: 'group', label: 'التجار', value: stats?.totalMerchants, href: '/admin/merchants', color: 'text-blue-400', bg: 'bg-blue-500/10', section: 'merchants' },
          { icon: 'inventory_2', label: 'المنتجات', value: stats?.totalProducts, color: 'text-purple-400', bg: 'bg-purple-500/10', section: '' },
          { icon: 'shopping_bag', label: 'الطلبات', value: stats?.totalOrders, color: 'text-green-400', bg: 'bg-green-500/10', section: '' },
        ].map((s) => (
          <div key={s.label} className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <span className={`material-icons-outlined text-lg ${s.color}`}>{s.icon}</span>
            </div>
            <div className="text-xl font-bold text-white font-tajawal">
              {stats ? fmt(s.value || 0) : <div className="h-6 w-12 bg-grey-700 rounded animate-pulse" />}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-[0.7rem] text-grey-500">{s.label}</span>
              {s.href && hasAccess(s.section) && (
                <Link href={s.href} className="text-[0.65rem] text-grey-600 hover:text-brand-400">عرض ←</Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue Row — accountant, director, founder */}
      {hasAccess('finance') && (
        <div className="grid lg:grid-cols-3 gap-3 mb-6">
          <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-green-400 text-lg">account_balance</span>
              <span className="text-xs font-semibold text-grey-300">إجمالي الإيرادات</span>
            </div>
            <p className="text-2xl font-bold text-white font-tajawal">{stats ? fmtCurrency(stats.totalRevenue) : '—'}</p>
          </div>
          <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-yellow-400 text-lg">today</span>
              <span className="text-xs font-semibold text-grey-300">اليوم</span>
            </div>
            <p className="text-2xl font-bold text-white font-tajawal">{stats ? `${fmt(stats.todayOrders)} طلب` : '—'}</p>
            <p className="text-xs text-grey-500 mt-0.5">{stats ? fmtCurrency(stats.todayRevenue) : ''}</p>
          </div>
          <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-brand-400 text-lg">person_add</span>
              <span className="text-xs font-semibold text-grey-300">تسجيلات آخر ٧ أيام</span>
            </div>
            <p className="text-2xl font-bold text-white font-tajawal">{stats ? fmt(stats.recentSignups) : '—'}</p>
          </div>
        </div>
      )}

      {/* Plan Distribution */}
      {stats?.planStats && stats.planStats.length > 0 && (
        <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
          <h2 className="font-tajawal text-sm font-bold text-white mb-3">توزيع الباقات</h2>
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {stats.planStats.map((ps: any, i: number) => {
              const st = statusLabels[ps.status] || statusLabels.active;
              return (
                <div key={i} className="bg-grey-700/30 rounded-lg p-2.5 text-center">
                  <p className="text-lg font-bold text-white">{ps.count}</p>
                  <p className="text-[0.6rem] text-grey-400">{planLabels[ps.plan] || ps.plan}</p>
                  <p className={`text-[0.55rem] font-bold ${st.color}`}>{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
