'use client';

/**
 * ساس — Customers List Page
 * محادثة ٧: إدارة العملاء
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCustomersStore } from '@/stores/customers';

export default function CustomersPage() {
  const {
    customers, stats, isLoading, total, page, totalPages,
    search, sort,
    fetchCustomers, fetchStats,
    setSearch, setSort, setPage,
  } = useCustomersStore();

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => { fetchCustomers(); fetchStats(); }, [page, sort]);

  useEffect(() => {
    const t = setTimeout(() => { if (searchInput !== search) { setSearch(searchInput); fetchCustomers(); } }, 400);
    return () => clearTimeout(t);
  }, [searchInput]);

  const fmtPrice = (v: number) => Number(v).toLocaleString('ar-QA', { minimumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric', year: 'numeric' });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900">العملاء</h1>
        <p className="text-sm text-grey-400 mt-1">{total > 0 ? `${total} عميل` : 'إدارة عملاء متجرك'}</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <span className="material-icons-outlined text-brand-800 text-lg">people</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">إجمالي العملاء</p>
                <p className="text-xl font-bold text-grey-900">{stats.total_customers}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="material-icons-outlined text-success text-lg">person_add</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">عملاء جدد اليوم</p>
                <p className="text-xl font-bold text-grey-900">{stats.today_new}</p>
              </div>
            </div>
          </div>
          <div className="card p-4 col-span-2 lg:col-span-1">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-icons-outlined text-warning text-lg">payments</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">إجمالي الإيرادات</p>
                <p className="text-xl font-bold text-brand-800">{fmtPrice(stats.total_revenue)} <span className="text-xs text-grey-400 font-normal">ر.ق</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
            <input type="text" value={searchInput} onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث بالاسم أو الجوال أو الإيميل..." className="input has-icon-right" />
          </div>
          <select value={sort} onChange={(e) => setSort(e.target.value)} className="input w-auto min-w-[140px]">
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="most_orders">الأكثر طلبات</option>
            <option value="highest_spent">الأعلى إنفاقاً</option>
            <option value="name_asc">الاسم أ-ي</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-outlined animate-spin text-3xl text-brand-800 mb-3">autorenew</span>
            <p className="text-sm text-grey-400">جارِ التحميل...</p>
          </div>
        ) : customers.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-outlined text-5xl text-grey-200 mb-3">people</span>
            <h3 className="text-base font-bold text-grey-700 mb-1">لا يوجد عملاء</h3>
            <p className="text-sm text-grey-400">{search ? 'جرب بحث مختلف' : 'سيظهر العملاء عند أول طلب'}</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>العميل</th>
                    <th>الجوال</th>
                    <th>الطلبات</th>
                    <th>إجمالي الإنفاق</th>
                    <th>آخر طلب</th>
                    <th>الحالة</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((c) => (
                    <tr key={c.id}>
                      <td>
                        <div className="flex items-center gap-3">
                          <div className="w-9 h-9 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                            <span className="font-tajawal text-sm font-bold text-brand-800">{c.name?.[0] || '؟'}</span>
                          </div>
                          <div>
                            <Link href={`/dashboard/customers/${c.id}`} className="text-sm font-semibold text-grey-800 hover:text-brand-800">{c.name || 'بدون اسم'}</Link>
                            {c.email && <p className="text-[0.6rem] text-grey-400" dir="ltr">{c.email}</p>}
                          </div>
                        </div>
                      </td>
                      <td><span className="text-sm text-grey-600 font-mono" dir="ltr">{c.phone}</span></td>
                      <td><span className="text-sm font-semibold text-grey-700">{c.orders_count}</span></td>
                      <td><span className="text-sm font-bold text-grey-900">{fmtPrice(c.total_spent)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></span></td>
                      <td><span className="text-xs text-grey-400">{c.last_order_at ? fmtDate(c.last_order_at) : '—'}</span></td>
                      <td>
                        <span className={`badge ${c.status === 'active' ? 'badge-success' : 'badge-danger'}`}>
                          {c.status === 'active' ? 'نشط' : 'محظور'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/dashboard/customers/${c.id}`} className="p-2 rounded-lg hover:bg-grey-100 inline-flex">
                          <span className="material-icons-outlined text-grey-400 text-lg">arrow_back</span>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-grey-100">
              {customers.map((c) => (
                <Link key={c.id} href={`/dashboard/customers/${c.id}`} className="block p-4 hover:bg-grey-50/50 transition-colors">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="font-tajawal text-sm font-bold text-brand-800">{c.name?.[0] || '؟'}</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grey-800 truncate">{c.name || 'بدون اسم'}</p>
                      <p className="text-xs text-grey-400 font-mono" dir="ltr">{c.phone}</p>
                    </div>
                    <div className="text-left">
                      <p className="text-sm font-bold text-grey-900">{fmtPrice(c.total_spent)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></p>
                      <p className="text-[0.6rem] text-grey-400">{c.orders_count} طلب</p>
                    </div>
                  </div>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-grey-100">
                <p className="text-xs text-grey-400">صفحة {page} من {totalPages}</p>
                <div className="flex gap-1">
                  <button onClick={() => setPage(page - 1)} disabled={page === 1} className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors">
                    <span className="material-icons-outlined text-grey-500 text-lg">chevron_right</span>
                  </button>
                  <button onClick={() => setPage(page + 1)} disabled={page === totalPages} className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 transition-colors">
                    <span className="material-icons-outlined text-grey-500 text-lg">chevron_left</span>
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
