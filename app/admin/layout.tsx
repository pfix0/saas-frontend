'use client';

/**
 * ساس — Platform Admin Layout
 * تصميم داكن لتمييزه عن لوحة التاجر
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore } from '@/stores/admin';

const navItems = [
  { icon: 'speed', label: 'نظرة عامة', href: '/admin' },
  { icon: 'store', label: 'المتاجر', href: '/admin/tenants' },
  { icon: 'group', label: 'التجار', href: '/admin/merchants' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isAuthenticated, isLoading, fetchProfile, logout } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Skip layout for login page
  if (pathname === '/admin/login') {
    return <>{children}</>;
  }

  useEffect(() => {
    fetchProfile();
  }, []);

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoading, isAuthenticated]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-900 flex items-center justify-center">
        <div className="text-center">
          <span className="material-icons-outlined text-brand-500 text-4xl animate-spin">progress_activity</span>
          <p className="text-grey-500 text-sm mt-3">جاري التحميل...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) return null;

  const isActive = (href: string) => {
    if (href === '/admin') return pathname === '/admin';
    return pathname.startsWith(href);
  };

  const handleLogout = () => {
    logout();
    router.push('/admin/login');
  };

  return (
    <div className="min-h-screen bg-grey-900 flex">
      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex lg:flex-col w-60 bg-grey-800/50 border-l border-grey-700/50 fixed top-0 right-0 h-full z-40">
        {/* Logo */}
        <div className="h-16 flex items-center px-5 border-b border-grey-700/50">
          <Link href="/admin" className="flex items-center gap-1.5">
            <span className="font-tajawal text-lg font-black text-white">ساس</span>
            <span className="w-1 h-1 bg-brand-500 rounded-full" />
          </Link>
          <span className="text-[0.6rem] text-brand-400 mr-2 bg-brand-500/10 px-2 py-0.5 rounded-full font-bold">
            ADMIN
          </span>
        </div>

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active
                    ? 'bg-brand-800 text-white'
                    : 'text-grey-400 hover:bg-grey-700/50 hover:text-white'
                }`}
              >
                <span className={`material-icons-outlined text-lg ${active ? 'text-white' : 'text-grey-500'}`}>
                  {item.icon}
                </span>
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Admin Info + Logout */}
        <div className="p-4 border-t border-grey-700/50">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 rounded-full bg-brand-800 flex items-center justify-center">
              <span className="material-icons-outlined text-white text-sm">shield</span>
            </div>
            <div className="min-w-0">
              <p className="text-xs font-bold text-grey-200 truncate">{admin?.name}</p>
              <p className="text-[0.6rem] text-grey-500 truncate">{admin?.email}</p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-grey-500 hover:text-red-400 hover:bg-red-500/10 transition-all"
          >
            <span className="material-icons-outlined text-sm">logout</span>
            تسجيل خروج
          </button>
        </div>
      </aside>

      {/* Mobile Overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
      )}

      {/* Mobile Sidebar */}
      <aside className={`lg:hidden fixed top-0 right-0 h-full w-64 bg-grey-800 z-50 transform transition-transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="h-16 flex items-center justify-between px-5 border-b border-grey-700/50">
          <span className="font-tajawal text-lg font-black text-white">ساس</span>
          <button onClick={() => setMobileOpen(false)} className="text-grey-500">
            <span className="material-icons-outlined">close</span>
          </button>
        </div>
        <nav className="p-3 space-y-0.5">
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className={`flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  active ? 'bg-brand-800 text-white' : 'text-grey-400 hover:bg-grey-700/50 hover:text-white'
                }`}
              >
                <span className={`material-icons-outlined text-lg ${active ? 'text-white' : 'text-grey-500'}`}>{item.icon}</span>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 lg:mr-60 min-h-screen flex flex-col">
        {/* Topbar */}
        <header className="h-14 bg-grey-800/30 border-b border-grey-700/30 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden p-2 -mr-2">
            <span className="material-icons-outlined text-grey-400">menu</span>
          </button>
          <div />
          <div className="flex items-center gap-2">
            <span className="text-[0.65rem] text-grey-600 hidden sm:block">{admin?.role === 'super_admin' ? 'مدير أعلى' : 'مدير'}</span>
            <div className="w-7 h-7 rounded-full bg-brand-800 flex items-center justify-center">
              <span className="material-icons-outlined text-white text-xs">shield</span>
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
