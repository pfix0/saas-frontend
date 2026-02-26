'use client';

/**
 * ساس — طاقم المنصة (Staff Management)
 * founder + director فقط
 */

import { useEffect, useState } from 'react';
import { useAdminStore, ROLE_CONFIG } from '@/stores/admin';

const roles = ['director', 'supervisor', 'support', 'accountant', 'employee'] as const;

export default function AdminStaffPage() {
  const { admin, staff, error, fetchStaff, addStaff, updateStaffRole, updateStaffStatus, deleteStaffMember, clearError } = useAdminStore();
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'employee' });
  const [saving, setSaving] = useState(false);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => { fetchStaff(); clearError(); }, []);

  const handleAdd = async () => {
    if (!form.name || !form.email || !form.password) return;
    setSaving(true);
    const ok = await addStaff(form);
    setSaving(false);
    if (ok) { setShowAdd(false); setForm({ name: '', email: '', password: '', role: 'employee' }); }
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteStaffMember(deleteId);
    setDeleteId(null);
  };

  const fmtDate = (d: string) => d ? new Date(d).toLocaleDateString('ar-QA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—';
  const isFounder = admin?.role === 'founder';

  return (
    <div className="animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="font-tajawal text-2xl font-bold text-white">طاقم المنصة</h1>
          <p className="text-sm text-grey-500 mt-1">{staff.length} عضو — إدارة أدوار وصلاحيات فريق العمل</p>
        </div>
        <button onClick={() => setShowAdd(true)} className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 transition-all">
          <span className="material-icons-outlined text-lg">person_add</span>
          إضافة عضو
        </button>
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm flex items-center gap-2">
          <span className="material-icons-outlined text-lg">error</span>{error}
        </div>
      )}

      {/* Add Form */}
      {showAdd && (
        <div className="bg-grey-800/50 rounded-xl border-2 border-brand-500/30 p-5 mb-4 animate-fade-in">
          <h3 className="font-tajawal text-sm font-bold text-white mb-4">عضو جديد</h3>
          <div className="grid sm:grid-cols-2 gap-3 mb-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="الاسم الكامل"
              className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 outline-none" />
            <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="البريد الإلكتروني" dir="ltr"
              className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 outline-none" />
            <input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} placeholder="كلمة المرور" dir="ltr"
              className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-white text-sm placeholder:text-grey-500 focus:border-brand-500 outline-none" />
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value })}
              className="px-4 py-2.5 rounded-xl bg-grey-700 border border-grey-600 text-grey-300 text-sm focus:border-brand-500 outline-none">
              {roles.map(r => {
                if (r === 'director' && !isFounder) return null;
                return <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>;
              })}
            </select>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={() => setShowAdd(false)} className="px-4 py-2 rounded-xl bg-grey-700 text-grey-300 text-sm hover:bg-grey-600 transition-all">إلغاء</button>
            <button onClick={handleAdd} disabled={saving} className="px-4 py-2 rounded-xl bg-brand-800 text-white text-sm font-semibold hover:bg-brand-700 transition-all disabled:opacity-50">
              {saving ? 'جاري الحفظ...' : 'إضافة'}
            </button>
          </div>
        </div>
      )}

      {/* Staff List */}
      <div className="bg-grey-800/50 rounded-xl border border-grey-700/30 overflow-hidden">
        {staff.length === 0 ? (
          <div className="text-center py-16">
            <span className="material-icons-outlined text-5xl text-grey-600 mb-3 block">shield_person</span>
            <p className="text-grey-500 text-sm">لا يوجد أعضاء</p>
          </div>
        ) : (
          <div className="divide-y divide-grey-700/30">
            {staff.map((m) => {
              const cfg = ROLE_CONFIG[m.role] || ROLE_CONFIG.employee;
              const isSelf = m.id === admin?.id;
              const isFounderMember = m.role === 'founder';
              return (
                <div key={m.id} className="flex items-center gap-4 p-4 hover:bg-grey-700/20 transition-colors group">
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full bg-grey-700 flex items-center justify-center flex-shrink-0">
                    <span className={`material-icons-outlined text-lg ${cfg.color}`}>{cfg.icon}</span>
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-white truncate">{m.name}</p>
                      {isSelf && <span className="text-[0.5rem] bg-brand-500/20 text-brand-400 px-1.5 py-0.5 rounded-full font-bold">أنت</span>}
                    </div>
                    <p className="text-xs text-grey-500 truncate">{m.email}</p>
                  </div>

                  {/* Role */}
                  <div className="hidden sm:block">
                    {!isFounderMember && !isSelf ? (
                      <select value={m.role} onChange={(e) => updateStaffRole(m.id, e.target.value)}
                        className={`text-[0.7rem] px-2.5 py-1 rounded-full bg-grey-700 border border-grey-600 ${cfg.color} font-bold outline-none cursor-pointer`}>
                        {roles.map(r => {
                          if (r === 'director' && !isFounder) return null;
                          return <option key={r} value={r}>{ROLE_CONFIG[r].label}</option>;
                        })}
                      </select>
                    ) : (
                      <span className={`text-[0.7rem] px-2.5 py-1 rounded-full bg-grey-700/50 ${cfg.color} font-bold`}>{cfg.label}</span>
                    )}
                  </div>

                  {/* Status */}
                  <div className="hidden md:block">
                    <span className={`inline-block w-2 h-2 rounded-full ${m.status === 'active' ? 'bg-green-400' : 'bg-red-400'}`} />
                    <span className="text-[0.65rem] text-grey-500 mr-1">{m.status === 'active' ? 'نشط' : 'معطل'}</span>
                  </div>

                  {/* Date */}
                  <span className="hidden lg:block text-[0.65rem] text-grey-600">{fmtDate(m.created_at)}</span>

                  {/* Actions */}
                  {!isFounderMember && !isSelf && (
                    <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button onClick={() => updateStaffStatus(m.id, m.status === 'active' ? 'inactive' : 'active')}
                        className="p-1.5 rounded-lg hover:bg-grey-600/50 transition-colors" title={m.status === 'active' ? 'تعطيل' : 'تفعيل'}>
                        <span className="material-icons-outlined text-grey-400 text-[16px]">{m.status === 'active' ? 'block' : 'check_circle'}</span>
                      </button>
                      {isFounder && (
                        <button onClick={() => setDeleteId(m.id)} className="p-1.5 rounded-lg hover:bg-red-500/10 transition-colors" title="حذف">
                          <span className="material-icons-outlined text-grey-400 hover:text-red-400 text-[16px]">delete</span>
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Delete Modal */}
      {deleteId && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-grey-800 rounded-2xl p-6 w-full max-w-sm border border-grey-700 animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-red-500/10 mx-auto mb-4 flex items-center justify-center">
              <span className="material-icons-outlined text-red-400 text-2xl">person_remove</span>
            </div>
            <h3 className="font-tajawal text-lg font-bold text-white text-center mb-2">حذف العضو؟</h3>
            <p className="text-sm text-grey-400 text-center mb-6">سيفقد صلاحية الوصول للمنصة نهائياً</p>
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
