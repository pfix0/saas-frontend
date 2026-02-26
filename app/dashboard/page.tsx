'use client';

/**
 * ساس — Dashboard Home
 * المحادثة ٣: لوحة التحكم الديناميكية
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { api } from '@/lib/api';

interface DashboardStats {
  ordersToday: number;
  salesToday: number;
  totalProducts: number;
  totalCustomers: number;
}

interface RecentOrder {
  id: string;
  order_number: string;
  customer_name: string;
  total: number;
  status: string;
  created_at: string;
}

const statusMap: Record<string, { label: string; class: string }> = {
  new: { label: 'جديد', class: 'badge-info' },
  confirmed: { label: 'مؤكد', class: 'badge-brand' },
  processing: { label: 'جاري التجهيز', class: 'badge-warning' },
  shipped: { label: 'تم الشحن', class: 'badge-info' },
  delivered: { label: 'تم التوصيل', class: 'badge-success' },
  cancelled: { label: 'ملغي', class: 'badge-danger' },
};

export default function DashboardHome() {
  const { merchant, tenant } = useAuthStore();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      try {
        // Try to fetch real data — fallback to zeros if API not ready
        const [productsRes, ordersRes, customersRes] = await Promise.allSettled([
          api.get('/api/products?limit=1'),
          api.get('/api/orders?limit=5'),
          api.get('/api/customers?limit=1'),
        ]);

        const totalProducts =
          productsRes.status === 'fulfilled'
            ? productsRes.value.pagination?.total || productsRes.value.data?.length || 0
            : 0;

        const orders =
          ordersRes.status === 'fulfilled' ? ordersRes.value.data || [] : [];

        const totalCustomers =
          customersRes.status === 'fulfilled'
            ? customersRes.value.pagination?.total || customersRes.value.data?.length || 0
            : 0;

        // Calculate today's stats
        const today = new Date().toISOString().split('T')[0];
        const todayOrders = orders.filter(
          (o: any) => o.created_at?.startsWith(today)
        );

        setStats({
          ordersToday: todayOrders.length,
          salesToday: todayOrders.reduce((sum: number, o: any) => sum + (o.total || 0), 0),
          totalProducts,
          totalCustomers,
        });

        setRecentOrders(
          orders.slice(0, 5).map((o: any) => ({
            id: o.id,
            order_number: o.order_number || '-',
            customer_name: o.customer?.name || o.shipping_address?.name || 'عميل',
            total: o.total || 0,
            status: o.status || 'new',
            created_at: o.created_at,
          }))
        );
      } catch {
        setStats({ ordersToday: 0, salesToday: 0, totalProducts: 0, totalCustomers: 0 });
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const statCards = [
    {
      icon: 'shopping_bag',
      label: 'الطلبات اليوم',
      value: stats?.ordersToday ?? 0,
      format: 'number',
      color: 'text-info',
      bg: 'bg-blue-50',
      href: '/dashboard/orders',
    },
    {
      icon: 'payments',
      label: 'مبيعات اليوم',
      value: stats?.salesToday ?? 0,
      format: 'currency',
      color: 'text-success',
      bg: 'bg-green-50',
      href: '/dashboard/payments',
    },
    {
      icon: 'inventory_2',
      label: 'المنتجات',
      value: stats?.totalProducts ?? 0,
      format: 'number',
      color: 'text-brand-800',
      bg: 'bg-brand-50',
      href: '/dashboard/products',
    },
    {
      icon: 'people',
      label: 'العملاء',
      value: stats?.totalCustomers ?? 0,
      format: 'number',
      color: 'text-warning',
      bg: 'bg-amber-50',
      href: '/dashboard/customers',
    },
  ];

  const formatCurrency = (val: number) =>
    val.toLocaleString('ar-QA', {
      style: 'currency',
      currency: tenant?.currency || 'QAR',
      minimumFractionDigits: 0,
    });

  const timeAgo = (dateStr: string) => {
    const diff = Date.now() - new Date(dateStr).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'الآن';
    if (mins < 60) return `منذ ${mins} د`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `منذ ${hrs} س`;
    const days = Math.floor(hrs / 24);
    return `منذ ${days} يوم`;
  };

  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-6">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900">
          مرحباً {merchant?.name?.split(' ')[0] || ''} 👋
        </h1>
        <p className="text-sm text-grey-400 mt-1">
          إليك ملخص أداء متجرك اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {statCards.map((stat) => (
          <Link
            key={stat.label}
            href={stat.href}
            className="card p-5 hover:shadow-saas-lg transition-shadow group"
          >
            <div className="flex items-center gap-3 mb-3">
              <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                <span className={`material-icons-outlined ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-grey-900 font-tajawal">
              {loading ? (
                <div className="h-7 w-16 bg-grey-100 rounded animate-pulse" />
              ) : stat.format === 'currency' ? (
                formatCurrency(stat.value as number)
              ) : (
                stat.value.toLocaleString('ar-QA')
              )}
            </div>
            <div className="text-xs text-grey-400 mt-1 flex items-center justify-between">
              {stat.label}
              <span className="material-icons-outlined text-sm text-grey-300 group-hover:text-brand-800 transition-colors rotate-180">
                arrow_forward
              </span>
            </div>
          </Link>
        ))}
      </div>

      {/* Two columns */}
      <div className="grid lg:grid-cols-3 gap-6">
        {/* Quick Actions */}
        <div className="card p-5">
          <h2 className="font-tajawal text-base font-bold text-grey-900 mb-4">
            إجراءات سريعة
          </h2>
          <div className="space-y-2">
            {[
              { icon: 'add_circle', label: 'إضافة منتج', href: '/dashboard/products/new', color: 'text-brand-800' },
              { icon: 'category', label: 'إدارة التصنيفات', href: '/dashboard/categories', color: 'text-info' },
              { icon: 'receipt_long', label: 'عرض الطلبات', href: '/dashboard/orders', color: 'text-success' },
              { icon: 'tune', label: 'الإعدادات', href: '/dashboard/settings', color: 'text-grey-500' },
            ].map((action) => (
              <Link
                key={action.label}
                href={action.href}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-grey-50 transition-colors group"
              >
                <div className="w-9 h-9 rounded-lg bg-grey-50 flex items-center justify-center group-hover:bg-white transition-colors">
                  <span className={`material-icons-outlined text-lg ${action.color}`}>
                    {action.icon}
                  </span>
                </div>
                <span className="text-sm font-medium text-grey-700">{action.label}</span>
                <span className="material-icons-outlined text-sm text-grey-300 mr-auto rotate-180">
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Orders */}
        <div className="lg:col-span-2 card p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">
              آخر الطلبات
            </h2>
            <Link
              href="/dashboard/orders"
              className="text-xs text-brand-800 font-semibold hover:underline"
            >
              عرض الكل
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-14 bg-grey-50 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : recentOrders.length === 0 ? (
            <div className="text-center py-12 text-grey-300">
              <span className="material-icons-outlined text-4xl mb-2 block">inbox</span>
              <p className="text-sm">لا توجد طلبات بعد</p>
              <p className="text-xs text-grey-300 mt-1">
                ستظهر الطلبات هنا عندما يبدأ العملاء بالشراء
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {recentOrders.map((order) => {
                const st = statusMap[order.status] || statusMap.new;
                return (
                  <Link
                    key={order.id}
                    href={`/dashboard/orders/${order.id}`}
                    className="flex items-center gap-4 p-3 rounded-lg hover:bg-grey-50 transition-colors"
                  >
                    <div className="w-9 h-9 rounded-full bg-grey-100 flex items-center justify-center text-xs font-bold text-grey-600">
                      {order.customer_name?.charAt(0) || '#'}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-grey-800">
                          #{order.order_number}
                        </span>
                        <span className={`badge text-[0.6rem] ${st.class}`}>{st.label}</span>
                      </div>
                      <p className="text-xs text-grey-400 truncate">{order.customer_name}</p>
                    </div>
                    <div className="text-left flex-shrink-0">
                      <p className="text-sm font-bold text-grey-800">
                        {formatCurrency(order.total)}
                      </p>
                      <p className="text-[0.6rem] text-grey-400">{timeAgo(order.created_at)}</p>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
