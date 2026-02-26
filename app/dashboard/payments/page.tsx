'use client';

/**
 * ساس — صفحة المالية
 * محادثة ٩
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { api } from '@/lib/api';

interface FinanceOverview {
  total_revenue: number;
  collected: number;
  pending: number;
  total_shipping: number;
  total_discounts: number;
  total_orders: number;
  avg_order: number;
  today: { revenue: number; orders: number };
  this_month: { revenue: number; orders: number };
  last_month: { revenue: number; orders: number };
}

interface PaymentBreakdown {
  method: string;
  label: string;
  orders: number;
  revenue: number;
  collected: number;
}

interface Transaction {
  id: string;
  order_number: string;
  total: number;
  subtotal: number;
  shipping_cost: number;
  discount_amount: number;
  payment_method: string;
  payment_status: string;
  status: string;
  created_at: string;
  customer_name: string;
  customer_phone: string;
}

const paymentLabels: Record<string, string> = {
  cod: 'الدفع عند الاستلام',
  bank_transfer: 'تحويل بنكي',
  skypay: 'سكاي باي كاش',
  sadad: 'سداد',
};

const paymentStatusLabels: Record<string, { label: string; color: string }> = {
  paid: { label: 'مدفوع', color: 'bg-emerald-100 text-emerald-700' },
  pending: { label: 'معلّق', color: 'bg-amber-100 text-amber-700' },
  refunded: { label: 'مسترد', color: 'bg-red-100 text-red-700' },
};

export default function PaymentsPage() {
  const [overview, setOverview] = useState<FinanceOverview | null>(null);
  const [byPayment, setByPayment] = useState<PaymentBreakdown[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [pagination, setPagination] = useState({ total: 0, page: 1, pages: 0 });
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ payment_status: 'all', page: 1 });

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    loadTransactions();
  }, [filter]);

  const loadData = async () => {
    try {
      const [overviewRes, paymentRes] = await Promise.all([
        api.get('/api/finance/overview'),
        api.get('/api/finance/by-payment'),
      ]);
      setOverview(overviewRes.data);
      setByPayment(paymentRes.data);
    } catch {}
    setLoading(false);
  };

  const loadTransactions = async () => {
    try {
      const params = new URLSearchParams({ page: String(filter.page), limit: '15' });
      if (filter.payment_status !== 'all') params.set('payment_status', filter.payment_status);
      const res = await api.get(`/api/finance/transactions?${params}`);
      setTransactions(res.data);
      setPagination(res.pagination);
    } catch {}
  };

  const fmt = (n: number) => n.toLocaleString('ar-QA', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <span className="material-icons-outlined text-3xl text-grey-300 animate-spin">sync</span>
      </div>
    );
  }

  const monthGrowth = overview && overview.last_month.revenue > 0
    ? ((overview.this_month.revenue - overview.last_month.revenue) / overview.last_month.revenue * 100).toFixed(0)
    : null;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-grey-900">المالية</h1>
        <p className="text-sm text-grey-500 mt-0.5">ملخص الإيرادات والمدفوعات</p>
      </div>

      {/* Overview Cards */}
      {overview && (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
          <StatCard icon="account_balance_wallet" iconColor="text-brand-800" label="إجمالي الإيرادات" value={`${fmt(overview.total_revenue)} ر.ق`} />
          <StatCard icon="check_circle" iconColor="text-emerald-600" label="المحصّل" value={`${fmt(overview.collected)} ر.ق`} />
          <StatCard icon="schedule" iconColor="text-amber-500" label="معلّق" value={`${fmt(overview.pending)} ر.ق`} />
          <StatCard icon="receipt_long" iconColor="text-blue-500" label="متوسط الطلب" value={`${fmt(overview.avg_order)} ر.ق`} />
        </div>
      )}

      {/* Period Summary */}
      {overview && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3">
          <div className="bg-white rounded-xl border border-grey-100 p-4">
            <p className="text-xs text-grey-500 mb-1">اليوم</p>
            <p className="text-xl font-black text-grey-900">{fmt(overview.today.revenue)} <span className="text-sm font-normal text-grey-400">ر.ق</span></p>
            <p className="text-xs text-grey-400 mt-1">{overview.today.orders} طلب</p>
          </div>
          <div className="bg-white rounded-xl border border-grey-100 p-4">
            <div className="flex items-center justify-between">
              <p className="text-xs text-grey-500 mb-1">هذا الشهر</p>
              {monthGrowth && (
                <span className={`text-xs font-bold px-1.5 py-0.5 rounded ${parseFloat(monthGrowth) >= 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                  {parseFloat(monthGrowth) >= 0 ? '+' : ''}{monthGrowth}%
                </span>
              )}
            </div>
            <p className="text-xl font-black text-grey-900">{fmt(overview.this_month.revenue)} <span className="text-sm font-normal text-grey-400">ر.ق</span></p>
            <p className="text-xs text-grey-400 mt-1">{overview.this_month.orders} طلب</p>
          </div>
          <div className="bg-white rounded-xl border border-grey-100 p-4">
            <p className="text-xs text-grey-500 mb-1">الشهر الماضي</p>
            <p className="text-xl font-black text-grey-900">{fmt(overview.last_month.revenue)} <span className="text-sm font-normal text-grey-400">ر.ق</span></p>
            <p className="text-xs text-grey-400 mt-1">{overview.last_month.orders} طلب</p>
          </div>
        </div>
      )}

      {/* Payment Methods Breakdown */}
      {byPayment.length > 0 && (
        <div className="bg-white rounded-xl border border-grey-100 p-5">
          <h2 className="text-sm font-bold text-grey-900 mb-4">حسب طريقة الدفع</h2>
          <div className="space-y-3">
            {byPayment.map((pm) => {
              const pct = overview && overview.total_revenue > 0
                ? (pm.revenue / overview.total_revenue * 100).toFixed(0)
                : '0';
              return (
                <div key={pm.method} className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                    <span className="material-icons-outlined text-brand-800 text-lg">payments</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-grey-800">{pm.label}</span>
                      <span className="text-sm font-bold text-grey-900">{fmt(pm.revenue)} ر.ق</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-grey-100 rounded-full overflow-hidden">
                        <div className="h-full bg-brand-800 rounded-full" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="text-xs text-grey-400 w-10 text-left">{pct}%</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-grey-400">
                      <span>{pm.orders} طلب</span>
                      <span>محصّل: {fmt(pm.collected)} ر.ق</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Extra stats */}
          {overview && (
            <div className="grid grid-cols-2 gap-3 mt-4 pt-4 border-t border-grey-50">
              <div className="bg-grey-25 rounded-lg p-3 text-center">
                <p className="text-xs text-grey-400">تكاليف شحن</p>
                <p className="text-sm font-bold text-grey-700 mt-0.5">{fmt(overview.total_shipping)} ر.ق</p>
              </div>
              <div className="bg-grey-25 rounded-lg p-3 text-center">
                <p className="text-xs text-grey-400">خصومات</p>
                <p className="text-sm font-bold text-grey-700 mt-0.5">{fmt(overview.total_discounts)} ر.ق</p>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Transactions */}
      <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
        <div className="p-4 border-b border-grey-50 flex items-center justify-between flex-wrap gap-2">
          <h2 className="text-sm font-bold text-grey-900">المعاملات</h2>
          <div className="flex gap-1">
            {[
              { key: 'all', label: 'الكل' },
              { key: 'paid', label: 'مدفوع' },
              { key: 'pending', label: 'معلّق' },
            ].map((f) => (
              <button
                key={f.key}
                onClick={() => setFilter({ ...filter, payment_status: f.key, page: 1 })}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                  filter.payment_status === f.key
                    ? 'bg-brand-800 text-white'
                    : 'bg-grey-50 text-grey-500 hover:bg-grey-100'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {transactions.length === 0 ? (
          <div className="p-12 text-center">
            <span className="material-icons-outlined text-3xl text-grey-200">receipt_long</span>
            <p className="text-sm text-grey-400 mt-2">لا توجد معاملات</p>
          </div>
        ) : (
          <>
            {/* Desktop */}
            <div className="hidden lg:block overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="bg-grey-50 text-right text-xs text-grey-500 font-bold">
                    <th className="px-4 py-3">الطلب</th>
                    <th className="px-4 py-3">العميل</th>
                    <th className="px-4 py-3">المبلغ</th>
                    <th className="px-4 py-3">طريقة الدفع</th>
                    <th className="px-4 py-3">الحالة</th>
                    <th className="px-4 py-3">التاريخ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-grey-50">
                  {transactions.map((tx) => {
                    const ps = paymentStatusLabels[tx.payment_status] || paymentStatusLabels.pending;
                    return (
                      <tr key={tx.id} className="hover:bg-grey-25">
                        <td className="px-4 py-3">
                          <Link href={`/dashboard/orders/${tx.id}`} className="text-sm font-bold text-brand-800 hover:underline">
                            {tx.order_number}
                          </Link>
                        </td>
                        <td className="px-4 py-3 text-sm text-grey-600">{tx.customer_name}</td>
                        <td className="px-4 py-3 text-sm font-bold text-grey-900">{fmt(parseFloat(String(tx.total)))} ر.ق</td>
                        <td className="px-4 py-3 text-xs text-grey-500">{paymentLabels[tx.payment_method] || tx.payment_method}</td>
                        <td className="px-4 py-3">
                          <span className={`px-2 py-1 rounded-lg text-xs font-bold ${ps.color}`}>{ps.label}</span>
                        </td>
                        <td className="px-4 py-3 text-xs text-grey-400">{fmtDate(tx.created_at)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile */}
            <div className="lg:hidden divide-y divide-grey-50">
              {transactions.map((tx) => {
                const ps = paymentStatusLabels[tx.payment_status] || paymentStatusLabels.pending;
                return (
                  <Link key={tx.id} href={`/dashboard/orders/${tx.id}`} className="block p-4 hover:bg-grey-25">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-bold text-brand-800">{tx.order_number}</span>
                      <span className="text-sm font-bold text-grey-900">{fmt(parseFloat(String(tx.total)))} ر.ق</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-grey-500">{tx.customer_name}</span>
                      <span className={`px-2 py-0.5 rounded-lg text-[0.65rem] font-bold ${ps.color}`}>{ps.label}</span>
                    </div>
                    <div className="flex items-center gap-3 mt-1 text-xs text-grey-400">
                      <span>{paymentLabels[tx.payment_method] || tx.payment_method}</span>
                      <span>{fmtDate(tx.created_at)}</span>
                    </div>
                  </Link>
                );
              })}
            </div>
          </>
        )}

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t border-grey-50">
            <button disabled={filter.page <= 1} onClick={() => setFilter({ ...filter, page: filter.page - 1 })}
              className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30">
              <span className="material-icons-outlined text-sm">chevron_right</span>
            </button>
            <span className="text-xs text-grey-500 px-3">{filter.page} / {pagination.pages}</span>
            <button disabled={filter.page >= pagination.pages} onClick={() => setFilter({ ...filter, page: filter.page + 1 })}
              className="p-2 rounded-lg bg-grey-50 hover:bg-grey-100 disabled:opacity-30">
              <span className="material-icons-outlined text-sm">chevron_left</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ icon, iconColor, label, value }: { icon: string; iconColor: string; label: string; value: string }) {
  return (
    <div className="bg-white rounded-xl p-4 border border-grey-100">
      <div className="flex items-center gap-2 mb-2">
        <span className={`material-icons-outlined text-lg ${iconColor}`}>{icon}</span>
        <span className="text-xs text-grey-500">{label}</span>
      </div>
      <p className="text-xl font-black text-grey-900">{value}</p>
    </div>
  );
}
