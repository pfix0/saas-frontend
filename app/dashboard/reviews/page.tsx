'use client';

/**
 * ساس — محادثة ٨: إدارة التقييمات (Admin)
 */

import { useEffect, useState } from 'react';
import Link from 'next/link';

interface Review {
  id: string; customer_name: string; rating: number; comment?: string;
  status: string; created_at: string;
  product_name: string; product_slug: string; product_image?: string;
}
interface Stats { total: number; pending: number; approved: number; avg_rating: number; }

const statusMap: Record<string, { label: string; color: string; bg: string; icon: string }> = {
  pending: { label: 'بانتظار المراجعة', color: 'text-amber-600', bg: 'bg-amber-50', icon: 'schedule' },
  approved: { label: 'منشور', color: 'text-green-600', bg: 'bg-green-50', icon: 'check_circle' },
  rejected: { label: 'مرفوض', color: 'text-red-600', bg: 'bg-red-50', icon: 'cancel' },
};

export default function ReviewsAdminPage() {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [toast, setToast] = useState('');

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 3000); };

  const fetchReviews = async () => {
    try {
      const token = localStorage.getItem('saas_token');
      const params = new URLSearchParams({ page: String(page), limit: '15' });
      if (filter !== 'all') params.set('status', filter);
      if (search) params.set('search', search);

      const res = await fetch(`/api/reviews?${params}`, { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) {
        setReviews(data.data);
        setTotalPages(data.pagination.pages);
      }
    } catch {} finally { setLoading(false); }
  };

  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch('/api/reviews/stats', { headers: { Authorization: `Bearer ${token}` } });
      const data = await res.json();
      if (data.success) setStats(data.data);
    } catch {}
  };

  useEffect(() => { fetchStats(); }, []);
  useEffect(() => { fetchReviews(); }, [page, filter, search]);

  const updateStatus = async (id: string, status: string) => {
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch(`/api/reviews/${id}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status }),
      });
      const data = await res.json();
      if (data.success) { showToast('تم تحديث الحالة'); fetchReviews(); fetchStats(); }
    } catch {}
  };

  const deleteReview = async (id: string) => {
    if (!confirm('حذف هذا التقييم؟')) return;
    try {
      const token = localStorage.getItem('saas_token');
      const res = await fetch(`/api/reviews/${id}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await res.json();
      if (data.success) { showToast('تم حذف التقييم'); fetchReviews(); fetchStats(); }
    } catch {}
  };

  const renderStars = (rating: number) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map(s => (
        <span key={s} className={`material-icons-outlined text-xs ${s <= rating ? 'text-amber-400' : 'text-grey-200'}`}>star</span>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Toast */}
      {toast && (
        <div className="fixed top-4 left-1/2 -translate-x-1/2 z-50 bg-green-600 text-white px-5 py-2.5 rounded-xl text-sm font-semibold shadow-lg flex items-center gap-2">
          <span className="material-icons-outlined text-lg">check_circle</span>{toast}
        </div>
      )}

      {/* Header */}
      <div>
        <h1 className="font-tajawal text-xl font-bold text-grey-900">التقييمات</h1>
        <p className="text-xs text-grey-400 mt-1">إدارة تقييمات العملاء على منتجاتك</p>
      </div>

      {/* Stats */}
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[
            { label: 'إجمالي التقييمات', value: stats.total, icon: 'rate_review', color: 'text-brand-800' },
            { label: 'بانتظار المراجعة', value: stats.pending, icon: 'schedule', color: 'text-amber-600' },
            { label: 'منشورة', value: stats.approved, icon: 'check_circle', color: 'text-green-600' },
            { label: 'متوسط التقييم', value: stats.avg_rating, icon: 'star', color: 'text-amber-500' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl border border-grey-100 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className={`material-icons-outlined text-lg ${s.color}`}>{s.icon}</span>
                <span className="text-xs text-grey-400">{s.label}</span>
              </div>
              <p className="font-tajawal text-2xl font-bold text-grey-900">{s.value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-400 text-lg">search</span>
          <input type="text" value={search} onChange={(e) => { setSearch(e.target.value); setPage(1); }}
            placeholder="بحث في التقييمات..."
            className="w-full pr-10 pl-4 py-2.5 rounded-xl border border-grey-200 text-sm text-grey-900 placeholder:text-grey-400 focus:border-brand-500 outline-none" />
        </div>
        <div className="flex gap-2 overflow-x-auto">
          {[
            { key: 'all', label: 'الكل' },
            { key: 'pending', label: 'بانتظار' },
            { key: 'approved', label: 'منشور' },
            { key: 'rejected', label: 'مرفوض' },
          ].map((f) => (
            <button key={f.key} onClick={() => { setFilter(f.key); setPage(1); }}
              className={`px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                filter === f.key ? 'bg-brand-800 text-white' : 'bg-white text-grey-500 border border-grey-200 hover:border-brand-300'
              }`}>
              {f.label}
            </button>
          ))}
        </div>
      </div>

      {/* Reviews List */}
      {loading ? (
        <div className="space-y-3">{[1,2,3].map(i => <div key={i} className="h-24 bg-grey-100 rounded-xl animate-pulse" />)}</div>
      ) : reviews.length === 0 ? (
        <div className="bg-white rounded-xl border border-grey-100 p-12 text-center">
          <span className="material-icons-outlined text-5xl text-grey-200 block mb-3">rate_review</span>
          <p className="text-grey-400 text-sm">لا توجد تقييمات</p>
        </div>
      ) : (
        <div className="space-y-3">
          {reviews.map((review) => {
            const st = statusMap[review.status] || statusMap.pending;
            return (
              <div key={review.id} className="bg-white rounded-xl border border-grey-100 p-4 hover:shadow-sm transition-all">
                <div className="flex flex-col sm:flex-row gap-4">
                  {/* Product Image */}
                  <div className="w-14 h-14 rounded-xl bg-grey-100 flex-shrink-0 overflow-hidden">
                    {review.product_image ? (
                      <img src={review.product_image} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <span className="material-icons-outlined text-grey-300 text-lg">inventory_2</span>
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div>
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-sm font-bold text-grey-800">{review.customer_name}</span>
                          {renderStars(review.rating)}
                        </div>
                        <p className="text-xs text-grey-400">
                          على <span className="font-semibold text-grey-600">{review.product_name}</span>
                          {' · '}{new Date(review.created_at).toLocaleDateString('ar-QA')}
                        </p>
                      </div>
                      <span className={`text-[0.65rem] font-bold px-2 py-0.5 rounded-full ${st.bg} ${st.color} whitespace-nowrap`}>
                        {st.label}
                      </span>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-grey-600 mt-2 leading-relaxed">{review.comment}</p>
                    )}

                    {/* Actions */}
                    <div className="flex items-center gap-2 mt-3">
                      {review.status !== 'approved' && (
                        <button onClick={() => updateStatus(review.id, 'approved')}
                          className="text-xs font-semibold text-green-600 hover:text-green-700 flex items-center gap-1">
                          <span className="material-icons-outlined text-sm">check_circle</span>نشر
                        </button>
                      )}
                      {review.status !== 'rejected' && (
                        <button onClick={() => updateStatus(review.id, 'rejected')}
                          className="text-xs font-semibold text-amber-600 hover:text-amber-700 flex items-center gap-1">
                          <span className="material-icons-outlined text-sm">block</span>رفض
                        </button>
                      )}
                      <button onClick={() => deleteReview(review.id)}
                        className="text-xs font-semibold text-red-500 hover:text-red-600 flex items-center gap-1 mr-auto">
                        <span className="material-icons-outlined text-sm">delete</span>حذف
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
            className="p-2 rounded-lg border border-grey-200 text-grey-500 disabled:opacity-30 hover:bg-grey-50">
            <span className="material-icons-outlined text-lg">chevron_right</span>
          </button>
          <span className="text-sm text-grey-500">{page} / {totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
            className="p-2 rounded-lg border border-grey-200 text-grey-500 disabled:opacity-30 hover:bg-grey-50">
            <span className="material-icons-outlined text-lg">chevron_left</span>
          </button>
        </div>
      )}
    </div>
  );
}
