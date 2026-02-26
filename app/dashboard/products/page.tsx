'use client';

/**
 * ساس — Products List Page
 * المحادثة ٣: إدارة المنتجات
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useProductsStore } from '@/stores/products';
import { useAuthStore } from '@/stores/auth';

const statusMap: Record<string, { label: string; class: string }> = {
  active: { label: 'نشط', class: 'badge-success' },
  draft: { label: 'مسودة', class: 'badge-warning' },
  archived: { label: 'مؤرشف', class: 'badge-danger' },
};

export default function ProductsPage() {
  const router = useRouter();
  const { tenant } = useAuthStore();
  const {
    products, categories, isLoading, error, total, page, totalPages,
    search, statusFilter, categoryFilter,
    fetchProducts, fetchCategories,
    setSearch, setStatusFilter, setCategoryFilter, setPage, deleteProduct,
  } = useProductsStore();

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState(search);

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, [page, statusFilter, categoryFilter]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (searchInput !== search) {
        setSearch(searchInput);
        fetchProducts();
      }
    }, 400);
    return () => clearTimeout(timer);
  }, [searchInput]);

  const handleDelete = async (id: string) => {
    const ok = await deleteProduct(id);
    if (ok) setDeleteId(null);
  };

  const formatPrice = (val: number) =>
    val.toLocaleString('ar-QA', {
      style: 'currency',
      currency: tenant?.currency || 'QAR',
      minimumFractionDigits: 0,
    });

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-grey-900">المنتجات</h1>
          <p className="text-sm text-grey-400 mt-1">
            {total > 0 ? `${total} منتج` : 'إدارة منتجات متجرك'}
          </p>
        </div>
        <Link href="/dashboard/products/new" className="btn-brand">
          <span className="material-icons-outlined text-lg">add</span>
          إضافة منتج
        </Link>
      </div>

      {/* Filters Bar */}
      <div className="card p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search */}
          <div className="flex-1 relative">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-300 text-lg">
              search
            </span>
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="بحث بالاسم أو SKU..."
              className="input pr-10"
            />
          </div>

          {/* Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => { setStatusFilter(e.target.value); fetchProducts(); }}
            className="input w-auto min-w-[140px]"
          >
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="draft">مسودة</option>
            <option value="archived">مؤرشف</option>
          </select>

          {/* Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => { setCategoryFilter(e.target.value); fetchProducts(); }}
            className="input w-auto min-w-[140px]"
          >
            <option value="">كل التصنيفات</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm flex items-center gap-2">
          <span className="material-icons-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* Table */}
      <div className="card overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-4">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-grey-50 rounded-lg animate-pulse" />
            ))}
          </div>
        ) : products.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">
              inventory_2
            </span>
            <h3 className="font-tajawal text-lg font-bold text-grey-700 mb-2">
              {search || statusFilter || categoryFilter
                ? 'لا توجد نتائج'
                : 'لا توجد منتجات بعد'}
            </h3>
            <p className="text-sm text-grey-400 mb-6">
              {search || statusFilter || categoryFilter
                ? 'جرّب تغيير معايير البحث'
                : 'أضف أول منتج لمتجرك لتبدأ البيع'}
            </p>
            {!search && !statusFilter && !categoryFilter && (
              <Link href="/dashboard/products/new" className="btn-brand">
                <span className="material-icons-outlined text-lg">add</span>
                إضافة أول منتج
              </Link>
            )}
          </div>
        ) : (
          <>
            {/* Desktop Table */}
            <div className="hidden md:block overflow-x-auto">
              <table className="table-saas">
                <thead>
                  <tr>
                    <th className="w-[50%]">المنتج</th>
                    <th>السعر</th>
                    <th>المخزون</th>
                    <th>الحالة</th>
                    <th className="w-10"></th>
                  </tr>
                </thead>
                <tbody>
                  {products.map((product) => {
                    const st = statusMap[product.status] || statusMap.draft;
                    return (
                      <tr key={product.id} className="group">
                        <td>
                          <div className="flex items-center gap-3">
                            <div className="w-12 h-12 rounded-lg bg-grey-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {product.images?.[0]?.url ? (
                                <img
                                  src={product.images[0].url}
                                  alt={product.name}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <span className="material-icons-outlined text-grey-300">
                                  image
                                </span>
                              )}
                            </div>
                            <div className="min-w-0">
                              <Link
                                href={`/dashboard/products/${product.id}/edit`}
                                className="text-sm font-semibold text-grey-800 hover:text-brand-800 transition-colors truncate block"
                              >
                                {product.name}
                              </Link>
                              <p className="text-xs text-grey-400 truncate">
                                {product.sku && <span className="font-mono">{product.sku} · </span>}
                                {product.category?.name || 'بدون تصنيف'}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td>
                          <div>
                            <span className="text-sm font-semibold text-grey-800">
                              {formatPrice(product.price)}
                            </span>
                            {product.sale_price && product.sale_price < product.price && (
                              <span className="text-xs text-grey-400 line-through mr-1">
                                {formatPrice(product.sale_price)}
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <span
                            className={`text-sm font-semibold ${
                              product.quantity <= 0
                                ? 'text-danger'
                                : product.quantity <= 5
                                ? 'text-warning'
                                : 'text-grey-700'
                            }`}
                          >
                            {product.quantity}
                          </span>
                        </td>
                        <td>
                          <span className={`badge ${st.class}`}>{st.label}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => router.push(`/dashboard/products/${product.id}/edit`)}
                              className="p-1.5 rounded-lg hover:bg-grey-100 transition-colors"
                              title="تعديل"
                            >
                              <span className="material-icons-outlined text-grey-400 text-lg">edit</span>
                            </button>
                            <button
                              onClick={() => setDeleteId(product.id)}
                              className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="حذف"
                            >
                              <span className="material-icons-outlined text-grey-400 hover:text-danger text-lg">
                                delete
                              </span>
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            {/* Mobile Cards */}
            <div className="md:hidden divide-y divide-grey-100">
              {products.map((product) => {
                const st = statusMap[product.status] || statusMap.draft;
                return (
                  <Link
                    key={product.id}
                    href={`/dashboard/products/${product.id}/edit`}
                    className="flex items-center gap-3 p-4 hover:bg-grey-50 transition-colors"
                  >
                    <div className="w-14 h-14 rounded-lg bg-grey-100 flex items-center justify-center flex-shrink-0">
                      {product.images?.[0]?.url ? (
                        <img src={product.images[0].url} alt="" className="w-full h-full object-cover rounded-lg" />
                      ) : (
                        <span className="material-icons-outlined text-grey-300">image</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grey-800 truncate">{product.name}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-bold text-brand-800">{formatPrice(product.price)}</span>
                        <span className={`badge text-[0.6rem] ${st.class}`}>{st.label}</span>
                      </div>
                    </div>
                    <span className="material-icons-outlined text-grey-300 text-sm rotate-180">arrow_forward</span>
                  </Link>
                );
              })}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between p-4 border-t border-grey-100">
                <p className="text-xs text-grey-400">
                  صفحة {page} من {totalPages} ({total} منتج)
                </p>
                <div className="flex gap-1">
                  <button
                    disabled={page <= 1}
                    onClick={() => { setPage(page - 1); fetchProducts(); }}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    السابق
                  </button>
                  <button
                    disabled={page >= totalPages}
                    onClick={() => { setPage(page + 1); fetchProducts(); }}
                    className="btn-ghost text-xs px-3 py-1.5"
                  >
                    التالي
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete Confirmation Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-saas p-6 w-full max-w-sm shadow-saas-lg animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons-outlined text-danger text-2xl">delete_forever</span>
            </div>
            <h3 className="font-tajawal text-lg font-bold text-grey-900 text-center mb-2">
              حذف المنتج؟
            </h3>
            <p className="text-sm text-grey-400 text-center mb-6">
              هذا الإجراء لا يمكن التراجع عنه. سيتم حذف المنتج نهائياً.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setDeleteId(null)}
                className="btn-ghost flex-1"
              >
                إلغاء
              </button>
              <button
                onClick={() => handleDelete(deleteId)}
                className="btn-danger flex-1"
              >
                <span className="material-icons-outlined text-lg">delete</span>
                حذف
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
