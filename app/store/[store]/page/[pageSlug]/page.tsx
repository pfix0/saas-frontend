'use client';

/**
 * ساس — محادثة ٨: عرض صفحة ثابتة
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface PageData {
  id: string; title: string; slug: string; content: string;
  created_at: string; updated_at: string;
}

export default function StaticPage({ params }: { params: { store: string; pageSlug: string } }) {
  const { store, pageSlug } = params;
  const [page, setPage] = useState<PageData | null>(null);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const base = `/store/${store}`;

  useEffect(() => {
    fetch(`/api/store/${store}/pages/${pageSlug}`)
      .then(r => r.json())
      .then(d => { if (d.success) setPage(d.data); else setNotFound(true); })
      .catch(() => setNotFound(true))
      .finally(() => setLoading(false));
  }, [store, pageSlug]);

  if (loading) return (
    <div className="max-w-3xl mx-auto px-4 py-8 animate-pulse">
      <div className="h-8 bg-grey-100 rounded w-1/3 mb-4" />
      <div className="space-y-3">{[1,2,3,4].map(i => <div key={i} className="h-4 bg-grey-100 rounded" />)}</div>
    </div>
  );

  if (notFound || !page) return (
    <div className="max-w-3xl mx-auto px-4 py-16 text-center">
      <span className="material-icons-outlined text-6xl text-grey-200 mb-4 block">description</span>
      <h1 className="font-tajawal text-xl font-bold text-grey-800 mb-2">الصفحة غير موجودة</h1>
      <Link href={base} className="text-brand-800 text-sm font-semibold">العودة للرئيسية</Link>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-xs text-grey-400 mb-6">
        <Link href={base} className="hover:text-grey-600">الرئيسية</Link>
        <span>/</span>
        <span className="text-grey-600 font-semibold">{page.title}</span>
      </nav>

      <h1 className="font-tajawal text-2xl font-bold text-grey-900 mb-6">{page.title}</h1>

      {page.content ? (
        <div className="prose prose-sm max-w-none text-grey-700 leading-relaxed whitespace-pre-line">
          {page.content}
        </div>
      ) : (
        <p className="text-grey-400 text-sm">لا يوجد محتوى لهذه الصفحة بعد.</p>
      )}

      <div className="mt-8 pt-4 border-t border-grey-100 text-xs text-grey-300">
        آخر تحديث: {new Date(page.updated_at || page.created_at).toLocaleDateString('ar-QA')}
      </div>
    </div>
  );
}
