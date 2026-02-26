'use client';

/**
 * ساس — Orders List Page
 * محادثة ٦: إدارة الطلبات
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useOrdersStore, type OrderListItem } from '@/stores/orders';
import { useAuthStore } from '@/stores/auth';

const STATUS_MAP: Record<string, { label: string; class: string; icon: string }> = {
  new:        { label: 'جديد',         class: 'badge-info',    icon: 'fiber_new' },
  confirmed:  { label: 'مؤكد',         class: 'badge-brand',   icon: 'check_circle' },
  processing: { label: 'قيد التجهيز',  class: 'badge-warning', icon: 'inventory' },
  shipped:    { label: 'تم الشحن',     class: 'badge-info',    icon: 'local_shipping' },
  delivered:  { label: 'تم التوصيل',   class: 'badge-success', icon: 'done_all' },
  cancelled:  { label: 'ملغي',         class: 'badge-danger',  icon: 'cancel' },
  returned:   { label: 'مسترجع',       class: 'badge-warning', icon: 'assignment_return' },
};

const PAYMENT_MAP: Record<string, { label: string; class: string }> = {
  pending:  { label: 'في الانتظار', class: 'text-amber-600 bg-amber-50' },
  paid:     { label: 'مدفوع',      class: 'text-green-600 bg-green-50' },
  failed:   { label: 'فشل',        class: 'text-red-600 bg-red-50' },
  refunded: { label: 'مسترد',      class: 'text-purple-600 bg-purple-50' },
};

const SHIPPING_MAP: Record<string, string> = {
  aramex: 'أرامكس', dhl: 'DHL', pickup: 'استلام',
};

const STATUS_FILTERS = [
  { value: 'all', label: 'الكل' },
  { value: 'new', label: 'جديد' },
  { value: 'confirmed', label: 'مؤكد' },
  { value: 'processing', label: 'قيد التجهيز' },
  { value: 'shipped', label: 'تم الشحن' },
  { value: 'delivered', label: 'تم التوصيل' },
  { value: 'cancelled', label: 'ملغي' },
];

export default function OrdersPage() {
  const { tenant } = useAuthStore();
  const {
    orders, stats, isLoading, total, page, totalPages,
    search, statusFilter, sort,
    fetchOrders, fetchStats,
    setSearch, setStatusFilter, setSort, setPage,
  } = useOrdersStore();

  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchOrders();
    fetchStats();
  }, [page, statusFilter, sort]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        fetchOrders();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const fmtPrice = (val: number) =>
    Number(val).toLocaleString('ar-QA', { minimumFractionDigits: 0 });

  const fmtDate = (d: string) =>
    new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric' });

  const fmtTime = (d: string) =>
    new Date(d).toLocaleTimeString('ar-QA', { hour: '2-digit', minute: '2-digit' });

  return (
    <div className="animate-fade-in">
      {/* ═══ Header ═══ */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">الطلبات</h1>
          <p className="text-sm text-grey-400 mt-1">
            {total > 0 ? `${total} طلب` : 'إدارة طلبات متجرك'}
          </p>
        </div>
      </div>

      {/* ═══ Stats Cards ═══ */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center">
                <span className="material-icons-outlined text-info text-lg">fiber_new</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">طلبات جديدة</p>
                <p className="text-xl font-bold text-grey-900">{stats.new_orders}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-amber-50 flex items-center justify-center">
                <span className="material-icons-outlined text-warning text-lg">inventory</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">قيد المعالجة</p>
                <p className="text-xl font-bold text-grey-900">{stats.processing_orders}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-green-50 flex items-center justify-center">
                <span className="material-icons-outlined text-success text-lg">today</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">طلبات اليوم</p>
                <p className="text-xl font-bold text-grey-900">{stats.today_orders}</p>
              </div>
            </div>
          </div>
          <div className="card p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center">
                <span className="material-icons-outlined text-brand-800 text-lg">payments</span>
              </div>
              <div>
                <p className="text-xs text-grey-400 font-semibold">إيرادات اليوم</p>
                <p className="text-xl font-bold text-brand-800">{fmtPrice(stats.today_revenue)} <span className="text-xs text-grey-400 font-normal">ر.ق</span></p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ Filters Bar ═══ */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="relative flex-1">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث برقم الطلب أو اسم العميل أو الجوال..."
              className="input has-icon-right"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input w-auto min-w-[140px]"
          >
            {STATUS_FILTERS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>

          {/* Sort */}
          <select
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="input w-auto min-w-[130px]"
          >
            <option value="newest">الأحدث</option>
            <option value="oldest">الأقدم</option>
            <option value="highest">الأعلى مبلغاً</option>
            <option value="lowest">الأقل مبلغاً</option>
          </select>
        </div>

        {/* Status Quick Filters (pills) */}
        <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
          {STATUS_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => setStatusFilter(f.value)}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                statusFilter === f.value
                  ? 'bg-brand-800 text-white'
                  : 'bg-grey-100 text-grey-500 hover:bg-grey-200'
              }`}
            >
              {f.label}
              {stats && f.value !== 'all' && stats.by_status[f.value] ? (
                <span className={`mr-1 ${statusFilter === f.value ? 'opacity-70' : ''}`}>
                  ({stats.by_status[f.value]})
                </span>
              ) : null}
            </button>
          ))}
        </div>
      </div>

      {/* ═══ Orders Table (Desktop) ═══ */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-outlined animate-spin text-3xl text-brand-800 mb-3">autorenew</span>
            <p className="text-sm text-grey-400">جارِ تحميل الطلبات...</p>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16">
            <span className="material-icons-outlined text-5xl text-grey-200 mb-3">shopping_bag</span>
            <h3 className="text-base font-bold text-grey-700 mb-1">لا توجد طلبات</h3>
            <p className="text-sm text-grey-400">
              {search || statusFilter !== 'all' ? 'جرب تغيير الفلاتر' : 'ستظهر الطلبات هنا عندما يشتري العملاء'}
            </p>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="table-saas">
                <thead>
                  <tr>
                    <th>رقم الطلب</th>
                    <th>العميل</th>
                    <th>المنتجات</th>
                    <th>الإجمالي</th>
                    <th>الحالة</th>
                    <th>الدفع</th>
                    <th>الشحن</th>
                    <th>التاريخ</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => {
                    const st = STATUS_MAP[order.status] || STATUS_MAP.new;
                    const pm = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
                    return (
                      <tr key={order.id}>
                        <td>
                          <Link href={`/dashboard/orders/${order.id}`} className="font-mono text-sm font-bold text-brand-800 hover:underline" dir="ltr">
                            {order.order_number}
                          </Link>
                        </td>
                        <td>
                          <p className="text-sm font-semibold text-grey-800">{order.customer_name || 'زائر'}</p>
                          <p className="text-xs text-grey-400" dir="ltr">{order.customer_phone}</p>
                        </td>
                        <td>
                          <span className="text-sm text-grey-600">{order.items_count} منتج</span>
                        </td>
                        <td>
                          <span className="text-sm font-bold text-grey-900">{fmtPrice(order.total)}</span>
                          <span className="text-[0.6rem] text-grey-400 mr-1">ر.ق</span>
                        </td>
                        <td>
                          <span className={`badge ${st.class}`}>
                            <span className="material-icons-outlined text-[11px]">{st.icon}</span>
                            {st.label}
                          </span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded text-[0.65rem] font-semibold ${pm.class}`}>
                            {pm.label}
                          </span>
                        </td>
                        <td>
                          <span className="text-xs text-grey-500">{SHIPPING_MAP[order.shipping_method] || order.shipping_method}</span>
                        </td>
                        <td>
                          <p className="text-xs text-grey-500">{fmtDate(order.created_at)}</p>
                          <p className="text-[0.6rem] text-grey-400">{fmtTime(order.created_at)}</p>
                        </td>
                        <td>
                          <Link href={`/dashboard/orders/${order.id}`}
                            className="p-2 rounded-lg hover:bg-grey-100 transition-colors inline-flex">
                            <span className="material-icons-outlined text-grey-400 text-lg">arrow_back</span>
                          </Link>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-grey-100">
              {orders.map((order) => {
                const st = STATUS_MAP[order.status] || STATUS_MAP.new;
                const pm = PAYMENT_MAP[order.payment_status] || PAYMENT_MAP.pending;
                return (
                  <Link key={order.id} href={`/dashboard/orders/${order.id}`}
                    className="block p-4 hover:bg-grey-50/50 transition-colors">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <p className="font-mono text-sm font-bold text-brand-800" dir="ltr">{order.order_number}</p>
                        <p className="text-sm font-semibold text-grey-800 mt-0.5">{order.customer_name || 'زائر'}</p>
                      </div>
                      <span className={`badge ${st.class}`}>
                        <span className="material-icons-outlined text-[11px]">{st.icon}</span>
                        {st.label}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-2">
                      <div className="flex items-center gap-3 text-xs text-grey-400">
                        <span>{order.items_count} منتج</span>
                        <span>{SHIPPING_MAP[order.shipping_method] || ''}</span>
                        <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[0.6rem] font-semibold ${pm.class}`}>{pm.label}</span>
                      </div>
                      <div className="text-left">
                        <p className="text-sm font-bold text-grey-900">{fmtPrice(order.total)} <span className="text-[0.6rem] text-grey-400 font-normal">ر.ق</span></p>
                        <p className="text-[0.6rem] text-grey-400">{fmtDate(order.created_at)} — {fmtTime(order.created_at)}</p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between px-4 py-3 border-t border-grey-100">
                <p className="text-xs text-grey-400">
                  صفحة {page} من {totalPages} ({total} طلب)
                </p>
                <div className="flex gap-1">
                  <button
                    onClick={() => setPage(page - 1)}
                    disabled={page === 1}
                    className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
                    <span className="material-icons-outlined text-grey-500 text-lg">chevron_right</span>
                  </button>
                  {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button
                        key={p}
                        onClick={() => setPage(p)}
                        className={`w-8 h-8 rounded-lg text-xs font-bold transition-colors ${
                          page === p
                            ? 'bg-brand-800 text-white'
                            : 'text-grey-500 hover:bg-grey-100'
                        }`}
                      >
                        {p}
                      </button>
                    );
                  })}
                  <button
                    onClick={() => setPage(page + 1)}
                    disabled={page === totalPages}
                    className="p-2 rounded-lg hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed transition-colors"
                  >
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
