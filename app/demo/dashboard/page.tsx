'use client';

/**
 * ساس — معاينة لوحة التحكم (Demo Dashboard)
 * يشوفها الزوار بدون تسجيل — بيانات وهمية
 */

import Link from 'next/link';

const fakeStats = [
  { icon: 'shopping_bag', label: 'الطلبات اليوم', value: '23', bg: 'bg-blue-50', color: 'text-blue-500' },
  { icon: 'payments', label: 'مبيعات اليوم', value: '٤,٢٥٠ ر.ق', bg: 'bg-green-50', color: 'text-green-500' },
  { icon: 'inventory_2', label: 'المنتجات', value: '156', bg: 'bg-purple-50', color: 'text-purple-500' },
  { icon: 'people', label: 'العملاء', value: '1,240', bg: 'bg-amber-50', color: 'text-amber-500' },
];

const fakeOrders = [
  { id: '#1042', customer: 'أحمد محمد', total: '350', status: 'new', statusLabel: 'جديد', statusColor: 'bg-blue-50 text-blue-600' },
  { id: '#1041', customer: 'فاطمة علي', total: '890', status: 'processing', statusLabel: 'قيد التجهيز', statusColor: 'bg-amber-50 text-amber-600' },
  { id: '#1040', customer: 'خالد السيد', total: '120', status: 'shipped', statusLabel: 'تم الشحن', statusColor: 'bg-purple-50 text-purple-600' },
  { id: '#1039', customer: 'نورة حسن', total: '2,100', status: 'delivered', statusLabel: 'مكتمل', statusColor: 'bg-green-50 text-green-600' },
  { id: '#1038', customer: 'سارة أحمد', total: '450', status: 'delivered', statusLabel: 'مكتمل', statusColor: 'bg-green-50 text-green-600' },
];

const fakeProducts = [
  { name: 'عطر المسك الأبيض', price: '250', stock: 34, status: 'نشط' },
  { name: 'بخور الصندل الفاخر', price: '120', stock: 8, status: 'نشط' },
  { name: 'دهن العود الكمبودي', price: '850', stock: 0, status: 'نفذ' },
  { name: 'طقم هدية فاخر', price: '450', stock: 22, status: 'نشط' },
];

const navItems = [
  { icon: 'dashboard', label: 'الرئيسية', active: true },
  { icon: 'inventory_2', label: 'المنتجات', active: false },
  { icon: 'category', label: 'التصنيفات', active: false },
  { icon: 'shopping_bag', label: 'الطلبات', active: false },
  { icon: 'people', label: 'العملاء', active: false },
  { icon: 'payments', label: 'المالية', active: false },
  { icon: 'local_shipping', label: 'الشحن', active: false },
  { icon: 'settings', label: 'الإعدادات', active: false },
];

