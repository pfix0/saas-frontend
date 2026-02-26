'use client';

/**
 * ساس — محادثة ٨: إدارة الصفحات الثابتة (Admin)
 */

import { useEffect, useState } from 'react';

interface PageItem {
  id: string; title: string; slug: string; status: string;
  sort_order: number; content: string; created_at: string; updated_at: string;
}

export default function PagesAdminPage() {
  const [pages, setPages] = useState<PageItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<PageItem | null>(null);
  const [isNew, setIsNew] = useState(false);
  const [toast, setToast] = useState('');

  // Form
  const [title, setTitle] = useState('');
  const [slug, setSlug] = useState('');
  const [content, setContent] = useState('');
  const [status, setStatus] = useState('published');
  const [sortOrder, setSortOrder] = useState(0);
  const [saving, setSaving] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchPages = async () => {
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('/api/pages', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setPages(data.data);
    } catch {} finally { setLoading(false); }
  };

  useEffect(() => { fetchPages(); }, []);

  const openNew = () => {
    setIsNew(true);
    setEditing(null);
    setTitle(''); setSlug(''); setContent(''); setStatus('published'); setSortOrder(0);
  };

  const openEdit = async (page: PageItem) => {
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch(`/api/pages/${page.id}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        const p = data.data;
        setEditing(p); setIsNew(false);
        setTitle(p.title); setSlug(p.slug); setContent(p.content || '');
        setStatus(p.status); setSortOrder(p.sort_order || 0);
      }
    } catch {}
  };

  const slugify = (text: string) => {
    return text.toLowerCase().replace(/\s+/g, '-').replace(/[^\u0621-\u064Aa-z0-9-]/g, '').replace(/-+/g, '-');
  };

  const handleSave = async () => {
    if (!title.trim() || !slug.trim()) return;
    setSaving(true);
    try {
      const token = localStorage.getItem('saas_token');
      const body = { title, slug, content, status, sort_order: sortOrder };
      const url = isNew ? '/api/pages' : `/api/pages/${editing!.id}`;
      const method = isNew ? 'POST' : 'PUT';

      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (data.success) {
        showToast(isNew ? 'تم إنشاء الصفحة' : 'تم حفظ التعديلات');
        setEditing(null); setIsNew(false);
        fetchPages();
      } else {
        showToast(data.error || 'حدث خطأ');
      }
    } catch {} finally { setSaving(false); }
  };

  const deletePage = async (id: string) => {
    if (!confirm('حذف هذه الصفحة؟')) return;
    try {
      const token = localStorage.getItem('saas_token');
      await fetch(`/api/pages/${id}`, { method: 'DELETE', headers: { Authorization: `Bearer ${token}` } });
      showToast('تم حذف الصفحة');
      fetchPages();
    } catch {}
  };

  const closeForm = () => { setEditing(null); setIsNew(false); };
  const showForm = editing || isNew;

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2">
          <span className="material-icons-outlined text-lg">check_circle</span>{toast}
        </div>
      )}

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-tajawal text-xl font-bold text-grey-900">الصفحات</h1>
          <p className="text-xs text-grey-400 mt-1">صفحات المتجر الثابتة (من نحن، الشروط، سياسة الاسترجاع...)</p>
        </div>
        {!showForm && (
          <button onClick={openNew}
            className="flex items-center gap-2 px-4 py-2.5 bg-brand-800 text-white rounded-xl text-sm font-bold hover:bg-brand-700 transition-all">
            <span className="material-icons-outlined text-lg">add</span>
            صفحة جديدة
          </button>
        )}
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-xl border border-grey-200 p-6 shadow-sm">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-tajawal text-base font-bold text-grey-800">
              {isNew ? 'صفحة جديدة' : `تعديل: ${editing?.title}`}
            </h2>
            <button onClick={closeForm} className="p-1.5 rounded-lg hover:bg-grey-100">
              <span className="material-icons-outlined text-grey-400">close</span>
            </button>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-grey-500 mb-1">عنوان الصفحة *</label>
                <input type="text" value={title} onChange={(e) => {
                  setTitle(e.target.value);
                  if (isNew) setSlug(slugify(e.target.value));
                }}
                  placeholder="مثال: من نحن"
                  className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none" />
              </div>
              <div>
                <label className="block text-xs text-grey-500 mb-1">رابط الصفحة (slug) *</label>
                <input type="text" value={slug} onChange={(e) => setSlug(e.target.value)}
                  placeholder="about-us" dir="ltr"
                  className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none font-mono" />
              </div>
            </div>

            <div>
              <label className="block text-xs text-grey-500 mb-1">المحتوى</label>
              <textarea value={content} onChange={(e) => setContent(e.target.value)}
                placeholder="اكتب محتوى الصفحة هنا..." rows={12}
                className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none resize-y leading-relaxed" />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-grey-500 mb-1">الحالة</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 focus:border-brand-500 outline-none">
                  <option value="published">منشور</option>
                  <option value="draft">مسودة</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-grey-500 mb-1">ترتيب العرض</label>
                <input type="number" value={sortOrder} onChange={(e) => setSortOrder(parseInt(e.target.value) || 0)}
                  className="w-full px-3 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 focus:border-brand-500 outline-none" />
              </div>
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button onClick={handleSave} disabled={saving || !title.trim() || !slug.trim()}
                className="px-6 py-2.5 bg-brand-800 text-white rounded-xl text-sm font-bold hover:bg-brand-700 disabled:bg-grey-200 disabled:text-grey-400 transition-all">
                {saving ? 'جاري الحفظ...' : 'حفظ'}
              </button>
              <button onClick={closeForm} className="px-6 py-2.5 bg-grey-100 text-grey-500 rounded-xl text-sm font-semibold hover:bg-grey-200 transition-all">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Pages List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-16 bg-grey-100 rounded-xl animate-pulse" />)}</div>
      ) : pages.length === 0 && !showForm ? (
        <div className="bg-white rounded-xl border border-grey-100 p-12 text-center">
          <span className="material-icons-outlined text-5xl text-grey-200 block mb-3">description</span>
          <p className="text-grey-400 text-sm mb-4">لا توجد صفحات</p>
          <button onClick={openNew} className="text-sm text-brand-800 font-semibold hover:underline">إنشاء صفحة جديدة</button>
        </div>
      ) : (
        <div className="space-y-2">
          {pages.map((page) => (
            <div key={page.id} className="bg-white rounded-xl border border-grey-100 px-4 py-3 flex items-center gap-4 hover:shadow-sm transition-all">
              <div className="w-10 h-10 rounded-xl bg-brand-50 flex items-center justify-center flex-shrink-0">
                <span className="material-icons-outlined text-brand-800 text-lg">description</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-grey-800">{page.title}</p>
                <p className="text-xs text-grey-400 font-mono">/{page.slug}</p>
              </div>
              <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${
                page.status === 'published' ? 'bg-green-50 text-green-600' : 'bg-grey-100 text-grey-400'
              }`}>
                {page.status === 'published' ? 'منشور' : 'مسودة'}
              </span>
              <div className="flex items-center gap-1">
                <button onClick={() => openEdit(page)} className="p-1.5 rounded-lg hover:bg-grey-100 transition-colors">
                  <span className="material-icons-outlined text-grey-400 text-lg">edit</span>
                </button>
                <button onClick={() => deletePage(page.id)} className="p-1.5 rounded-lg hover:bg-red-50 transition-colors">
                  <span className="material-icons-outlined text-grey-300 hover:text-red-400 text-lg">delete</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
