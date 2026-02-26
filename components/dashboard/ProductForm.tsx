'use client';

/**
 * ساس — Product Form Component
 * المحادثة ٣: نموذج إضافة/تعديل المنتج
 */

import { useState, useEffect, type FormEvent } from 'react';
import { useRouter } from 'next/navigation';
import { useProductsStore, type ProductFormData } from '@/stores/products';
import type { Product } from '@/lib/types';

interface Props {
  product?: Product | null;
  mode: 'create' | 'edit';
}

export default function ProductForm({ product, mode }: Props) {
  const router = useRouter();
  const { categories, isSaving, error, createProduct, updateProduct, fetchCategories, clearError } =
    useProductsStore();

  const [form, setForm] = useState<ProductFormData>({
    name: '',
    description: '',
    price: 0,
    sale_price: undefined,
    cost_price: undefined,
    sku: '',
    quantity: 0,
    category_id: '',
    type: 'physical',
    status: 'draft',
    is_featured: false,
    tags: [],
    weight: undefined,
  });

  const [tagInput, setTagInput] = useState('');
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchCategories();
    clearError();
  }, []);

  // Load product data for edit
  useEffect(() => {
    if (product && mode === 'edit') {
      setForm({
        name: product.name || '',
        description: product.description || '',
        price: product.price || 0,
        sale_price: product.sale_price || undefined,
        cost_price: product.cost_price || undefined,
        sku: product.sku || '',
        quantity: product.quantity || 0,
        category_id: product.category_id || '',
        type: product.type || 'physical',
        status: product.status || 'draft',
        is_featured: product.is_featured || false,
        tags: product.tags || [],
        weight: product.weight || undefined,
      });
    }
  }, [product, mode]);

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'اسم المنتج مطلوب';
    if (form.name.length < 2) errs.name = 'الاسم قصير جداً';
    if (form.price <= 0) errs.price = 'السعر يجب أن يكون أكبر من صفر';
    if (form.sale_price && form.sale_price >= form.price) errs.sale_price = 'سعر الخصم يجب أن يكون أقل من السعر';
    if (form.quantity < 0) errs.quantity = 'الكمية لا يمكن أن تكون سالبة';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    if (mode === 'create') {
      const result = await createProduct(form);
      if (result) router.push('/dashboard/products');
    } else if (product) {
      const ok = await updateProduct(product.id, form);
      if (ok) router.push('/dashboard/products');
    }
  };

  const addTag = () => {
    const tag = tagInput.trim();
    if (tag && !form.tags.includes(tag)) {
      setForm({ ...form, tags: [...form.tags, tag] });
      setTagInput('');
    }
  };

  const removeTag = (tag: string) => {
    setForm({ ...form, tags: form.tags.filter((t) => t !== tag) });
  };

  const set = (key: keyof ProductFormData, value: any) => {
    setForm({ ...form, [key]: value });
    if (errors[key]) setErrors({ ...errors, [key]: '' });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* API Error */}
      {error && (
        <div className="p-3 rounded-lg bg-red-50 text-danger text-sm flex items-center gap-2">
          <span className="material-icons-outlined text-lg">error</span>
          {error}
        </div>
      )}

      <div className="grid lg:grid-cols-3 gap-6">
        {/* ═══ Main Info (2 cols) ═══ */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Info */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">معلومات أساسية</h2>

            {/* Name */}
            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                اسم المنتج <span className="text-danger">*</span>
              </label>
              <input
                type="text"
                value={form.name}
                onChange={(e) => set('name', e.target.value)}
                placeholder="مثال: عطر العود الملكي"
                className={`input ${errors.name ? 'input-error' : ''}`}
              />
              {errors.name && <p className="text-xs text-danger mt-1">{errors.name}</p>}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-1.5">الوصف</label>
              <textarea
                value={form.description}
                onChange={(e) => set('description', e.target.value)}
                rows={4}
                placeholder="وصف تفصيلي للمنتج..."
                className="input resize-none"
              />
            </div>
          </div>

          {/* Pricing */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">التسعير</h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Price */}
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                  السعر (ر.ق) <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.price || ''}
                  onChange={(e) => set('price', parseFloat(e.target.value) || 0)}
                  placeholder="0.00"
                  dir="ltr"
                  className={`input text-left ${errors.price ? 'input-error' : ''}`}
                />
                {errors.price && <p className="text-xs text-danger mt-1">{errors.price}</p>}
              </div>

              {/* Sale Price */}
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                  سعر الخصم
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.sale_price || ''}
                  onChange={(e) => set('sale_price', parseFloat(e.target.value) || undefined)}
                  placeholder="اختياري"
                  dir="ltr"
                  className={`input text-left ${errors.sale_price ? 'input-error' : ''}`}
                />
                {errors.sale_price && <p className="text-xs text-danger mt-1">{errors.sale_price}</p>}
              </div>

              {/* Cost Price */}
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                  سعر التكلفة
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.cost_price || ''}
                  onChange={(e) => set('cost_price', parseFloat(e.target.value) || undefined)}
                  placeholder="اختياري"
                  dir="ltr"
                  className="input text-left"
                />
              </div>
            </div>

            {/* Profit Preview */}
            {form.price > 0 && form.cost_price && form.cost_price > 0 && (
              <div className="p-3 rounded-lg bg-green-50 border border-green-100 flex items-center gap-2">
                <span className="material-icons-outlined text-success text-lg">trending_up</span>
                <span className="text-sm text-success font-semibold">
                  هامش الربح: {((1 - form.cost_price / form.price) * 100).toFixed(0)}% ({(form.price - form.cost_price).toFixed(2)} ر.ق)
                </span>
              </div>
            )}
          </div>

          {/* Inventory */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">المخزون</h2>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">
                  الكمية <span className="text-danger">*</span>
                </label>
                <input
                  type="number"
                  min="0"
                  value={form.quantity}
                  onChange={(e) => set('quantity', parseInt(e.target.value) || 0)}
                  dir="ltr"
                  className={`input text-left ${errors.quantity ? 'input-error' : ''}`}
                />
                {errors.quantity && <p className="text-xs text-danger mt-1">{errors.quantity}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">SKU</label>
                <input
                  type="text"
                  value={form.sku}
                  onChange={(e) => set('sku', e.target.value)}
                  placeholder="اختياري"
                  dir="ltr"
                  className="input text-left font-mono"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-grey-700 mb-1.5">الوزن (كجم)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={form.weight || ''}
                  onChange={(e) => set('weight', parseFloat(e.target.value) || undefined)}
                  placeholder="اختياري"
                  dir="ltr"
                  className="input text-left"
                />
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">الوسوم</h2>
            <div className="flex gap-2">
              <input
                type="text"
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') { e.preventDefault(); addTag(); }
                }}
                placeholder="أضف وسم واضغط Enter"
                className="input flex-1"
              />
              <button type="button" onClick={addTag} className="btn-ghost px-4">
                إضافة
              </button>
            </div>
            {form.tags.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {form.tags.map((tag) => (
                  <span key={tag} className="badge badge-brand gap-1 pr-1">
                    {tag}
                    <button
                      type="button"
                      onClick={() => removeTag(tag)}
                      className="hover:text-danger transition-colors"
                    >
                      <span className="material-icons-outlined text-xs">close</span>
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ═══ Sidebar (1 col) ═══ */}
        <div className="space-y-6">
          {/* Status */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">النشر</h2>

            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-1.5">الحالة</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="input"
              >
                <option value="draft">مسودة</option>
                <option value="active">نشط (مرئي)</option>
                <option value="archived">مؤرشف</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-grey-700 mb-1.5">النوع</label>
              <select
                value={form.type}
                onChange={(e) => set('type', e.target.value)}
                className="input"
              >
                <option value="physical">منتج مادي</option>
                <option value="digital">منتج رقمي</option>
              </select>
            </div>

            {/* Featured */}
            <label className="flex items-center gap-3 cursor-pointer p-3 rounded-lg hover:bg-grey-50 transition-colors -mx-1">
              <input
                type="checkbox"
                checked={form.is_featured}
                onChange={(e) => set('is_featured', e.target.checked)}
                className="w-4 h-4 accent-brand-800"
              />
              <div>
                <span className="text-sm font-semibold text-grey-700">منتج مميز</span>
                <p className="text-xs text-grey-400">يظهر في الصفحة الرئيسية</p>
              </div>
            </label>
          </div>

          {/* Category */}
          <div className="card p-5 space-y-4">
            <h2 className="font-tajawal text-base font-bold text-grey-900">التصنيف</h2>
            <select
              value={form.category_id}
              onChange={(e) => set('category_id', e.target.value)}
              className="input"
            >
              <option value="">بدون تصنيف</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button
              type="button"
              onClick={() => router.push('/dashboard/categories')}
              className="text-xs text-brand-800 font-semibold hover:underline flex items-center gap-1"
            >
              <span className="material-icons-outlined text-sm">add</span>
              إدارة التصنيفات
            </button>
          </div>

          {/* Actions */}
          <div className="card p-5 space-y-3">
            <button
              type="submit"
              disabled={isSaving}
              className="btn-brand w-full"
            >
              {isSaving ? (
                <>
                  <span className="material-icons-outlined animate-spin text-lg">progress_activity</span>
                  جاري الحفظ...
                </>
              ) : mode === 'create' ? (
                <>
                  <span className="material-icons-outlined text-lg">add</span>
                  إضافة المنتج
                </>
              ) : (
                <>
                  <span className="material-icons-outlined text-lg">save</span>
                  حفظ التعديلات
                </>
              )}
            </button>

            <button
              type="button"
              onClick={() => router.push('/dashboard/products')}
              className="btn-ghost w-full"
            >
              إلغاء
            </button>
          </div>
        </div>
      </div>
    </form>
  );
}
