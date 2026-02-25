import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: {
    default: 'لوحة التحكم',
    template: '%s | لوحة التحكم — ساس',
  },
};

// Sidebar navigation items
const navItems = [
  { icon: 'dashboard', label: 'الرئيسية', href: '/dashboard' },
  { icon: 'inventory_2', label: 'المنتجات', href: '/dashboard/products' },
  { icon: 'shopping_bag', label: 'الطلبات', href: '/dashboard/orders' },
  { icon: 'people', label: 'العملاء', href: '/dashboard/customers' },
  { icon: 'payments', label: 'المالية', href: '/dashboard/payments' },
  { icon: 'local_shipping', label: 'الشحن', href: '/dashboard/shipping' },
  { icon: 'campaign', label: 'التسويق', href: '/dashboard/marketing' },
  { icon: 'bar_chart', label: 'التقارير', href: '/dashboard/reports' },
  { icon: 'settings', label: 'الإعدادات', href: '/dashboard/settings/store' },
];

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-grey-50 flex">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-l border-grey-100 fixed top-0 right-0 h-full z-40 hidden lg:block">
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-grey-100">
          <span className="font-tajawal text-xl font-black text-brand-800">ساس</span>
          <span className="w-1 h-1 bg-brand-800 rounded-full mr-0.5" />
          <span className="text-xs text-grey-400 mr-3">لوحة التحكم</span>
        </div>

        {/* Navigation */}
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className="flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium text-grey-600 hover:bg-grey-50 hover:text-brand-800 transition-colors group"
            >
              <span className="material-icons-outlined text-lg text-grey-400 group-hover:text-brand-800 transition-colors">
                {item.icon}
              </span>
              {item.label}
            </a>
          ))}
        </nav>

        {/* Store link */}
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-grey-100">
          <a
            href="#"
            className="flex items-center gap-2 text-xs text-grey-400 hover:text-brand-800 transition-colors"
          >
            <span className="material-icons-outlined text-sm">open_in_new</span>
            زيارة المتجر
          </a>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:mr-64">
        {/* Top Bar */}
        <header className="h-16 bg-white border-b border-grey-100 flex items-center justify-between px-6 sticky top-0 z-30">
          {/* Mobile menu button */}
          <button className="lg:hidden">
            <span className="material-icons-outlined text-grey-600">menu</span>
          </button>

          {/* Search */}
          <div className="flex-1 max-w-md mx-4">
            <div className="relative">
              <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg">
                search
              </span>
              <input
                type="text"
                placeholder="بحث..."
                className="w-full pr-10 pl-4 py-2 rounded-lg bg-grey-50 border border-transparent text-sm focus:border-brand-800 focus:bg-white transition-all outline-none"
              />
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="relative p-2 rounded-lg hover:bg-grey-50 transition-colors">
              <span className="material-icons-outlined text-grey-500">notifications</span>
              <span className="absolute top-1 right-1 w-2 h-2 bg-danger rounded-full" />
            </button>
            <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center text-sm font-bold">
              م
            </div>
          </div>
        </header>

        {/* Page Content */}
        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
