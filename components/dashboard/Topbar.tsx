'use client';

/**
 * ساس — Topbar Component
 * المحادثة ٣: لوحة التحكم
 */

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/auth';
import { useUIStore } from '@/stores/ui';

export default function Topbar() {
  const router = useRouter();
  const { merchant, tenant, logout } = useAuthStore();
  const { setSidebarOpen } = useUIStore();
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  // Close menu on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const handleLogout = () => {
    logout();
    router.push('/login');
  };

  const initials = merchant?.name
    ? merchant.name
        .split(' ')
        .map((w) => w[0])
        .slice(0, 2)
        .join('')
    : 'م';

  return (
    <header className="h-16 bg-white border-b border-grey-100 flex items-center justify-between px-4 lg:px-6 sticky top-0 z-30">
      {/* Right side */}
      <div className="flex items-center gap-3">
        {/* Mobile menu */}
        <button
          onClick={() => setSidebarOpen(true)}
          className="lg:hidden p-2 -mr-2 rounded-lg hover:bg-grey-50 transition-colors"
        >
          <span className="material-icons-outlined text-grey-600">menu</span>
        </button>

        {/* Search */}
        <div className="hidden sm:block flex-1 max-w-md">
          <div className="relative">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg">
              search
            </span>
            <input
              type="text"
              placeholder="بحث في المنتجات، الطلبات..."
              className="w-full pr-10 pl-4 py-2 rounded-lg bg-grey-50 border border-transparent text-sm focus:border-brand-800 focus:bg-white transition-all outline-none"
            />
          </div>
        </div>
      </div>

      {/* Left side */}
      <div className="flex items-center gap-2">
        {/* Mobile search */}
        <button className="sm:hidden p-2 rounded-lg hover:bg-grey-50 transition-colors">
          <span className="material-icons-outlined text-grey-500 text-xl">search</span>
        </button>

        {/* Notifications */}
        <button className="relative p-2 rounded-lg hover:bg-grey-50 transition-colors">
          <span className="material-icons-outlined text-grey-500 text-xl">notifications</span>
          <span className="absolute top-1.5 left-1.5 w-2 h-2 bg-danger rounded-full ring-2 ring-white" />
        </button>

        {/* Divider */}
        <div className="w-px h-8 bg-grey-100 mx-1 hidden sm:block" />

        {/* User Menu */}
        <div ref={menuRef} className="relative">
          <button
            onClick={() => setUserMenuOpen(!userMenuOpen)}
            className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-grey-50 transition-colors"
          >
            <div className="w-8 h-8 rounded-full bg-brand-800 text-white flex items-center justify-center text-xs font-bold">
              {initials}
            </div>
            <div className="hidden md:block text-right">
              <p className="text-xs font-semibold text-grey-800 leading-none">
                {merchant?.name || 'التاجر'}
              </p>
              <p className="text-[0.6rem] text-grey-400 mt-0.5 leading-none">
                {tenant?.name || 'المتجر'}
              </p>
            </div>
            <span className="material-icons-outlined text-grey-400 text-sm hidden md:block">
              expand_more
            </span>
          </button>

          {/* Dropdown */}
          {userMenuOpen && (
            <div className="absolute left-0 top-full mt-2 w-56 bg-white rounded-saas border border-grey-200 shadow-saas-lg overflow-hidden animate-fade-in z-50">
              {/* User info */}
              <div className="p-3 border-b border-grey-100">
                <p className="text-sm font-bold text-grey-800">{merchant?.name}</p>
                <p className="text-xs text-grey-400 mt-0.5">{merchant?.email}</p>
                <span className="inline-block mt-1.5 text-[0.6rem] font-semibold px-2 py-0.5 rounded-full bg-brand-50 text-brand-800">
                  {merchant?.role === 'owner' ? 'مالك المتجر' : merchant?.role === 'admin' ? 'مدير' : 'موظف'}
                </span>
              </div>

              {/* Menu Items */}
              <div className="py-1">
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-grey-600 hover:bg-grey-50 transition-colors"
                >
                  <span className="material-icons-outlined text-grey-400 text-lg">settings</span>
                  إعدادات المتجر
                </button>
                <button
                  onClick={() => {
                    setUserMenuOpen(false);
                    router.push('/dashboard/settings');
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-grey-600 hover:bg-grey-50 transition-colors"
                >
                  <span className="material-icons-outlined text-grey-400 text-lg">person</span>
                  حسابي
                </button>
              </div>

              {/* Logout */}
              <div className="border-t border-grey-100 py-1">
                <button
                  onClick={handleLogout}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-danger hover:bg-red-50 transition-colors"
                >
                  <span className="material-icons-outlined text-lg">logout</span>
                  تسجيل خروج
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
