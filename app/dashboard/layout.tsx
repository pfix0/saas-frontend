import type { Metadata } from 'next';
import Sidebar from '@/components/dashboard/Sidebar';
import Topbar from '@/components/dashboard/Topbar';
import ImpersonationBanner from '@/components/dashboard/ImpersonationBanner';

export const metadata: Metadata = {
  title: {
    default: 'لوحة التحكم',
    template: '%s | لوحة التحكم — ساس',
  },
};

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <ImpersonationBanner />
      <div className="min-h-screen bg-grey-50 flex">
        <Sidebar />

      {/* Main Content */}
      <div className="flex-1 lg:mr-64 min-h-screen flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 lg:p-6">{children}</main>
      </div>
    </div>
    </>
  );
}
