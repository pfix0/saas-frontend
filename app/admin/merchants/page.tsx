'use client';

/**
 * ساس — Platform Admin: Merchants
 */

import { useEffect, useState } from 'react';
import { useAdminStore } from '@/stores/admin';

const roleLabels: Record<string, string> = { owner: 'مالك', admin: 'مدير', staff: 'موظف' };
const planColors: Record<string, string> = { basic: 'bg-grey-600', growth: 'bg-blue-600', pro: 'bg-brand-600' };
const planLabels: Record<string, string> = { basic: 'أساس', growth: 'نمو', pro: 'احتراف' };

export default function AdminMerchantsPage() {
  const { merchants, merchantsTotal, isLoading, fetchMerchants } = useAdminStore();
  const [search, setSearch] = useState('');

  useEffect(() => { fetchMerchants(); }, []);

  useEffect(() => {
    const t = setTimeout(() => fetchMerchants({ search }), 400);
    return () => clearTimeout(t);
  }, [search]);

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-QA', { year: 'numeric', month: 'short', day: 'numeric' }) : '—';
  const timeAgo = (d: string) => {
    if (!d) return 'لم يسجل دخول';
    const diff = Date.now() - new Date(d).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `منذ ${days} يوم`;
    return fmtDate(d);
  };

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-white">التجار</h1>
          <p className="text-sm text-grey-500 mt-1">{merchantsTotal} تاجر مسجل</p>
        </div>
      </div>

      {/* Search */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4 mb-4">
        <div className="relative max-w-md">
          <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-600 text-lg">search</span>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="بحث بالاسم أو البريد..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 outline-none transition-all"
          />
        </div>
      </div>

      {/* Table */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">
            {[1, 2, 3, 4].map((i) => <div key={i} className="h-14 bg-grey-700/30 rounded-lg animate-pulse" />)}
          </div>
        ) : merchants.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons-outlined text-5xl text-grey-600 mb-3 block">group</span>
            <p className="text-grey-500 text-sm">لا يوجد تجار</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey-700/50">
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs">التاجر</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden md:table-cell">المتجر</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs">الدور</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden lg:table-cell">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden lg:table-cell">آخر دخول</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden md:table-cell">التسجيل</th>
                </tr>
              </thead>
              <tbody>
                {merchants.map((m) => (
                  <tr key={m.id} className="border-b border-grey-700/20 hover:bg-grey-700/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full bg-grey-700 flex items-center justify-center text-xs font-bold text-grey-300">
                          {m.name?.charAt(0) || '؟'}
                        </div>
                        <div>
                          <p className="font-semibold text-white text-sm">{m.name}</p>
                          <p className="text-xs text-grey-500">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 hidden md:table-cell">
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-grey-300">{m.tenant_name || '—'}</span>
                        {m.tenant_plan && (
                          <span className={`inline-block px-1.5 py-0.5 rounded-full text-[0.55rem] font-bold text-white ${planColors[m.tenant_plan] || 'bg-grey-600'}`}>
                            {planLabels[m.tenant_plan] || m.tenant_plan}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-grey-300 font-medium">{roleLabels[m.role] || m.role}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell">
                      <span className={`inline-block w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-green-400' : 'bg-grey-500'}`} />
                      <span className="text-xs text-grey-400 mr-1.5">{m.status === 'active' ? 'نشط' : 'معطل'}</span>
                    </td>
                    <td className="px-4 py-3 hidden lg:table-cell text-xs text-grey-500">{timeAgo(m.last_login_at)}</td>
                    <td className="px-4 py-3 hidden md:table-cell text-xs text-grey-500">{fmtDate(m.created_at)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
