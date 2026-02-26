'use client';

/**
 * ساس — Sidebar Component
 * المحادثة ٣: لوحة التحكم
 */

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

const navItems = [
  { icon: 'dashboard', label: 'الرئيسية', href: '/dashboard' },
  { icon: 'inventory_2', label: 'المنتجات', href: '/dashboard/products' },
  { icon: 'category', label: 'التصنيفات', href: '/dashboard/categories' },
  { icon: 'shopping_bag', label: 'الطلبات', href: '/dashboard/orders' },
  { icon: 'people', label: 'العملاء', href: '/dashboard/customers' },
  { icon: 'payments', label: 'المالية', href: '/dashboard/payments' },
  { icon: 'local_shipping', label: 'الشحن', href: '/dashboard/shipping' },
  { icon: 'campaign', label: 'التسويق', href: '/dashboard/marketing' },
  { icon: 'rate_review', label: 'التقييمات', href: '/dashboard/reviews' },
  { icon: 'description', label: 'الصفحات', href: '/dashboard/pages' },
  { icon: 'bar_chart', label: 'التقارير', href: '/dashboard/reports' },
  { icon: 'settings', label: 'الإعدادات', href: '/dashboard/settings' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { tenant } = useAuthStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const isActive = (href: string) => {
    if (href === '/dashboard') return pathname === '/dashboard';
    return pathname.startsWith(href);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="h-16 flex items-center px-6 border-b border-grey-100 flex-shrink-0">
        <Link href="/dashboard" className="flex items-center gap-1">
          <span className="font-tajawal text-xl font-black text-brand-800">ساس</span>
          <span className="w-1 h-1 bg-brand-800 rounded-full" />
        </Link>
        <span className="text-[0.65rem] text-grey-400 mr-3 bg-grey-100 px-2 py-0.5 rounded-full">
          لوحة التحكم
        </span>
        {/* Mobile close */}
        <button
          onClick={() => setSidebarOpen(false)}
          className="lg:hidden mr-auto p-1 rounded-lg hover:bg-grey-100 transition-colors"
        >
          <span className="material-icons-outlined text-grey-400 text-lg">close</span>
        </button>
      </div>

      {/* Store badge */}
      {tenant && (
        <div className="mx-4 mt-4 mb-2 p-3 rounded-[10px] bg-brand-50 border border-brand-100">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-brand-800 text-white flex items-center justify-center text-xs font-bold flex-shrink-0">
              {tenant.name?.charAt(0) || 'م'}
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-brand-900 truncate">{tenant.name}</p>
              <p className="text-[0.65rem] text-brand-600 truncate">{tenant.slug}.saas.qa</p>
            </div>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-3 space-y-0.5">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setSidebarOpen(false)}
              className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all duration-200 group ${
                active
                  ? 'bg-brand-800 text-white shadow-saas-brand'
                  : 'text-grey-600 hover:bg-grey-50 hover:text-brand-800'
              }`}
            >
              <span
                className={`material-icons-outlined text-lg transition-colors ${
                  active ? 'text-white' : 'text-grey-400 group-hover:text-brand-800'
                }`}
              >
                {item.icon}
              </span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Store link */}
      {tenant && (
        <div className="flex-shrink-0 p-3 border-t border-grey-100">
          <a
            href={`/store/${tenant.slug}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 px-3 py-2.5 rounded-xl bg-brand-50 border border-brand-100 text-brand-800 hover:bg-brand-100 transition-all"
          >
            <span className="material-icons-outlined text-lg">storefront</span>
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold">عرض المتجر</p>
              <p className="text-[0.55rem] text-brand-600 truncate">{tenant.slug}.saas.qa</p>
            </div>
            <span className="material-icons-outlined text-sm text-brand-400">open_in_new</span>
          </a>
        </div>
      )}
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-64 bg-white border-l border-grey-100 fixed top-0 right-0 h-full z-40">
        {sidebarContent}
      </aside>

      {/* Mobile Overlay */}
      {sidebarOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/30 z-40 backdrop-blur-sm"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Mobile Sidebar */}
      <aside
        className={`lg:hidden fixed top-0 right-0 h-full w-72 bg-white z-50 flex flex-col shadow-saas-lg transform transition-transform duration-300 ease-out ${
          sidebarOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        {sidebarContent}
      </aside>
    </>
  );
}
