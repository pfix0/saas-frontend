import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'الرئيسية',
};

// Placeholder stats - will be dynamic in Session 3
const stats = [
  { icon: 'shopping_bag', label: 'الطلبات اليوم', value: '٠', color: 'text-info' },
  { icon: 'payments', label: 'مبيعات اليوم', value: '٠ ر.ق', color: 'text-success' },
  { icon: 'inventory_2', label: 'المنتجات', value: '٠', color: 'text-brand-800' },
  { icon: 'people', label: 'العملاء', value: '٠', color: 'text-warning' },
];

export default function DashboardHome() {
  return (
    <div className="animate-fade-in">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="font-tajawal text-2xl font-bold text-grey-900">
          مرحباً بك في ساس 👋
        </h1>
        <p className="text-sm text-grey-400 mt-1">
          إليك ملخص أداء متجرك اليوم
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="card p-5">
            <div className="flex items-center gap-3 mb-3">
              <div className="w-10 h-10 rounded-lg bg-grey-50 flex items-center justify-center">
                <span className={`material-icons-outlined ${stat.color}`}>
                  {stat.icon}
                </span>
              </div>
            </div>
            <div className="text-2xl font-bold text-grey-900 font-tajawal">
              {stat.value}
            </div>
            <div className="text-xs text-grey-400 mt-1">
              {stat.label}
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="card p-6 mb-8">
        <h2 className="font-tajawal text-lg font-bold text-grey-900 mb-4">
          إجراءات سريعة
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            { icon: 'add_circle', label: 'إضافة منتج', href: '/dashboard/products/new' },
            { icon: 'receipt_long', label: 'عرض الطلبات', href: '/dashboard/orders' },
            { icon: 'palette', label: 'تصميم المتجر', href: '/dashboard/settings/design' },
            { icon: 'tune', label: 'الإعدادات', href: '/dashboard/settings/store' },
          ].map((action) => (
            <a
              key={action.label}
              href={action.href}
              className="flex flex-col items-center gap-2 p-4 rounded-lg bg-grey-50 hover:bg-brand-50 hover:text-brand-800 transition-colors text-grey-600 group"
            >
              <span className="material-icons-outlined text-2xl group-hover:text-brand-800 transition-colors">
                {action.icon}
              </span>
              <span className="text-xs font-semibold">{action.label}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Recent Orders - Placeholder */}
      <div className="card p-6">
        <h2 className="font-tajawal text-lg font-bold text-grey-900 mb-4">
          آخر الطلبات
        </h2>
        <div className="text-center py-12 text-grey-300">
          <span className="material-icons-outlined text-5xl mb-3 block">inbox</span>
          <p className="text-sm">لا توجد طلبات بعد</p>
          <p className="text-xs text-grey-300 mt-1">ستظهر الطلبات هنا عندما يبدأ العملاء بالشراء</p>
        </div>
      </div>
    </div>
  );
}