export default function DemoDashboard() {
  return (
    <div className="min-h-screen bg-grey-50 flex">
      {/* Demo Banner */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-gradient-to-l from-brand-800 to-brand-900 shadow-lg">
        <div className="max-w-screen-xl mx-auto px-4 py-2.5 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <span className="material-icons-outlined text-white/80 text-lg">visibility</span>
            <p className="text-xs font-bold text-white">هذه معاينة تجريبية للوحة التحكم — البيانات وهمية</p>
          </div>
          <div className="flex items-center gap-2">
            <a href="/store/demo-store" target="_blank"
              className="text-[0.65rem] text-white/70 hover:text-white flex items-center gap-1 transition-colors">
              <span className="material-icons-outlined text-xs">storefront</span>
              معاينة المتجر
            </a>
            <Link href="/register"
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-white text-brand-800 text-xs font-bold hover:bg-grey-50 transition-all">
              <span className="material-icons-outlined text-sm">rocket_launch</span>
              ابدأ مجاناً
            </Link>
          </div>
        </div>
      </div>

      {/* Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-l border-grey-100 fixed top-10 right-0 h-[calc(100vh-40px)]">
        <div className="h-16 flex items-center px-6 border-b border-grey-100">
          <span className="font-tajawal text-xl font-black text-brand-800">ساس</span>
          <span className="w-1 h-1 bg-brand-800 rounded-full mr-0.5" />
          <span className="text-[0.65rem] text-grey-400 mr-3 bg-grey-100 px-2 py-0.5 rounded-full">لوحة التحكم</span>
        </div>
        <div className="mx-4 mt-4 p-3 rounded-xl bg-brand-50 border border-brand-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-800 flex items-center justify-center">
              <span className="font-tajawal text-white text-xs font-black">م</span>
            </div>
            <div>
              <p className="text-xs font-bold text-brand-900">متجر التجربة</p>
              <p className="text-[0.55rem] text-brand-600">demo-store.saas.qa</p>
            </div>
          </div>
        </div>
        <nav className="flex-1 p-3 space-y-0.5 mt-2">
          {navItems.map((item) => (
            <div key={item.label}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm cursor-default ${
                item.active ? 'bg-brand-50 text-brand-800 font-semibold' : 'text-grey-400'
              }`}>
              <span className={`material-icons-outlined text-lg ${item.active ? 'text-brand-700' : 'text-grey-300'}`}>{item.icon}</span>
              {item.label}
            </div>
          ))}
        </nav>
        <div className="p-3 border-t border-grey-100">
          <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-100">
            <span className="material-icons-outlined text-brand-700 text-lg">storefront</span>
            <div className="flex-1">
              <p className="text-xs font-bold text-brand-800">عرض المتجر</p>
              <p className="text-[0.55rem] text-brand-600">demo-store.saas.qa</p>
            </div>
            <span className="material-icons-outlined text-brand-400 text-sm">open_in_new</span>
          </div>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 lg:mr-64 min-h-screen pt-10">
        {/* Topbar */}
        <header className="h-14 bg-white border-b border-grey-100 flex items-center justify-between px-6 sticky top-10 z-30">
          <div />
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl hover:bg-grey-50 relative">
              <span className="material-icons-outlined text-grey-400 text-xl">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-red-400 rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-100 flex items-center justify-center">
              <span className="font-tajawal text-brand-800 text-xs font-bold">م</span>
            </div>
          </div>
        </header>

        <main className="p-6">
          {/* Welcome */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="font-tajawal text-2xl font-bold text-grey-900">مرحباً محمد 👋</h1>
              <p className="text-sm text-grey-400 mt-1">إليك ملخص أداء متجرك اليوم</p>
            </div>
            <div className="hidden sm:flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-800 text-sm font-semibold">
              <span className="material-icons-outlined text-lg">storefront</span>
              عرض المتجر
              <span className="material-icons-outlined text-sm">open_in_new</span>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {fakeStats.map((stat) => (
              <div key={stat.label} className="bg-white rounded-2xl border border-grey-100 p-5">
                <div className={`w-10 h-10 rounded-xl ${stat.bg} flex items-center justify-center mb-3`}>
                  <span className={`material-icons-outlined text-xl ${stat.color}`}>{stat.icon}</span>
                </div>
                <div className="text-2xl font-bold text-grey-900 font-tajawal">{stat.value}</div>
                <div className="text-xs text-grey-400 mt-1">{stat.label}</div>
              </div>
            ))}
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            {/* Recent Orders */}
            <div className="lg:col-span-2 bg-white rounded-2xl border border-grey-100 p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="font-tajawal text-base font-bold text-grey-900">آخر الطلبات</h2>
                <span className="text-xs text-brand-800 font-semibold">عرض الكل ←</span>
              </div>
              <div className="space-y-3">
                {fakeOrders.map((order) => (
                  <div key={order.id} className="flex items-center gap-4 p-3 rounded-xl bg-grey-50/50 border border-grey-50">
                    <div className="w-9 h-9 rounded-lg bg-grey-100 flex items-center justify-center">
                      <span className="material-icons-outlined text-grey-400 text-sm">receipt</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grey-800">{order.customer}</p>
                      <p className="text-xs text-grey-400">{order.id}</p>
                    </div>
                    <span className={`text-[0.65rem] px-2.5 py-0.5 rounded-full font-semibold ${order.statusColor}`}>
                      {order.statusLabel}
                    </span>
                    <span className="text-sm font-bold text-grey-700">{order.total} ر.ق</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Top Products */}
            <div className="bg-white rounded-2xl border border-grey-100 p-5">
              <h2 className="font-tajawal text-base font-bold text-grey-900 mb-4">المنتجات</h2>
              <div className="space-y-3">
                {fakeProducts.map((product) => (
                  <div key={product.name} className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-grey-50 border border-grey-100 flex items-center justify-center">
                      <span className="material-icons-outlined text-grey-300 text-sm">inventory_2</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-grey-800 truncate">{product.name}</p>
                      <p className="text-xs text-grey-400">{product.price} ر.ق — مخزون: {product.stock}</p>
                    </div>
                    <span className={`text-[0.6rem] font-bold ${product.stock === 0 ? 'text-red-400' : 'text-green-500'}`}>
                      {product.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
