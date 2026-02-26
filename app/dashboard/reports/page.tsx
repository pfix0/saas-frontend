'use client';

/**
 * ساس — Reports & Analytics Dashboard
 * محادثة ١٢: التقارير والإحصائيات المتقدمة
 */

import { useEffect, useState, useMemo } from 'react';
import { useReportsStore } from '@/stores/reports';

// ═══ Period labels ═══
const periods = [
  { value: '7d', label: '٧ أيام' },
  { value: '30d', label: '٣٠ يوم' },
  { value: '90d', label: '٩٠ يوم' },
  { value: '365d', label: 'سنة' },
];

// ═══ Helpers ═══
function formatCurrency(n: number) {
  return n.toLocaleString('ar-QA', { minimumFractionDigits: 0, maximumFractionDigits: 0 }) + ' ر.ق';
}
function formatNum(n: number) {
  return n.toLocaleString('ar-QA');
}
function toAr(n: number | string) {
  return String(n).replace(/\d/g, (d) => '٠١٢٣٤٥٦٧٨٩'[parseInt(d)]);
}

const statusLabels: Record<string, string> = {
  new: 'جديد', confirmed: 'مؤكد', processing: 'جاري التجهيز',
  shipped: 'تم الشحن', delivered: 'تم التوصيل', cancelled: 'ملغي',
};
const statusColors: Record<string, string> = {
  new: '#2874a6', confirmed: '#660033', processing: '#d4850a',
  shipped: '#2874a6', delivered: '#1a8a5c', cancelled: '#c0392b',
};
const paymentLabels: Record<string, string> = {
  cod: 'عند الاستلام', skipcash: 'SkipCash', sadad: 'سداد', bank_transfer: 'تحويل بنكي',
};
const shippingLabels: Record<string, string> = {
  aramex: 'Aramex', dhl: 'DHL', local: 'توصيل محلي', pickup: 'استلام من المتجر',
};

// ═══ Mini Bar Chart (CSS-only) ═══
function MiniBarChart({ data, valueKey, labelKey, color = '#660033', maxBars = 14 }: {
  data: any[]; valueKey: string; labelKey: string; color?: string; maxBars?: number;
}) {
  const sliced = data.slice(-maxBars);
  const max = Math.max(...sliced.map(d => d[valueKey]), 1);
  
  return (
    <div className="flex items-end gap-[3px] h-[120px] mt-4">
      {sliced.map((d, i) => {
        const pct = (d[valueKey] / max) * 100;
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1 group relative">
            <div className="absolute -top-8 bg-grey-800 text-white text-[0.6rem] px-2 py-1 rounded 
              opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10 pointer-events-none">
              {typeof d[valueKey] === 'number' && d[valueKey] > 999
                ? formatCurrency(d[valueKey])
                : toAr(d[valueKey])}
            </div>
            <div
              className="w-full rounded-t-[3px] transition-all duration-300 hover:opacity-80"
              style={{ height: `${Math.max(pct, 3)}%`, backgroundColor: color, minHeight: '2px' }}
            />
            <span className="text-[0.5rem] text-grey-400 truncate max-w-full">
              {d[labelKey]?.slice(-2)}
            </span>
          </div>
        );
      })}
    </div>
  );
}

// ═══ Progress Ring ═══
function ProgressRing({ value, max, color = '#660033', size = 80, label }: {
  value: number; max: number; color?: string; size?: number; label: string;
}) {
  const pct = max > 0 ? (value / max) * 100 : 0;
  const r = (size - 8) / 2;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  return (
    <div className="flex flex-col items-center gap-2">
      <svg width={size} height={size} className="-rotate-90">
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={circ} strokeDashoffset={offset}
          strokeLinecap="round" className="transition-all duration-700" />
      </svg>
      <span className="text-sm font-bold text-grey-700">{toAr(Math.round(pct))}٪</span>
      <span className="text-xs text-grey-400">{label}</span>
    </div>
  );
}

