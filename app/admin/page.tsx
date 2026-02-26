'use client';

/**
 * ساس — Platform Admin Dashboard
 */

import { useEffect } from 'react';
import Link from 'next/link';
import { useAdminStore } from '@/stores/admin';

const planLabels: Record<string, string> = { basic: 'أساس', growth: 'نمو', pro: 'احتراف' };
const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'text-green-400' },
  trial: { label: 'تجريبي', color: 'text-yellow-400' },
  suspended: { label: 'موقوف', color: 'text-red-400' },
};

export default function AdminDashboard() {
  const { stats, admin, fetchStats } = useAdminStore();

  useEffect(() => { fetchStats(); }, []);

  const fmt = (n: number) => n?.toLocaleString('ar-QA') || '٠';
  const fmtCurrency = (n: number) => (n || 0).toLocaleString('ar-QA', { style: 'currency', currency: 'QAR', minimumFractionDigits: 0 });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-white">نظرة عامة على المنصة</h1>
        <p className="text-sm text-grey-500 mt-1">مرحباً {admin?.name} — إليك إحصائيات ساس</p>
      </div>

      {/* Main Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {[
          { icon: 'store', label: 'المتاجر', value: stats?.totalTenants, href: '/admin/tenants', color: 'text-brand-400', bg: 'bg-brand-500/10' },
          { icon: 'group', label: 'التجار', value: stats?.totalMerchants, href: '/admin/merchants', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: 'inventory_2', label: 'المنتجات', value: stats?.totalProducts, color: 'text-purple-400', bg: 'bg-purple-500/10' },
          { icon: 'shopping_bag', label: 'الطلبات', value: stats?.totalOrders, color: 'text-green-400', bg: 'bg-green-500/10' },
        ].map((s) => (
          <div key={s.label} className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${s.bg} flex items-center justify-center`}>
                <span className={`material-icons-outlined ${s.color}`}>{s.icon}</span>
              </div>
            </div>
            <div className="text-2xl font-bold text-white font-tajawal">
              {stats ? fmt(s.value || 0) : <div className="h-7 w-14 bg-grey-700 rounded animate-pulse" />}
            </div>
            <div className="flex items-center justify-between mt-1">
              <span className="text-xs text-grey-500">{s.label}</span>
              {s.href && (
                <Link href={s.href} className="text-xs text-grey-600 hover:text-brand-400 transition-colors">
                  عرض ←
                </Link>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Revenue + Today */}
      <div className="grid lg:grid-cols-3 gap-4 mb-6">
        {/* Total Revenue */}
        <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons-outlined text-green-400">account_balance</span>
            <span className="text-sm font-semibold text-grey-300">إجمالي الإيرادات</span>
          </div>
          <p className="text-3xl font-bold text-white font-tajawal">
            {stats ? fmtCurrency(stats.totalRevenue) : <span className="block h-9 w-32 bg-grey-700 rounded animate-pulse" />}
          </p>
        </div>

        {/* Today */}
        <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons-outlined text-yellow-400">today</span>
            <span className="text-sm font-semibold text-grey-300">طلبات اليوم</span>
          </div>
          <p className="text-3xl font-bold text-white font-tajawal">
            {stats ? fmt(stats.todayOrders) : '—'}
          </p>
          <p className="text-xs text-grey-500 mt-1">
            {stats ? fmtCurrency(stats.todayRevenue) : ''}
          </p>
        </div>

        {/* Recent Signups */}
        <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
          <div className="flex items-center gap-2 mb-3">
            <span className="material-icons-outlined text-brand-400">person_add</span>
            <span className="text-sm font-semibold text-grey-300">تسجيلات آخر ٧ أيام</span>
          </div>
          <p className="text-3xl font-bold text-white font-tajawal">
            {stats ? fmt(stats.recentSignups) : '—'}
          </p>
          <p className="text-xs text-grey-500 mt-1">متجر جديد</p>
        </div>
      </div>

      {/* Plan Distribution */}
      {stats?.planStats && stats.planStats.length > 0 && (
        <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
          <h2 className="font-tajawal text-base font-bold text-white mb-4">توزيع الباقات والحالات</h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {stats.planStats.map((ps: any, i: number) => {
              const st = statusLabels[ps.status] || statusLabels.active;
              return (
                <div key={i} className="bg-grey-700/30 rounded-lg p-3 text-center">
                  <p className="text-xl font-bold text-white">{ps.count}</p>
                  <p className="text-xs text-grey-400 mt-1">{planLabels[ps.plan] || ps.plan}</p>
                  <p className={`text-[0.6rem] font-bold mt-0.5 ${st.color}`}>{st.label}</p>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
