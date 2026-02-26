'use client';

/**
 * ساس — المالية (Finance)
 * accountant, director, founder
 */

import { useEffect } from 'react';
import { useAdminStore } from '@/stores/admin';

export default function AdminFinancePage() {
  const { stats, fetchStats } = useAdminStore();
  useEffect(() => { fetchStats(); }, []);

  const fmtCurrency = (n: number) => (n || 0).toLocaleString('ar-QA', { style: 'currency', currency: 'QAR', minimumFractionDigits: 0 });
  const fmt = (n: number) => (n ?? 0).toLocaleString('ar-QA');

  const monthly = stats?.financialData?.monthlyRevenue || [];

  return (
    <div className="animate-fade-in">
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-white">المالية</h1>
        <p className="text-sm text-grey-500 mt-1">التقارير المالية وإيرادات المنصة</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {[
          { icon: 'account_balance', label: 'إجمالي الإيرادات', value: stats ? fmtCurrency(stats.totalRevenue) : '—', color: 'text-green-400', bg: 'bg-green-500/10' },
          { icon: 'today', label: 'إيرادات اليوم', value: stats ? fmtCurrency(stats.todayRevenue) : '—', color: 'text-yellow-400', bg: 'bg-yellow-500/10' },
          { icon: 'receipt_long', label: 'إجمالي الطلبات', value: stats ? fmt(stats.totalOrders) : '—', color: 'text-blue-400', bg: 'bg-blue-500/10' },
          { icon: 'shopping_bag', label: 'طلبات اليوم', value: stats ? fmt(stats.todayOrders) : '—', color: 'text-purple-400', bg: 'bg-purple-500/10' },
        ].map((s) => (
          <div key={s.label} className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4">
            <div className={`w-9 h-9 rounded-lg ${s.bg} flex items-center justify-center mb-3`}>
              <span className={`material-icons-outlined text-lg ${s.color}`}>{s.icon}</span>
            </div>
            <p className="text-xl font-bold text-white font-tajawal">{s.value}</p>
            <p className="text-[0.7rem] text-grey-500 mt-1">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Monthly Revenue */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-5">
        <h2 className="font-tajawal text-sm font-bold text-white mb-4">الإيرادات الشهرية (آخر ٦ أشهر)</h2>
        {monthly.length === 0 ? (
          <div className="text-center py-12">
            <span className="material-icons-outlined text-4xl text-grey-600 mb-2 block">bar_chart</span>
            <p className="text-grey-500 text-sm">لا توجد بيانات مالية بعد</p>
            <p className="text-grey-600 text-xs mt-1">ستظهر الإيرادات عندما تبدأ المتاجر بالبيع</p>
          </div>
        ) : (
          <div className="space-y-3">
            {monthly.map((m: any, i: number) => {
              const monthName = new Date(m.month).toLocaleDateString('ar-QA', { month: 'long', year: 'numeric' });
              const maxRevenue = Math.max(...monthly.map((x: any) => parseFloat(x.revenue)));
              const pct = maxRevenue > 0 ? (parseFloat(m.revenue) / maxRevenue) * 100 : 0;
              return (
                <div key={i} className="flex items-center gap-4">
                  <span className="text-xs text-grey-400 w-28 flex-shrink-0 text-left">{monthName}</span>
                  <div className="flex-1 bg-grey-700/30 rounded-full h-6 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-l from-brand-600 to-brand-800 rounded-full flex items-center justify-end px-2 transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    >
                      <span className="text-[0.6rem] font-bold text-white whitespace-nowrap">{fmtCurrency(parseFloat(m.revenue))}</span>
                    </div>
                  </div>
                  <span className="text-[0.65rem] text-grey-500 w-16 text-left flex-shrink-0">{m.orders} طلب</span>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
