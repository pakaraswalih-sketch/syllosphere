import React, { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import {
  ArrowLeftIcon, SearchIcon, UserIcon, TrashIcon, EditIcon,
  PlusIcon, LoaderIcon, CheckCircleIcon, XCircleIcon, RefreshIcon
} from './Icons';

interface Student {
  id: string;
  email: string;
  display_name: string;
  created_at: string;
  last_sign_in_at: string | null;
  confirmed_at: string | null;
  lessons_completed: number;
  certificate_unlocked: boolean;
  certificate_id: string | null;
  last_active: string | null;
}

interface AdminManageProps {
  onBack: () => void;
}

export const AdminManage: React.FC<AdminManageProps> = ({ onBack }) => {
  const [students, setStudents] = useState<Student[]>([]);
  const [filtered, setFiltered] = useState<Student[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selected, setSelected] = useState<Student | null>(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showEdit, setShowEdit] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toast, setToast] = useState<{ msg: string; ok: boolean } | null>(null);

  // Add form state
  const [addEmail, setAddEmail] = useState('');
  const [addPassword, setAddPassword] = useState('');
  const [addName, setAddName] = useState('');

  // Edit form state
  const [editName, setEditName] = useState('');

  const showToast = (msg: string, ok = true) => {
    setToast({ msg, ok });
    setTimeout(() => setToast(null), 3500);
  };

  const fetchStudents = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('admin_student_view')
        .select('*');

      if (error) throw error;
      const rows = (data as Student[]) || [];
      setStudents(rows);
      setFiltered(rows);
    } catch (err: any) {
      showToast('Failed to load students: ' + (err.message || 'Unknown error'), false);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchStudents(); }, [fetchStudents]);

  useEffect(() => {
    const q = search.toLowerCase();
    setFiltered(
      q ? students.filter(s =>
        s.email.toLowerCase().includes(q) ||
        (s.display_name || '').toLowerCase().includes(q) ||
        s.id.toLowerCase().includes(q)
      ) : students
    );
  }, [search, students]);

  // ── Add Student ─────────────────────────────────────────────
  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      // Use signUp via admin — creates the user in Supabase Auth
      const { data, error } = await supabase.auth.signUp({
        email: addEmail.trim().toLowerCase(),
        password: addPassword,
        options: {
          data: { full_name: addName.trim() }
        }
      });
      if (error) throw error;
      if (data.user) {
        // Seed user_progress row
        await supabase.from('user_progress').upsert({
          user_id: data.user.id,
          user_name: addName.trim() || addEmail.split('@')[0],
          completed_lessons: [],
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
        showToast('Student added successfully! Verification email sent.');
        setShowAdd(false);
        setAddEmail(''); setAddPassword(''); setAddName('');
        await fetchStudents();
      }
    } catch (err: any) {
      showToast('Add failed: ' + (err.message || 'Unknown error'), false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Edit Student Name ───────────────────────────────────────
  const handleEditStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selected) return;
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: selected.id,
          user_name: editName.trim(),
          updated_at: new Date().toISOString()
        }, { onConflict: 'user_id' });
      if (error) throw error;
      showToast('Student name updated.');
      setShowEdit(false);
      await fetchStudents();
    } catch (err: any) {
      showToast('Edit failed: ' + (err.message || 'Unknown error'), false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Delete Student ──────────────────────────────────────────
  const handleDeleteStudent = async (student: Student) => {
    if (!window.confirm(`Delete ${student.email}? This is irreversible.`)) return;
    setActionLoading(true);
    try {
      // Delete student-specific data first (FK safe order)
      await supabase.from('consult_messages').delete().in('thread_id',
        (await supabase.from('consult_threads').select('id').eq('user_id', student.id)).data?.map((t: any) => t.id) || []
      );
      await supabase.from('consult_threads').delete().eq('user_id', student.id);
      await supabase.from('activity_logs').delete().eq('user_id', student.id);
      await supabase.from('user_progress').delete().eq('user_id', student.id);

      // Note: Deleting from auth.users requires service-role key (not available client-side)
      // The student's login will remain in auth but all data is wiped.
      // For full auth deletion, use Supabase Dashboard → Auth → Users or a backend function.
      showToast(`Student data deleted. Auth account must be removed via Supabase Dashboard.`);
      if (selected?.id === student.id) setSelected(null);
      await fetchStudents();
    } catch (err: any) {
      showToast('Delete failed: ' + (err.message || 'Unknown error'), false);
    } finally {
      setActionLoading(false);
    }
  };

  // ── Render ──────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#020617] text-white p-4 md:p-6 pt-20 md:pt-24 font-sans">
      {/* Toast */}
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 flex items-center gap-3 px-5 py-3 rounded-xl shadow-2xl text-sm font-semibold transition-all ${toast.ok ? 'bg-emerald-600 text-white' : 'bg-rose-600 text-white'}`}>
          {toast.ok ? <CheckCircleIcon className="w-4 h-4" /> : <XCircleIcon className="w-4 h-4" />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={onBack} className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors">
            <ArrowLeftIcon className="w-5 h-5 text-slate-400" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Student Management</h1>
            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest mt-0.5">{students.length} Registered Students</p>
          </div>
          <div className="ml-auto flex items-center gap-3">
            <button onClick={fetchStudents} className="p-2.5 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl transition-colors">
              <RefreshIcon className="w-4 h-4 text-slate-400" />
            </button>
            <button
              onClick={() => { setShowAdd(true); setShowEdit(false); setSelected(null); }}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-500 rounded-xl text-sm font-bold transition-colors shadow-lg shadow-blue-600/20"
            >
              <PlusIcon className="w-4 h-4" /> Add Student
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* LEFT: Student List */}
          <div className="lg:col-span-1 bg-slate-900/50 border border-white/5 rounded-2xl p-4 flex flex-col h-[calc(100vh-10rem)]">
            {/* Search */}
            <div className="relative mb-4">
              <SearchIcon className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search by name, email or ID..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full bg-slate-800/50 border border-white/5 rounded-xl py-2.5 pl-9 pr-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors"
              />
            </div>

            {/* List */}
            <div className="flex-1 overflow-y-auto space-y-2 no-scrollbar">
              {loading ? (
                <div className="flex justify-center items-center h-32">
                  <LoaderIcon className="w-6 h-6 text-blue-500 animate-spin" />
                </div>
              ) : filtered.length === 0 ? (
                <p className="text-center text-slate-500 text-sm py-10">No students found.</p>
              ) : (
                filtered.map(student => (
                  <button
                    key={student.id}
                    onClick={() => { setSelected(student); setShowAdd(false); setShowEdit(false); }}
                    className={`w-full text-left p-3.5 rounded-xl border transition-all ${
                      selected?.id === student.id
                        ? 'bg-blue-600/10 border-blue-500/30'
                        : 'bg-slate-800/30 border-white/5 hover:bg-slate-800/60 hover:border-white/10'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-slate-700 border border-white/10 flex items-center justify-center text-slate-300 font-bold text-sm shrink-0">
                        {(student.display_name || student.email).charAt(0).toUpperCase()}
                      </div>
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-semibold text-white truncate">{student.display_name || student.email.split('@')[0]}</p>
                        <p className="text-[11px] text-slate-500 truncate">{student.email}</p>
                      </div>
                      <div className="text-right shrink-0">
                        <p className="text-xs font-bold text-blue-400">{student.lessons_completed}</p>
                        <p className="text-[9px] text-slate-600 uppercase tracking-widest">lessons</p>
                      </div>
                    </div>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* RIGHT: Detail / Add / Edit Panel */}
          <div className="lg:col-span-2 bg-slate-900/50 border border-white/5 rounded-2xl p-6 h-[calc(100vh-10rem)] overflow-y-auto">
            {/* ── Add Student Form ── */}
            {showAdd && (
              <form onSubmit={handleAddStudent} className="max-w-md mx-auto space-y-5 pt-6">
                <h2 className="text-xl font-bold text-white mb-6">Add New Student</h2>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input type="text" value={addName} onChange={e => setAddName(e.target.value)} placeholder="Student name"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Email Address *</label>
                  <input type="email" required value={addEmail} onChange={e => setAddEmail(e.target.value)} placeholder="student@email.com"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Password *</label>
                  <input type="password" required minLength={6} value={addPassword} onChange={e => setAddPassword(e.target.value)} placeholder="Min 6 characters"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={actionLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    {actionLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <PlusIcon className="w-4 h-4" />}
                    Create Student Account
                  </button>
                  <button type="button" onClick={() => setShowAdd(false)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm font-bold text-slate-400 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* ── Edit Student Form ── */}
            {showEdit && selected && (
              <form onSubmit={handleEditStudent} className="max-w-md mx-auto space-y-5 pt-6">
                <h2 className="text-xl font-bold text-white mb-6">Edit Student</h2>
                <div>
                  <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Display Name</label>
                  <input type="text" value={editName} onChange={e => setEditName(e.target.value)} placeholder="Enter new name"
                    className="w-full bg-slate-800 border border-white/10 rounded-xl py-3 px-4 text-sm text-white placeholder:text-slate-600 focus:outline-none focus:border-blue-500/50 transition-colors" />
                </div>
                <p className="text-xs text-slate-500">Email cannot be changed. Manage via Supabase Auth Dashboard.</p>
                <div className="flex gap-3 pt-2">
                  <button type="submit" disabled={actionLoading}
                    className="flex-1 py-3 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                    {actionLoading ? <LoaderIcon className="w-4 h-4 animate-spin" /> : <CheckCircleIcon className="w-4 h-4" />}
                    Save Changes
                  </button>
                  <button type="button" onClick={() => setShowEdit(false)}
                    className="px-4 py-3 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-sm font-bold text-slate-400 transition-colors">
                    Cancel
                  </button>
                </div>
              </form>
            )}

            {/* ── Student Detail View ── */}
            {selected && !showAdd && !showEdit && (
              <div>
                <div className="flex items-start justify-between mb-8">
                  <div className="flex items-center gap-4">
                    <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 border border-blue-500/20 flex items-center justify-center text-white text-2xl font-bold shadow-lg">
                      {(selected.display_name || selected.email).charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h2 className="text-2xl font-bold text-white">{selected.display_name || selected.email.split('@')[0]}</h2>
                      <p className="text-sm text-slate-400">{selected.email}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className={`text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full ${selected.confirmed_at ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'}`}>
                          {selected.confirmed_at ? 'Verified' : 'Unverified'}
                        </span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => { setEditName(selected.display_name || ''); setShowEdit(true); }}
                      className="flex items-center gap-1.5 px-3 py-2 bg-slate-800 hover:bg-slate-700 border border-white/10 rounded-xl text-xs font-bold text-slate-300 transition-colors"
                    >
                      <EditIcon className="w-3.5 h-3.5" /> Edit
                    </button>
                    <button
                      onClick={() => handleDeleteStudent(selected)}
                      disabled={actionLoading}
                      className="flex items-center gap-1.5 px-3 py-2 bg-rose-600/10 hover:bg-rose-600/20 border border-rose-500/20 rounded-xl text-xs font-bold text-rose-400 transition-colors"
                    >
                      <TrashIcon className="w-3.5 h-3.5" /> Delete
                    </button>
                  </div>
                </div>

                {/* Stats Grid */}
                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-8">
                  {[
                    { label: 'Lessons Completed', value: selected.lessons_completed, color: 'text-blue-400' },
                    { label: 'Certificate', value: selected.certificate_unlocked ? '✓ Earned' : 'Not yet', color: selected.certificate_unlocked ? 'text-emerald-400' : 'text-slate-500' },
                    { label: 'User ID', value: selected.id.substring(0, 8) + '...', color: 'text-slate-400' },
                  ].map((s, i) => (
                    <div key={i} className="bg-slate-800/50 border border-white/5 rounded-xl p-4">
                      <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                      <p className="text-[10px] text-slate-500 uppercase tracking-widest mt-1">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Info rows */}
                <div className="space-y-3">
                  {[
                    { label: 'Email', value: selected.email },
                    { label: 'Registered', value: selected.created_at ? new Date(selected.created_at).toLocaleDateString('en-IN', { year: 'numeric', month: 'long', day: 'numeric' }) : '—' },
                    { label: 'Last Login', value: selected.last_sign_in_at ? new Date(selected.last_sign_in_at).toLocaleString() : 'Never' },
                    { label: 'Last Activity', value: selected.last_active ? new Date(selected.last_active).toLocaleString() : '—' },
                    { label: 'Certificate ID', value: selected.certificate_id || '—' },
                  ].map((row, i) => (
                    <div key={i} className="flex justify-between items-center py-3 border-b border-white/5">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-widest">{row.label}</span>
                      <span className="text-sm text-slate-200 font-mono">{row.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* ── Empty State ── */}
            {!selected && !showAdd && (
              <div className="flex flex-col items-center justify-center h-full text-center">
                <div className="w-20 h-20 bg-slate-800/50 rounded-full flex items-center justify-center mb-4 border border-white/5">
                  <UserIcon className="w-8 h-8 text-slate-600" />
                </div>
                <h3 className="text-lg font-bold text-white mb-2">Select a Student</h3>
                <p className="text-sm text-slate-500 max-w-xs">Choose a student from the list to view their profile, progress, and account details.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminManage;
