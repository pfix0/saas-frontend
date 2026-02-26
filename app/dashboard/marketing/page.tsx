'use client';

/**
 * ساس — صفحة التسويق / الكوبونات
 * محادثة ٨
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useCouponsStore, Coupon } from '@/stores/coupons';

const statusLabels: Record<string, { label: string; color: string }> = {
  active: { label: 'نشط', color: 'bg-emerald-100 text-emerald-700' },
  expired: { label: 'منتهي', color: 'bg-red-100 text-red-700' },
  used_up: { label: 'مستنفد', color: 'bg-orange-100 text-orange-700' },
  inactive: { label: 'معطل', color: 'bg-gray-100 text-gray-500' },
  scheduled: { label: 'مجدول', color: 'bg-blue-100 text-blue-700' },
};

const statusFilters = [
  { key: '', label: 'الكل' },
  { key: 'active', label: 'نشط' },
  { key: 'expired', label: 'منتهي' },
  { key: 'used_up', label: 'مستنفد' },
  { key: 'inactive', label: 'معطل' },
];

export default function MarketingPage() {
  const { coupons, stats, pagination, isLoading, fetchCoupons, fetchStats, toggleCoupon, deleteCoupon } = useCouponsStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchStats();
  }, []);

  useEffect(() => {
    const params: Record<string, string> = { page: String(page) };
    if (search) params.search = search;
    if (statusFilter) params.status = statusFilter;
    fetchCoupons(params);
  }, [search, statusFilter, page]);

  const handleToggle = async (id: string) => {
    await toggleCoupon(id);
    fetchStats();
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteCoupon(deleteId);
    setDeleteId(null);
    fetchStats();
  };

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('ar-QA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div>
          <h1 className="text-xl font-bold text-grey-900">التسويق</h1>
          <p className="text-sm text-grey-500 mt-0.5">إدارة الكوبونات والعروض</p>
        </div>
        <Link
          href="/dashboard/marketing/coupons/new"
          className="btn-brand flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold"
        >
          <span className="material-icons-outlined text-lg">add</span>
          كوبون جديد
        </Link>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-brand-800 text-lg">confirmation_number</span>
              <span className="text-xs text-grey-500">إجمالي الكوبونات</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{stats.total}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-emerald-600 text-lg">check_circle</span>
              <span className="text-xs text-grey-500">نشط</span>
            </div>
            <p className="text-2xl font-black text-emerald-600">{stats.active}</p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-brand-800 text-lg">local_offer</span>
              <span className="text-xs text-grey-500">إجمالي الاستخدام</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{stats.total_uses} <span className="text-sm font-normal text-grey-400">مرة</span></p>
          </div>
          <div className="bg-white rounded-xl p-4 border border-grey-100">
            <div className="flex items-center gap-2 mb-2">
              <span className="material-icons-outlined text-orange-500 text-lg">savings</span>
              <span className="text-xs text-grey-500">خصومات مقدمة</span>
            </div>
            <p className="text-2xl font-black text-grey-900">{stats.total_discount.toFixed(0)} <span className="text-sm font-normal text-grey-400">ر.ق</span></p>
          </div>
        </div>
      )}

      {/* Search & Filters */}
      <div className="bg-white rounded-xl border border-grey-100 p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
            <input
              type="text"
              placeholder="بحث بالكود..."
              value={search}
              onChange={(e) => { setSearch(e.target.value); setPage(1); }}
              className="w-full pr-10 pl-4 py-2.5 rounded-lg border border-grey-200 text-sm focus:outline-none focus:border-brand-800"
              style={{ textAlign: 'right', direction: 'rtl' }}
            />
          </div>
        </div>

        {/* Status Pills */}
        <div className="flex gap-2 mt-3 flex-wrap">
          {statusFilters.map((f) => (
            <button
              key={f.key}
              onClick={() => { setStatusFilter(f.key); setPage(1); }}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === f.key
                  ? 'bg-brand-800 text-white'
                  : 'bg-grey-50 text-grey-600 hover:bg-grey-100'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Coupons List */}
      <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
            <p className="text-sm text-grey-400 mt-2">جاري التحميل...</p>
          </div>
        ) : coupons.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-4xl text-grey-200">confirmation_number</span>
            <p className="text-sm text-grey-400 mt-2">لا توجد كوبونات</p>
            <Link
              href="/dashboard/marketing/coupons/new"
              className="inline-flex items-center gap-1 mt-3 text-sm text-brand-800 font-bold hover:underline"
            >
              <span className="material-icons-outlined text-sm">add</span>
              أضف كوبون
            </Link>
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-grey-50 text-right text-xs text-grey-500 font-bold">
                    <th className="px-4 py-3">الكود</th>
                    <th className="px-4 py-3">الخصم</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">الاستخدام</th>
                    <th className="px-4 py-3">الحد الأدنى</th>
                    <th className="px-4 py-3">تاريخ الانتهاء</th>
                    <th className="px-4 py-3">إجراءات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-50">
                  {coupons.map((coupon) => (
                    <CouponRow
                      key={coupon.id}
                      coupon={coupon}
                      onToggle={handleToggle}
                      onDelete={setDeleteId}
                      formatDate={formatDate}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="lg:hidden divide-y divide-grey-50">
              {coupons.map((coupon) => (
                <CouponCard
                  key={coupon.id}
                  coupon={coupon}
                  onToggle={handleToggle}
                  onDelete={setDeleteId}
                  formatDate={formatDate}
                />
              ))}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-grey-50">
            <button
              disabled={page <= 1}
              onClick={() => setPage(page - 1)}
              className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
            <span className="text-xs text-grey-500 px-3">
              {page} / {pagination.pages}
            </span>
            <button
              disabled={page >= pagination.pages}
              onClick={() => setPage(page + 1)}
              className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setDeleteId(null)}>
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl" onClick={(e) => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto bg-red-100 rounded-full flex items-center justify-center mb-3">
                <span className="material-icons-outlined text-red-600">delete</span>
              </div>
              <h3 className="text-lg font-bold text-grey-900">حذف الكوبون؟</h3>
              <p className="text-sm text-grey-500 mt-1">
                إذا كان مستخدم في طلبات سابقة سيتم تعطيله فقط
              </p>
            </div>
            <div className="flex gap-3 mt-5">
              <button
                onClick={() => setDeleteId(null)}
                className="flex-1 px-4 py-2.5 rounded-xl border border-grey-200 text-sm font-bold text-grey-600 hover:bg-grey-50"
              >
                إلغاء
              </button>
              <button
                onClick={handleDelete}
                className="flex-1 px-4 py-2.5 rounded-xl bg-red-600 text-white text-sm font-bold hover:bg-red-700"
              >
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ═══ Desktop Row Component ═══
function CouponRow({
  coupon,
  onToggle,
  onDelete,
  formatDate,
}: {
  coupon: Coupon;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (d: string | null) => string;
}) {
  const status = statusLabels[coupon.computed_status] || statusLabels.inactive;

  return (
    <tr className="hover:bg-grey-25 transition-colors">
      <td className="px-4 py-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black text-brand-800 bg-brand-50 px-2 py-1 rounded-lg">
            {coupon.code}
          </span>
        </div>
        {coupon.description && (
          <p className="text-xs text-grey-400 mt-0.5">{coupon.description}</p>
        )}
      </td>
      <td className="px-4 py-3">
        <span className="text-sm font-bold text-grey-900">
          {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ر.ق`}
        </span>
        {coupon.max_discount && coupon.type === 'percentage' && (
          <span className="text-xs text-grey-400 block">حد أقصى: {coupon.max_discount} ر.ق</span>
        )}
      </td>
      <td className="px-4 py-3">
        <span className={`inline-block px-2 py-1 rounded-lg text-xs font-bold ${status.color}`}>
          {status.label}
        </span>
      </td>
      <td className="px-4 py-3 text-sm text-grey-600">
        {coupon.used_count}
        {coupon.max_uses && <span className="text-grey-400"> / {coupon.max_uses}</span>}
      </td>
      <td className="px-4 py-3 text-sm text-grey-600">
        {coupon.min_order ? `${coupon.min_order} ر.ق` : '—'}
      </td>
      <td className="px-4 py-3 text-sm text-grey-600">
        {formatDate(coupon.expires_at)}
      </td>
      <td className="px-4 py-3">
        <div className="flex items-center gap-1">
          <button
            onClick={() => onToggle(coupon.id)}
            className={`p-1.5 rounded-lg transition-colors ${
              coupon.is_active
                ? 'text-emerald-600 hover:bg-emerald-50'
                : 'text-grey-400 hover:bg-grey-50'
            }`}
            title={coupon.is_active ? 'تعطيل' : 'تفعيل'}
          >
            <span className="material-icons-outlined text-lg">
              {coupon.is_active ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>
          <Link
            href={`/dashboard/marketing/coupons/${coupon.id}/edit`}
            className="p-1.5 rounded-lg text-grey-400 hover:text-brand-800 hover:bg-brand-50 transition-colors"
          >
            <span className="material-icons-outlined text-lg">edit</span>
          </Link>
          <button
            onClick={() => onDelete(coupon.id)}
            className="p-1.5 rounded-lg text-grey-400 hover:text-red-600 hover:bg-red-50 transition-colors"
          >
            <span className="material-icons-outlined text-lg">delete</span>
          </button>
        </div>
      </td>
    </tr>
  );
}

// ═══ Mobile Card Component ═══
function CouponCard({
  coupon,
  onToggle,
  onDelete,
  formatDate,
}: {
  coupon: Coupon;
  onToggle: (id: string) => void;
  onDelete: (id: string) => void;
  formatDate: (d: string | null) => string;
}) {
  const status = statusLabels[coupon.computed_status] || statusLabels.inactive;

  return (
    <div className="p-4">
      <div className="flex items-start justify-between mb-2">
        <div className="flex items-center gap-2">
          <span className="font-mono text-sm font-black text-brand-800 bg-brand-50 px-2.5 py-1 rounded-lg">
            {coupon.code}
          </span>
          <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-bold ${status.color}`}>
            {status.label}
          </span>
        </div>
        <span className="text-sm font-bold text-grey-900">
          {coupon.type === 'percentage' ? `${coupon.value}%` : `${coupon.value} ر.ق`}
        </span>
      </div>
      {coupon.description && (
        <p className="text-xs text-grey-400 mb-2">{coupon.description}</p>
      )}
      <div className="flex items-center gap-4 text-xs text-grey-500">
        <span>استخدام: {coupon.used_count}{coupon.max_uses ? ` / ${coupon.max_uses}` : ''}</span>
        {coupon.min_order && <span>حد أدنى: {coupon.min_order} ر.ق</span>}
        {coupon.expires_at && <span>انتهاء: {formatDate(coupon.expires_at)}</span>}
      </div>
      <div className="flex items-center gap-2 mt-3 pt-3 border-t border-grey-50">
        <button
          onClick={() => onToggle(coupon.id)}
          className={`flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold transition-colors ${
            coupon.is_active
              ? 'bg-emerald-50 text-emerald-700'
              : 'bg-grey-50 text-grey-500'
          }`}
        >
          <span className="material-icons-outlined text-sm">
            {coupon.is_active ? 'toggle_on' : 'toggle_off'}
          </span>
          {coupon.is_active ? 'نشط' : 'معطل'}
        </button>
        <Link
          href={`/dashboard/marketing/coupons/${coupon.id}/edit`}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-brand-50 text-brand-800"
        >
          <span className="material-icons-outlined text-sm">edit</span>
          تعديل
        </Link>
        <button
          onClick={() => onDelete(coupon.id)}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-bold bg-red-50 text-red-600 mr-auto"
        >
          <span className="material-icons-outlined text-sm">delete</span>
        </button>
      </div>
    </div>
  );
}
