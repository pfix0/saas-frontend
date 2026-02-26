'use client';

/**
 * ساس — Platform Admin Layout
 * تصميم داكن + تنقل حسب الدور
 */

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { useAdminStore, ROLE_CONFIG } from '@/stores/admin';

const allNavItems = [
  { id: 'overview',  icon: 'speed',               label: 'نظرة عامة',   href: '/admin' },
  { id: 'tenants',   icon: 'store',               label: 'المتاجر',     href: '/admin/tenants' },
  { id: 'merchants', icon: 'group',               label: 'التجار',      href: '/admin/merchants' },
  { id: 'staff',     icon: 'shield_person',       label: 'طاقم المنصة', href: '/admin/staff' },
  { id: 'finance',   icon: 'account_balance',     label: 'المالية',     href: '/admin/finance' },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { admin, isAuthenticated, isLoading, fetchProfile, logout } = useAdminStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isLoginPage = pathname === '/admin/login';

  // ═══ Hooks ALWAYS called (before any return) ═══
  useEffect(() => {
    if (!isLoginPage) fetchProfile();
  }, [isLoginPage]);

  useEffect(() => {
    if (!isLoginPage && !isLoading && !isAuthenticated) {
      router.push('/admin/login');
    }
  }, [isLoginPage, isLoading, isAuthenticated]);

  // ═══ Now safe to do conditional returns ═══
  if (isLoginPage) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen bg-grey-900 flex items-center justify-center">
        <span className="material-icons-outlined text-brand-500 text-4xl animate-spin">progress_activity</span>
      </div>
    );
  }
  if (!isAuthenticated || !admin) return null;

  const roleCfg = ROLE_CONFIG[admin.role];
  const navItems = allNavItems.filter(item => roleCfg.nav.includes(item.id));
  const isActive = (href: string) => href === '/admin' ? pathname === '/admin' : pathname.startsWith(href);

  const handleLogout = () => { logout(); router.push('/admin/login'); };

  const sidebar = (
    <>
      {/* Logo */}
      <div className="h-14 flex items-center px-5 border-b border-grey-700/50 flex-shrink-0">
        <Link href="/admin" className="flex items-center gap-1.5">
          <span className="font-tajawal text-lg font-black text-white">ساس</span>
          <span className="w-1 h-1 bg-brand-500 rounded-full" />
        </Link>
        <span className="text-[0.55rem] text-brand-400 mr-2 bg-brand-500/10 px-2 py-0.5 rounded-full font-bold tracking-wider">
          PLATFORM
        </span>
        <button onClick={() => setMobileOpen(false)} className="lg:hidden mr-auto text-grey-500">
          <span className="material-icons-outlined text-lg">close</span>
        </button>
      </div>

      {/* Role Badge */}
      <div className="mx-3 mt-3 mb-1 p-2.5 rounded-lg bg-grey-700/30 border border-grey-700/50">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-grey-700 flex items-center justify-center">
            <span className={`material-icons-outlined text-sm ${roleCfg.color}`}>{roleCfg.icon}</span>
          </div>
          <div className="min-w-0">
            <p className="text-xs font-bold text-grey-200 truncate">{admin.name}</p>
            <p className={`text-[0.6rem] font-bold ${roleCfg.color}`}>{roleCfg.label}</p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 p-2 space-y-0.5 overflow-y-auto">
        {navItems.map((item) => {
          const active = isActive(item.href);
          return (
            <Link key={item.href} href={item.href} onClick={() => setMobileOpen(false)}
              className={`flex items-center gap-3 px-3.5 py-2 rounded-lg text-[0.8rem] font-medium transition-all ${
                active ? 'bg-brand-800 text-white' : 'text-grey-400 hover:bg-grey-700/40 hover:text-white'
              }`}>
              <span className={`material-icons-outlined text-[18px] ${active ? 'text-white' : 'text-grey-500'}`}>{item.icon}</span>
              {item.label}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="flex-shrink-0 p-3 border-t border-grey-700/50">
        <button onClick={handleLogout}
          className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs text-grey-500 hover:text-red-400 hover:bg-red-500/10 transition-all">
          <span className="material-icons-outlined text-sm">logout</span>
          تسجيل خروج
        </button>
      </div>
    </>
  );

  return (
    <div className="min-h-screen bg-grey-900 flex">
      {/* Desktop */}
      <aside className="hidden lg:flex lg:flex-col w-56 bg-grey-800/40 border-l border-grey-700/40 fixed top-0 right-0 h-full z-40">
        {sidebar}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && <div className="lg:hidden fixed inset-0 bg-black/50 z-40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />}
      <aside className={`lg:hidden fixed top-0 right-0 h-full w-60 bg-grey-800 z-50 flex flex-col shadow-lg transform transition-transform ${mobileOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        {sidebar}
      </aside>

      {/* Content */}
      <div className="flex-1 lg:mr-56 min-h-screen flex flex-col">
        <header className="h-12 bg-grey-800/20 border-b border-grey-700/20 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30 backdrop-blur-sm">
          <button onClick={() => setMobileOpen(true)} className="lg:hidden"><span className="material-icons-outlined text-grey-400">menu</span></button>
          <div />
          <div className="flex items-center gap-2">
            <span className={`text-[0.6rem] font-bold ${roleCfg.color}`}>{roleCfg.label}</span>
            <div className="w-6 h-6 rounded-full bg-grey-700 flex items-center justify-center">
              <span className={`material-icons-outlined text-xs ${roleCfg.color}`}>{roleCfg.icon}</span>
            </div>
          </div>
        </header>
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
  );
}
