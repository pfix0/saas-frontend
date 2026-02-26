'use client';

/**
 * ساس — Edit Product
 * المحادثة ٣
 */

import { useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { useProductsStore } from '@/stores/products';
import ProductForm from '@/components/dashboard/ProductForm';

export default function EditProductPage() {
  const params = useParams();
  const id = params.id as string;
  const { selectedProduct, isLoading, fetchProduct } = useProductsStore();

  useEffect(() => {
    if (id) fetchProduct(id);
  }, [id]);

  if (isLoading) {
    return (
      <div className="animate-fade-in">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 bg-grey-100 rounded-lg animate-pulse" />
          <div>
            <div className="h-6 w-48 bg-grey-100 rounded animate-pulse" />
            <div className="h-4 w-32 bg-grey-50 rounded animate-pulse mt-2" />
          </div>
        </div>
        <div className="grid lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            <div className="card p-5 h-48 animate-pulse bg-grey-50" />
            <div className="card p-5 h-40 animate-pulse bg-grey-50" />
          </div>
          <div className="space-y-6">
            <div className="card p-5 h-52 animate-pulse bg-grey-50" />
          </div>
        </div>
      </div>
    );
  }

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
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">
            تعديل: {selectedProduct?.name || 'المنتج'}
          </h1>
          <p className="text-sm text-grey-400 mt-0.5">عدّل بيانات المنتج واحفظ التغييرات</p>
        </div>
      </div>

      <ProductForm mode="edit" product={selectedProduct} />
    </div>
  );
}
