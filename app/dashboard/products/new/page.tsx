'use client';

/**
 * ساس — Add New Product
 * المحادثة ٣
 */

import Link from 'next/link';
import ProductForm from '@/components/dashboard/ProductForm';

export default function NewProductPage() {
  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <Link
          href="/dashboard/products"
          className="p-2 rounded-lg hover:bg-grey-100 transition-colors"
        >
          <span className="material-icons-outlined text-grey-500">arrow_forward</span>
        </Link>
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">إضافة منتج جديد</h1>
          <p className="text-sm text-grey-400 mt-0.5">أدخل بيانات المنتج وانشره في متجرك</p>
        </div>
      </div>

      <ProductForm mode="create" />
    </div>
  );
}
