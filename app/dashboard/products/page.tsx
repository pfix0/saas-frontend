import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'المنتجات',
};

export default function ProductsPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">المنتجات</h1>
          <p className="text-sm text-grey-400 mt-1">إدارة منتجات متجرك</p>
        </div>
        <Link href="/dashboard/products/new" className="btn-brand">
          <span className="material-icons-outlined text-lg">add</span>
          إضافة منتج
        </Link>
      </div>

      {/* Empty State - will be replaced with data table in Session 3 */}
      <div className="card">
        <div className="text-center py-20">
          <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">
            inventory_2
          </span>
          <h3 className="font-tajawal text-lg font-bold text-grey-700 mb-2">
            لا توجد منتجات بعد
          </h3>
          <p className="text-sm text-grey-400 mb-6">
            أضف أول منتج لمتجرك لتبدأ البيع
          </p>
          <Link href="/dashboard/products/new" className="btn-brand">
            <span className="material-icons-outlined text-lg">add</span>
            إضافة أول منتج
          </Link>
        </div>
      </div>
    </div>
  );
}
