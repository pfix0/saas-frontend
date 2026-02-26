'use client';

/**
 * ساس — Platform Admin: Tenants Management
 * + دخول كتاجر (Impersonation) للدعم الفني
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAdminStore, ROLE_CONFIG } from '@/stores/admin';

const planLabels: Record<string, { label: string; color: string }> = {
  basic: { label: 'أساس', color: 'bg-grey-600' },
  growth: { label: 'نمو', color: 'bg-blue-600' },
  pro: { label: 'احتراف', color: 'bg-brand-600' },
};

const statusOptions: Record<string, { label: string; class: string }> = {
  active: { label: 'نشط', class: 'bg-green-500/10 text-green-400 border-green-500/20' },
  trial: { label: 'تجريبي', class: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' },
  suspended: { label: 'موقوف', class: 'bg-red-500/10 text-red-400 border-red-500/20' },
};

export default function AdminTenantsPage() {
  const router = useRouter();
  const {
    tenants, tenantsTotal, isLoading, error,
    fetchTenants, updateTenantStatus, updateTenantPlan, deleteTenant, canModify, canDelete, impersonate, admin,
  } = useAdminStore();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [planFilter, setPlanFilter] = useState('');
  const [actionTenant, setActionTenant] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [impersonateModal, setImpersonateModal] = useState<any>(null);
  const [impersonating, setImpersonating] = useState(false);
  const [tenantMerchants, setTenantMerchants] = useState<any[]>([]);
  const [loadingMerchants, setLoadingMerchants] = useState(false);

  const canSupport = admin && ['founder', 'director', 'supervisor', 'support'].includes(admin.role);

  useEffect(() => { fetchTenants(); }, []);

  const doSearch = () => fetchTenants({ search, status: statusFilter, plan: planFilter });
  useEffect(() => {
    const t = setTimeout(doSearch, 400);
    return () => clearTimeout(t);
  }, [search, statusFilter, planFilter]);

  const fmtCurrency = (n: number) => (n || 0).toLocaleString('ar-QA', { style: 'currency', currency: 'QAR', minimumFractionDigits: 0 });
  const fmtDate = (d: string) => new Date(d).toLocaleDateString('ar-QA', { year: 'numeric', month: 'short', day: 'numeric' });

  const handleStatusChange = async (id: string, status: string) => { await updateTenantStatus(id, status); setActionTenant(null); };
  const handlePlanChange = async (id: string, plan: string) => { await updateTenantPlan(id, plan); setActionTenant(null); };
  const handleDelete = async () => { if (!deleteId) return; await deleteTenant(deleteId); setDeleteId(null); };

  // فتح Modal الدخول كتاجر — يجلب تجار المتجر
  const openImpersonateModal = async (tenant: any) => {
    setImpersonateModal(tenant);
    setLoadingMerchants(true);
    setTenantMerchants([]);
    try {
      const token = localStorage.getItem('saas_admin_token');
      const res = await fetch('/api/admin/tenants/' + tenant.id + '/merchants', {
        headers: { 'Authorization': 'Bearer ' + token, 'Content-Type': 'application/json' },
      });
      const data = await res.json();
      if (data.success) setTenantMerchants(data.data);
    } catch (e) { console.error(e); }
    setLoadingMerchants(false);
  };

  // تنفيذ الدخول كتاجر
  const doImpersonate = async (merchantId: string) => {
    setImpersonating(true);
    const ok = await impersonate(merchantId);
    setImpersonating(false);
    if (ok) { window.location.href = '/dashboard'; }
  };

  return (
    <div className="animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-white">المتاجر</h1>
          <p className="text-sm text-grey-500 mt-1">{tenantsTotal} متجر مسجل</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 p-4 mb-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <span className="material-icons-outlined absolute right-3 top-1/2 -translate-y-1/2 text-grey-600 text-lg">search</span>
            <input type="text" value={search} onChange={(e) => setSearch(e.target.value)} placeholder="بحث بالاسم، الرابط، البريد..."
              className="w-full pr-10 pl-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 outline-none transition-all" />
          </div>
          <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-grey-300 text-sm focus:border-brand-500 outline-none min-w-[130px]">
            <option value="">كل الحالات</option>
            <option value="active">نشط</option>
            <option value="trial">تجريبي</option>
            <option value="suspended">موقوف</option>
          </select>
          <select value={planFilter} onChange={(e) => setPlanFilter(e.target.value)}
            className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-grey-300 text-sm focus:border-brand-500 outline-none min-w-[130px]">
            <option value="">كل الباقات</option>
            <option value="basic">أساس</option>
            <option value="growth">نمو</option>
            <option value="pro">احتراف</option>
          </select>
        </div>
      </div>

      {/* Table */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 overflow-hidden">
        {isLoading ? (
          <div className="p-6 space-y-3">{[1,2,3,4].map((i) => <div key={i} className="h-16 bg-grey-700/30 rounded-lg animate-pulse" />)}</div>
        ) : tenants.length === 0 ? (
          <div className="text-center py-20">
            <span className="material-icons-outlined text-5xl text-grey-600 mb-3 block">store</span>
            <p className="text-grey-500 text-sm">لا توجد متاجر</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-grey-700/50">
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs">المتجر</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden md:table-cell">المالك</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs">الباقة</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs">الحالة</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden lg:table-cell">المنتجات</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden lg:table-cell">الإيرادات</th>
                  <th className="text-right px-4 py-3 font-semibold text-grey-400 text-xs hidden md:table-cell">التاريخ</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {tenants.map((t) => {
                  const plan = planLabels[t.plan] || planLabels.basic;
                  const status = statusOptions[t.status] || statusOptions.active;
                  return (
                    <tr key={t.id} className="border-b border-grey-700/20 hover:bg-grey-700/20 transition-colors group">
                      <td className="px-4 py-3">
                        <p className="font-semibold text-white">{t.name}</p>
                        <p className="text-xs text-grey-500 font-mono">{t.slug}.saas.qa</p>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <p className="text-grey-300 text-xs">{t.owner_name || '—'}</p>
                        <p className="text-grey-500 text-xs">{t.owner_email || ''}</p>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold text-white ${plan.color}`}>{plan.label}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-block px-2 py-0.5 rounded-full text-[0.65rem] font-bold border ${status.class}`}>{status.label}</span>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-grey-300">{t.products_count}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-grey-300 font-semibold">{fmtCurrency(t.revenue)}</td>
                      <td className="px-4 py-3 hidden md:table-cell text-grey-500 text-xs">{fmtDate(t.created_at)}</td>
                      <td className="px-4 py-3">
                        <div className="relative">
                          <button onClick={() => setActionTenant(actionTenant?.id === t.id ? null : t)}
                            className="p-1 rounded-lg hover:bg-grey-600/50 transition-colors opacity-0 group-hover:opacity-100">
                            <span className="material-icons-outlined text-grey-400 text-lg">more_vert</span>
                          </button>

                          {actionTenant?.id === t.id && (
                            <div className="absolute left-0 top-full mt-1 w-52 bg-grey-700 rounded-xl border border-grey-600 shadow-xl z-20 overflow-hidden animate-fade-in">

                              {/* 🔑 دخول كتاجر */}
                              {canSupport && (
                                <button onClick={() => { openImpersonateModal(t); setActionTenant(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 transition-colors border-b border-grey-600">
                                  <span className="material-icons-outlined text-sm">support_agent</span>
                                  <span className="font-semibold">دخول كتاجر</span>
                                  <span className="material-icons-outlined text-[10px] mr-auto">open_in_new</span>
                                </button>
                              )}

                              {/* Status */}
                              {canModify() && (
                                <div className="px-3 py-2 border-b border-grey-600">
                                  <p className="text-[0.6rem] text-grey-500 font-bold mb-1">تغيير الحالة</p>
                                  <div className="flex gap-1">
                                    {(['active','trial','suspended'] as const).map((s) => (
                                      <button key={s} onClick={() => handleStatusChange(t.id, s)}
                                        className={`text-[0.6rem] px-2 py-0.5 rounded-full border ${t.status === s ? statusOptions[s].class : 'text-grey-500 border-grey-600 hover:border-grey-500'} transition-all`}>
                                        {statusOptions[s].label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Plan */}
                              {canModify() && (
                                <div className="px-3 py-2 border-b border-grey-600">
                                  <p className="text-[0.6rem] text-grey-500 font-bold mb-1">تغيير الباقة</p>
                                  <div className="flex gap-1">
                                    {(['basic','growth','pro'] as const).map((p) => (
                                      <button key={p} onClick={() => handlePlanChange(t.id, p)}
                                        className={`text-[0.6rem] px-2 py-0.5 rounded-full ${t.plan === p ? planLabels[p].color + ' text-white' : 'bg-grey-600 text-grey-400 hover:bg-grey-500'} transition-all`}>
                                        {planLabels[p].label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              )}

                              {/* Delete — founder only */}
                              {canDelete() && (
                                <button onClick={() => { setDeleteId(t.id); setActionTenant(null); }}
                                  className="w-full flex items-center gap-2 px-3 py-2 text-xs text-red-400 hover:bg-red-500/10 transition-colors">
                                  <span className="material-icons-outlined text-sm">delete</span>حذف المتجر
                                </button>
                              )}

                              {!canModify() && !canDelete() && !canSupport && (
                                <div className="px-3 py-2 text-[0.6rem] text-grey-500 flex items-center gap-1">
                                  <span className="material-icons-outlined text-[10px]">lock</span>صلاحية القراءة فقط
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ═══ Impersonation Modal ═══ */}
      {impersonateModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => !impersonating && setImpersonateModal(null)}>
          <div className="bg-grey-800 rounded-2xl w-full max-w-md border border-grey-700 animate-fade-in shadow-2xl" onClick={(e) => e.stopPropagation()}>
            {/* Header */}
            <div className="p-5 border-b border-grey-700">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 flex items-center justify-center">
                  <span className="material-icons-outlined text-amber-400 text-xl">support_agent</span>
                </div>
                <div>
                  <h3 className="font-tajawal text-base font-bold text-white">دخول كتاجر</h3>
                  <p className="text-xs text-grey-500">{impersonateModal.name}</p>
                </div>
                <button onClick={() => setImpersonateModal(null)} className="mr-auto p-1 rounded-lg hover:bg-grey-700">
                  <span className="material-icons-outlined text-grey-500 text-lg">close</span>
                </button>
              </div>
              <div className="flex items-start gap-2 p-3 rounded-xl bg-amber-500/5 border border-amber-500/20">
                <span className="material-icons-outlined text-amber-400 text-sm mt-0.5">warning</span>
                <p className="text-[0.7rem] text-amber-300/80 leading-relaxed">
                  ستدخل لوحة تحكم التاجر بصلاحياته الكاملة. كل التغييرات تنعكس على متجره مباشرة. للدعم الفني فقط.
                </p>
              </div>
            </div>

            {/* Merchants List */}
            <div className="p-4 max-h-64 overflow-y-auto">
              <p className="text-[0.65rem] text-grey-500 font-bold mb-3">اختر حساب التاجر:</p>
              {loadingMerchants ? (
                <div className="space-y-2">{[1,2].map(i => <div key={i} className="h-14 bg-grey-700/30 rounded-xl animate-pulse" />)}</div>
              ) : tenantMerchants.length === 0 ? (
                <div className="text-center py-8">
                  <span className="material-icons-outlined text-3xl text-grey-600 mb-2 block">person_off</span>
                  <p className="text-sm text-grey-500">لا يوجد تجار</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {tenantMerchants.map((m: any) => (
                    <button key={m.id} onClick={() => doImpersonate(m.id)} disabled={impersonating}
                      className="w-full flex items-center gap-3 p-3 rounded-xl bg-grey-700/30 border border-grey-700 hover:border-amber-500/40 hover:bg-amber-500/5 transition-all group/m disabled:opacity-50">
                      <div className="w-9 h-9 rounded-lg bg-grey-700 flex items-center justify-center flex-shrink-0">
                        <span className="material-icons-outlined text-grey-400 text-lg group-hover/m:text-amber-400 transition-colors">
                          {m.role === 'owner' ? 'admin_panel_settings' : 'person'}
                        </span>
                      </div>
                      <div className="flex-1 min-w-0 text-right">
                        <p className="text-sm font-semibold text-grey-200 group-hover/m:text-white">{m.name}</p>
                        <div className="flex items-center gap-2">
                          <span className="text-[0.65rem] text-grey-500">{m.email}</span>
                          <span className={`text-[0.55rem] px-1.5 py-0.5 rounded-full font-bold ${m.role === 'owner' ? 'bg-brand-500/10 text-brand-400' : 'bg-grey-600/50 text-grey-400'}`}>
                            {m.role === 'owner' ? 'مالك' : 'موظف'}
                          </span>
                        </div>
                      </div>
                      <div className="flex-shrink-0">
                        {impersonating ? (
                          <span className="material-icons-outlined text-amber-400 text-lg animate-spin">progress_activity</span>
                        ) : (
                          <span className="material-icons-outlined text-grey-600 group-hover/m:text-amber-400 text-lg transition-colors">login</span>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-grey-700">
              <button onClick={() => setImpersonateModal(null)} disabled={impersonating}
                className="w-full py-2.5 rounded-xl bg-grey-700 text-grey-300 text-sm font-semibold hover:bg-grey-600 transition-all disabled:opacity-50">
                إلغاء
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-grey-800 rounded-2xl p-6 w-full max-w-sm border border-grey-700 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons-outlined text-red-400 text-2xl">delete_forever</span>
            </div>
            <h3 className="font-tajawal text-lg font-bold text-white text-center mb-2">حذف المتجر نهائياً؟</h3>
            <p className="text-sm text-grey-400 text-center mb-6">سيتم حذف كل بياناته. لا يمكن التراجع.</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteId(null)} className="flex-1 py-2.5 rounded-xl bg-grey-700 text-grey-300 text-sm font-semibold hover:bg-grey-600">إلغاء</button>
              <button onClick={handleDelete} className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-sm font-semibold hover:bg-red-500">حذف</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