// ═══ Horizontal Bar ═══
function HBar({ items, colorMap }: {
  items: { label: string; value: number; count: number }[];
  colorMap?: Record<string, string>;
}) {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  return (
    <div className="space-y-3">
      {items.map((item, i) => {
        const pct = (item.value / total) * 100;
        const color = colorMap?.[item.label] || '#660033';
        return (
          <div key={i}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-grey-600">{item.label}</span>
              <span className="font-medium text-grey-800">
                {formatCurrency(item.value)} <span className="text-grey-400">({toAr(item.count)})</span>
              </span>
            </div>
            <div className="h-2 bg-grey-100 rounded-full overflow-hidden">
              <div className="h-full rounded-full transition-all duration-500"
                style={{ width: `${pct}%`, backgroundColor: color }} />
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ═══ Main Component ═══
export default function ReportsPage() {
  const {
    period, setPeriod, overview, sales, topProducts,
    ordersReport, categories, customerReport, loading, fetchAll,
  } = useReportsStore();
  const [activeTab, setActiveTab] = useState('overview');
  const [salesGroup, setSalesGroup] = useState('day');
  const [productSort, setProductSort] = useState('revenue');

  useEffect(() => {
    fetchAll();
  }, [period]);

  // Refetch sales when group changes
  useEffect(() => {
    useReportsStore.getState().fetchSales(salesGroup);
  }, [salesGroup, period]);

  // Refetch products when sort changes
  useEffect(() => {
    useReportsStore.getState().fetchTopProducts(productSort);
  }, [productSort, period]);

  const tabs = [
    { id: 'overview', icon: 'dashboard', label: 'نظرة عامة' },
    { id: 'sales', icon: 'trending_up', label: 'المبيعات' },
    { id: 'products', icon: 'inventory_2', label: 'المنتجات' },
    { id: 'orders', icon: 'shopping_bag', label: 'الطلبات' },
    { id: 'customers', icon: 'people', label: 'العملاء' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-[1400px]">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-xl lg:text-2xl font-bold text-grey-800 font-tajawal">التقارير والإحصائيات</h1>
          <p className="text-sm text-grey-400 mt-1">تحليل أداء متجرك بالتفصيل</p>
        </div>
        <div className="flex items-center gap-2">
          {periods.map(p => (
            <button key={p.value} onClick={() => setPeriod(p.value)}
              className={`px-3 py-1.5 rounded-lg text-sm transition-all ${
                period === p.value
                  ? 'bg-brand-800 text-white shadow-saas-brand'
                  : 'bg-white text-grey-500 hover:bg-grey-50 border border-grey-200'
              }`}>
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 bg-grey-50 p-1 rounded-xl overflow-x-auto">
        {tabs.map(tab => (
          <button key={tab.id} onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm whitespace-nowrap transition-all ${
              activeTab === tab.id
                ? 'bg-white text-brand-800 shadow-saas font-medium'
                : 'text-grey-400 hover:text-grey-600'
            }`}>
            <span className="material-icons-outlined text-[18px]">{tab.icon}</span>
            {tab.label}
          </button>
        ))}
      </div>

      {loading && !overview ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin w-8 h-8 border-2 border-brand-800 border-t-transparent rounded-full" />
        </div>
      ) : (
        <>
          {/* ═══ OVERVIEW TAB ═══ */}
          {activeTab === 'overview' && overview && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon="account_balance_wallet" label="الإيرادات" 
                  value={formatCurrency(overview.revenue.value)}
                  growth={overview.revenue.growth} color="brand" />
                <KPICard icon="shopping_bag" label="الطلبات"
                  value={toAr(overview.orders.total)}
                  growth={overview.orders.growth} color="info" />
                <KPICard icon="receipt_long" label="متوسط الطلب"
                  value={formatCurrency(overview.avgOrder.value)} color="success" />
                <KPICard icon="people" label="العملاء"
                  value={toAr(overview.customers.total)}
                  growth={overview.customers.growth} color="warning" />
              </div>

              {/* Sales Chart + Quick Stats */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                <div className="lg:col-span-2 bg-white rounded-xl border border-grey-100 p-5">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-bold text-grey-700">تطور المبيعات</h3>
                    <div className="flex gap-1">
                      {['day', 'week', 'month'].map(g => (
                        <button key={g} onClick={() => setSalesGroup(g)}
                          className={`px-2 py-1 text-xs rounded ${
                            salesGroup === g ? 'bg-brand-50 text-brand-800' : 'text-grey-400 hover:text-grey-600'
                          }`}>
                          {g === 'day' ? 'يومي' : g === 'week' ? 'أسبوعي' : 'شهري'}
                        </button>
                      ))}
                    </div>
                  </div>
                  {sales.length > 0 ? (
                    <MiniBarChart data={sales} valueKey="revenue" labelKey="label" />
                  ) : (
                    <div className="h-[120px] flex items-center justify-center text-grey-300 text-sm">
                      لا توجد بيانات
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-grey-100 p-5 space-y-4">
                  <h3 className="font-bold text-grey-700">ملخص سريع</h3>
                  <div className="space-y-3">
                    <QuickStat label="طلبات مدفوعة" value={toAr(overview.orders.paid)} icon="check_circle" color="success" />
                    <QuickStat label="تم التوصيل" value={toAr(overview.orders.delivered)} icon="local_shipping" color="info" />
                    <QuickStat label="ملغية" value={toAr(overview.orders.cancelled)} icon="cancel" color="danger" />
                    <QuickStat label="منتجات نشطة" value={toAr(overview.products.active)} icon="inventory_2" color="brand" />
                    <QuickStat label="نفاد المخزون" value={toAr(overview.products.outOfStock)} icon="warning" color="warning" />
                  </div>
                </div>
              </div>

              {/* Top Products + Top Customers */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">أفضل المنتجات</h3>
                  {topProducts.length > 0 ? (
                    <div className="space-y-3">
                      {topProducts.slice(0, 5).map((p, i) => (
                        <div key={p.id} className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-50 text-brand-800 text-xs font-bold">
                            {toAr(i + 1)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-grey-700 truncate">{p.name}</p>
                            <p className="text-xs text-grey-400">{toAr(p.totalOrders)} طلب · {toAr(p.totalQty)} قطعة</p>
                          </div>
                          <span className="text-sm font-bold text-brand-800">{formatCurrency(p.totalRevenue)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-grey-300 text-sm">لا توجد بيانات</p>
                  )}
                </div>

                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">أفضل العملاء</h3>
                  {customerReport?.topCustomers && customerReport.topCustomers.length > 0 ? (
                    <div className="space-y-3">
                      {customerReport.topCustomers.slice(0, 5).map((c, i) => (
                        <div key={c.id} className="flex items-center gap-3">
                          <span className="w-6 h-6 flex items-center justify-center rounded-full bg-info/10 text-info text-xs font-bold">
                            {toAr(i + 1)}
                          </span>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-grey-700 truncate">{c.name}</p>
                            <p className="text-xs text-grey-400">{toAr(c.totalOrders)} طلب</p>
                          </div>
                          <span className="text-sm font-bold text-info">{formatCurrency(c.totalSpent)}</span>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-grey-300 text-sm">لا توجد بيانات</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ═══ SALES TAB ═══ */}
          {activeTab === 'sales' && (
            <div className="space-y-6">
              <div className="bg-white rounded-xl border border-grey-100 p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-bold text-grey-700">تقرير المبيعات</h3>
                  <div className="flex gap-1">
                    {['day', 'week', 'month'].map(g => (
                      <button key={g} onClick={() => setSalesGroup(g)}
                        className={`px-3 py-1.5 text-xs rounded-lg ${
                          salesGroup === g ? 'bg-brand-800 text-white' : 'bg-grey-50 text-grey-400'
                        }`}>
                        {g === 'day' ? 'يومي' : g === 'week' ? 'أسبوعي' : 'شهري'}
                      </button>
                    ))}
                  </div>
                </div>
                {sales.length > 0 ? (
                  <MiniBarChart data={sales} valueKey="revenue" labelKey="label" maxBars={30} />
                ) : (
                  <div className="h-[120px] flex items-center justify-center text-grey-300 text-sm">
                    لا توجد بيانات في هذه الفترة
                  </div>
                )}
              </div>

              {/* Sales Table */}
              {sales.length > 0 && (
                <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="bg-grey-50">
                        <tr>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">التاريخ</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">الطلبات</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">الإيرادات</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">الشحن</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">الخصومات</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">متوسط الطلب</th>
                          <th className="text-right px-4 py-3 text-grey-500 font-medium">العملاء</th>
                        </tr>
                      </thead>
                      <tbody>
                        {sales.slice().reverse().map((row, i) => (
                          <tr key={i} className="border-t border-grey-50 hover:bg-grey-50/50">
                            <td className="px-4 py-3 font-medium text-grey-700">{row.label}</td>
                            <td className="px-4 py-3 text-grey-600">{toAr(row.orders)}</td>
                            <td className="px-4 py-3 font-medium text-brand-800">{formatCurrency(row.revenue)}</td>
                            <td className="px-4 py-3 text-grey-500">{formatCurrency(row.shipping)}</td>
                            <td className="px-4 py-3 text-danger">{formatCurrency(row.discounts)}</td>
                            <td className="px-4 py-3 text-grey-600">{formatCurrency(row.avgOrder)}</td>
                            <td className="px-4 py-3 text-grey-600">{toAr(row.customers)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ PRODUCTS TAB ═══ */}
          {activeTab === 'products' && (
            <div className="space-y-6">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm text-grey-400">ترتيب حسب:</span>
                {[
                  { v: 'revenue', l: 'الإيرادات' },
                  { v: 'quantity', l: 'الكمية' },
                  { v: 'orders', l: 'الطلبات' },
                ].map(s => (
                  <button key={s.v} onClick={() => setProductSort(s.v)}
                    className={`px-3 py-1.5 text-xs rounded-lg ${
                      productSort === s.v ? 'bg-brand-800 text-white' : 'bg-white text-grey-400 border border-grey-200'
                    }`}>
                    {s.l}
                  </button>
                ))}
              </div>

              {/* Products Table */}
              <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-grey-50">
                      <tr>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">#</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">المنتج</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">السعر</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">الطلبات</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">المبيعات (كمية)</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">الإيرادات</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">التقييم</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">المخزون</th>
                      </tr>
                    </thead>
                    <tbody>
                      {topProducts.map((p, i) => (
                        <tr key={p.id} className="border-t border-grey-50 hover:bg-grey-50/50">
                          <td className="px-4 py-3">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-brand-50 text-brand-800 text-xs font-bold">
                              {toAr(i + 1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-grey-700 max-w-[200px] truncate">{p.name}</td>
                          <td className="px-4 py-3 text-grey-600">{formatCurrency(p.price)}</td>
                          <td className="px-4 py-3 text-grey-600">{toAr(p.totalOrders)}</td>
                          <td className="px-4 py-3 text-grey-600">{toAr(p.totalQty)}</td>
                          <td className="px-4 py-3 font-bold text-brand-800">{formatCurrency(p.totalRevenue)}</td>
                          <td className="px-4 py-3">
                            {p.avgRating > 0 ? (
                              <span className="text-warning text-xs">⭐ {toAr(p.avgRating.toFixed(1))} ({toAr(p.reviewCount)})</span>
                            ) : (
                              <span className="text-grey-300 text-xs">—</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span className={`text-xs font-medium ${p.stock <= 0 ? 'text-danger' : p.stock < 10 ? 'text-warning' : 'text-success'}`}>
                              {toAr(p.stock)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Categories Performance */}
              {categories.length > 0 && (
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">أداء التصنيفات</h3>
                  <HBar
                    items={categories.map(c => ({
                      label: c.name,
                      value: c.totalRevenue,
                      count: c.totalOrders,
                    }))}
                  />
                </div>
              )}
            </div>
          )}

          {/* ═══ ORDERS TAB ═══ */}
          {activeTab === 'orders' && ordersReport && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* By Status */}
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">حسب الحالة</h3>
                  <HBar
                    items={ordersReport.byStatus.map(s => ({
                      label: statusLabels[s.status] || s.status,
                      value: s.total,
                      count: s.count,
                    }))}
                    colorMap={Object.fromEntries(
                      ordersReport.byStatus.map(s => [statusLabels[s.status] || s.status, statusColors[s.status] || '#666'])
                    )}
                  />
                </div>

                {/* By Payment */}
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">حسب طريقة الدفع</h3>
                  <HBar
                    items={ordersReport.byPayment.map(p => ({
                      label: paymentLabels[p.method] || p.method,
                      value: p.total,
                      count: p.count,
                    }))}
                  />
                </div>

                {/* By Shipping */}
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-4">حسب طريقة الشحن</h3>
                  <HBar
                    items={ordersReport.byShipping.map(s => ({
                      label: shippingLabels[s.method] || s.method,
                      value: s.totalCost,
                      count: s.count,
                    }))}
                  />
                </div>

                {/* Conversion */}
                <div className="bg-white rounded-xl border border-grey-100 p-5 flex flex-col items-center justify-center">
                  <h3 className="font-bold text-grey-700 mb-4 self-start">معدل التحويل</h3>
                  <ProgressRing
                    value={ordersReport.conversion.buyingCustomers}
                    max={ordersReport.conversion.totalCustomers || 1}
                    label={`${toAr(ordersReport.conversion.buyingCustomers)} عميل شاري من ${toAr(ordersReport.conversion.totalCustomers)}`}
                    size={100}
                  />
                </div>
              </div>

              {/* Hourly Distribution */}
              {ordersReport.hourlyDistribution.length > 0 && (
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-2">توزيع الطلبات حسب الساعة</h3>
                  <p className="text-xs text-grey-400 mb-4">أوقات الذروة لمتجرك</p>
                  <div className="flex items-end gap-1 h-[100px]">
                    {Array.from({ length: 24 }, (_, h) => {
                      const found = ordersReport.hourlyDistribution.find(d => d.hour === h);
                      const count = found?.count || 0;
                      const max = Math.max(...ordersReport.hourlyDistribution.map(d => d.count), 1);
                      const pct = (count / max) * 100;
                      return (
                        <div key={h} className="flex-1 flex flex-col items-center gap-1 group relative">
                          <div className="absolute -top-7 bg-grey-800 text-white text-[0.55rem] px-1.5 py-0.5 rounded
                            opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
                            {toAr(h)}:٠٠ — {toAr(count)} طلب
                          </div>
                          <div className="w-full rounded-t-[2px] transition-all"
                            style={{
                              height: `${Math.max(pct, 2)}%`,
                              backgroundColor: count > 0 ? '#660033' : '#f3f4f6',
                              opacity: count > 0 ? 0.3 + (pct / 100) * 0.7 : 1,
                            }} />
                          {h % 4 === 0 && (
                            <span className="text-[0.45rem] text-grey-400">{toAr(h)}</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ═══ CUSTOMERS TAB ═══ */}
          {activeTab === 'customers' && customerReport && (
            <div className="space-y-6">
              {/* Stats Cards */}
              <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                <KPICard icon="people" label="إجمالي العملاء" value={toAr(customerReport.stats.total)} color="brand" />
                <KPICard icon="person_add" label="عملاء جدد (الفترة)" value={toAr(customerReport.stats.newInPeriod)} color="success" />
                <KPICard icon="schedule" label="جدد هذا الأسبوع" value={toAr(customerReport.stats.newThisWeek)} color="info" />
                <KPICard icon="replay" label="عملاء متكررون" value={toAr(customerReport.stats.repeatCustomers)} color="warning" />
              </div>

              {/* Acquisition Chart */}
              {customerReport.acquisition.length > 0 && (
                <div className="bg-white rounded-xl border border-grey-100 p-5">
                  <h3 className="font-bold text-grey-700 mb-2">اكتساب العملاء الجدد</h3>
                  <MiniBarChart data={customerReport.acquisition} valueKey="newCustomers" labelKey="label" color="#1a8a5c" />
                </div>
              )}

              {/* Top Customers Table */}
              <div className="bg-white rounded-xl border border-grey-100 overflow-hidden">
                <div className="px-5 py-4 border-b border-grey-50">
                  <h3 className="font-bold text-grey-700">أفضل العملاء إنفاقاً</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead className="bg-grey-50">
                      <tr>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">#</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">العميل</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">الجوال</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">الطلبات</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">إجمالي الإنفاق</th>
                        <th className="text-right px-4 py-3 text-grey-500 font-medium">آخر طلب</th>
                      </tr>
                    </thead>
                    <tbody>
                      {customerReport.topCustomers.map((c, i) => (
                        <tr key={c.id} className="border-t border-grey-50 hover:bg-grey-50/50">
                          <td className="px-4 py-3">
                            <span className="w-6 h-6 flex items-center justify-center rounded-full bg-info/10 text-info text-xs font-bold">
                              {toAr(i + 1)}
                            </span>
                          </td>
                          <td className="px-4 py-3 font-medium text-grey-700">{c.name}</td>
                          <td className="px-4 py-3 text-grey-500 font-mono text-xs" dir="ltr">{c.phone}</td>
                          <td className="px-4 py-3 text-grey-600">{toAr(c.totalOrders)}</td>
                          <td className="px-4 py-3 font-bold text-brand-800">{formatCurrency(c.totalSpent)}</td>
                          <td className="px-4 py-3 text-grey-400 text-xs">
                            {c.lastOrder ? new Date(c.lastOrder).toLocaleDateString('ar-QA') : '—'}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ═══ KPI Card Component ═══
function KPICard({ icon, label, value, growth, color = 'brand' }: {
  icon: string; label: string; value: string; growth?: number; color?: string;
}) {
  const colorMap: Record<string, string> = {
    brand: 'bg-brand-50 text-brand-800',
    success: 'bg-green-50 text-success',
    info: 'bg-blue-50 text-info',
    warning: 'bg-orange-50 text-warning',
    danger: 'bg-red-50 text-danger',
  };
  const iconBg = colorMap[color] || colorMap.brand;

  return (
    <div className="bg-white rounded-xl border border-grey-100 p-4 hover:shadow-saas transition-shadow">
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${iconBg}`}>
          <span className="material-icons-outlined text-lg">{icon}</span>
        </div>
        {growth !== undefined && (
          <span className={`mr-auto text-xs font-medium px-2 py-0.5 rounded-full ${
            growth >= 0 ? 'bg-green-50 text-success' : 'bg-red-50 text-danger'
          }`}>
            {growth >= 0 ? '↑' : '↓'} {toAr(Math.abs(growth))}٪
          </span>
        )}
      </div>
      <p className="text-xl lg:text-2xl font-bold text-grey-800">{value}</p>
      <p className="text-xs text-grey-400 mt-1">{label}</p>
    </div>
  );
}

// ═══ Quick Stat ═══
function QuickStat({ label, value, icon, color }: {
  label: string; value: string; icon: string; color: string;
}) {
  const colorMap: Record<string, string> = {
    brand: 'text-brand-800', success: 'text-success', info: 'text-info',
    warning: 'text-warning', danger: 'text-danger',
  };
  return (
    <div className="flex items-center gap-3">
      <span className={`material-icons-outlined text-base ${colorMap[color] || ''}`}>{icon}</span>
      <span className="text-sm text-grey-600 flex-1">{label}</span>
      <span className="text-sm font-bold text-grey-700">{value}</span>
    </div>
  );
}
