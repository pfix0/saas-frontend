'use client';

/**
 * ساس — Categories Management
 * المحادثة ٣
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useProductsStore } from '@/stores/products';

export default function CategoriesPage() {
  const {
    categories, isSaving, error,
    fetchCategories, createCategory, updateCategory, deleteCategory, clearError,
  } = useProductsStore();

  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editId, setEditId] = useState<string | null>(null);
  const [editName, setEditName] = useState('');
  const [editDesc, setEditDesc] = useState('');
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    fetchCategories();
    clearError();
  }, []);

  const handleCreate = async () => {
    if (!newName.trim()) return;
    const result = await createCategory(newName.trim(), newDesc.trim() || undefined);
    if (result) {
      setNewName('');
      setNewDesc('');
      setShowAdd(false);
    }
  };

  const handleUpdate = async () => {
    if (!editId || !editName.trim()) return;
    const ok = await updateCategory(editId, editName.trim(), editDesc.trim() || undefined);
    if (ok) setEditId(null);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    const ok = await deleteCategory(deleteId);
    if (ok) setDeleteId(null);
  };

  const startEdit = (cat: any) => {
    setEditId(cat.id);
    setEditName(cat.name);
    setEditDesc(cat.description || '');
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <Link
            href="/dashboard/products"
            className="p-2 rounded-lg hover:bg-grey-100 transition-colors"
          >
            <span className="material-icons-outlined text-grey-500">arrow_forward</span>
          </Link>
          <div>
            <h1 className="font-tajawal text-2xl font-bold text-grey-900">التصنيفات</h1>
            <p className="text-sm text-grey-400 mt-1">
              {categories.length > 0 ? `${categories.length} تصنيف` : 'نظّم منتجاتك في تصنيفات'}
            </p>
          </div>
        </div>
        <button onClick={() => setShowAdd(true)} className="btn-brand">
          <span className="material-icons-outlined text-lg">add</span>
          إضافة تصنيف
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-50 text-danger text-sm flex items-center gap-2">
          <span className="material-icons-outlined text-lg">error</span>
          {error}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="card p-5 mb-4 animate-fade-in border-2 border-brand-100">
          <h3 className="font-tajawal text-sm font-bold text-grey-900 mb-3">تصنيف جديد</h3>
          <div className="space-y-3">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="اسم التصنيف (مثال: عطور)"
              className="input"
              autoFocus
              onKeyDown={(e) => { if (e.key === 'Enter') handleCreate(); }}
            />
            <input
              type="text"
              value={newDesc}
              onChange={(e) => setNewDesc(e.target.value)}
              placeholder="وصف قصير (اختياري)"
              className="input"
            />
            <div className="flex gap-2 justify-end">
              <button
                onClick={() => { setShowAdd(false); setNewName(''); setNewDesc(''); }}
                className="btn-ghost text-sm"
              >
                إلغاء
              </button>
              <button
                onClick={handleCreate}
                disabled={isSaving || !newName.trim()}
                className="btn-brand text-sm"
              >
                {isSaving ? 'جاري الحفظ...' : 'إضافة'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Categories List */}
      <div className="card overflow-hidden">
        {categories.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">
              category
            </span>
            <h3 className="font-tajawal text-lg font-bold text-grey-700 mb-2">
              لا توجد تصنيفات بعد
            </h3>
            <p className="text-sm text-grey-400 mb-6">
              أضف تصنيفات لتنظيم منتجاتك
            </p>
            <button onClick={() => setShowAdd(true)} className="btn-brand">
              <span className="material-icons-outlined text-lg">add</span>
              إضافة أول تصنيف
            </button>
          </div>
        ) : (
          <div className="divide-y divide-grey-100">
            {categories.map((cat) => (
              <div key={cat.id} className="p-4 hover:bg-grey-50/50 transition-colors group">
                {editId === cat.id ? (
                  /* Edit mode */
                  <div className="space-y-3 animate-fade-in">
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className="input"
                      autoFocus
                      onKeyDown={(e) => { if (e.key === 'Enter') handleUpdate(); }}
                    />
                    <input
                      type="text"
                      value={editDesc}
                      onChange={(e) => setEditDesc(e.target.value)}
                      placeholder="وصف قصير (اختياري)"
                      className="input"
                    />
                    <div className="flex gap-2 justify-end">
                      <button onClick={() => setEditId(null)} className="btn-ghost text-sm">
                        إلغاء
                      </button>
                      <button
                        onClick={handleUpdate}
                        disabled={isSaving || !editName.trim()}
                        className="btn-brand text-sm"
                      >
                        {isSaving ? 'جاري الحفظ...' : 'حفظ'}
                      </button>
                    </div>
                  </div>
                ) : (
                  /* View mode */
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 rounded-lg bg-brand-50 flex items-center justify-center flex-shrink-0">
                      <span className="material-icons-outlined text-brand-800 text-lg">category</span>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-grey-800">{cat.name}</p>
                      {cat.description && (
                        <p className="text-xs text-grey-400 truncate">{cat.description}</p>
                      )}
                    </div>
                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() => startEdit(cat)}
                        className="p-1.5 rounded-lg hover:bg-grey-100 transition-colors"
                        title="تعديل"
                      >
                        <span className="material-icons-outlined text-grey-400 text-lg">edit</span>
                      </button>
                      <button
                        onClick={() => setDeleteId(cat.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="حذف"
                      >
                        <span className="material-icons-outlined text-grey-400 hover:text-danger text-lg">
                          delete
                        </span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Delete Confirmation */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/30 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-saas p-6 w-full max-w-sm shadow-saas-lg animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-50 mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons-outlined text-danger text-2xl">delete_forever</span>
            </div>
            <h3 className="font-tajawal text-lg font-bold text-grey-900 text-center mb-2">
              حذف التصنيف؟
            </h3>
            <p className="text-sm text-grey-400 text-center mb-6">
              سيتم حذف التصنيف نهائياً. المنتجات المرتبطة ستبقى بدون تصنيف.
            </p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="btn-ghost flex-1">
                إلغاء
              </button>
              <button onClick={handleDelete} className="btn-danger flex-1">
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
