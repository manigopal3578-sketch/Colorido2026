'use client';

import React, { useState, useEffect } from 'react';
import {
  Briefcase,
  Plus,
  Mail,
  Phone,
  CheckCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AdminPhotoPicker } from '@/components/admin/AdminPhotoPicker';

export default function CoordinatorsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingCoord, setEditingCoord] = useState<any>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

  const fetchData = async () => {
    try {
      const res = await fetch('/api/data/state');
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !editingCoord.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'coordinators',
          id: editingCoord.id,
          item: editingCoord,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Coordinator created' : 'Coordinator updated');
        setModalOpen(false);
        setEditingCoord(null);
        fetchData();
      } else {
        showToast(resJson.message || 'Error saving coordinator', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete coordinator profile?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'coordinators',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Coordinator removed');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const coordinators = data.coordinators || [];

  const filtered = coordinators.filter((c: any) => {
    if (selectedCategory === 'ALL') return true;
    return c.category === selectedCategory;
  });

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Briefcase className="w-4 h-4" />
            <span>Faculty & Student Officers</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Event Coordinators ({coordinators.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Designated leads in charge of competition judging, ground management, and student delegates.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingCoord({
              name: '',
              role: 'Faculty Convener',
              category: 'CULTURAL',
              type: 'FACULTY',
              email: '',
              phone: '+91 863 2288201',
              photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
              assignedEventIds: [],
              bio: 'Faculty coordinator for COLORIDO 2K26.',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Coordinator</span>
        </button>
      </div>

      {/* Category filters */}
      <div className="flex items-center gap-2">
        {['ALL', 'CULTURAL', 'SPORTS', 'STUDENT_LEAD', 'CENTRAL'].map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === cat
                ? 'bg-[#5227FF] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map((coord: any) => (
          <div
            key={coord.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-3.5">
                <img
                  src={coord.photo}
                  alt={coord.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shrink-0"
                />
                <div>
                  <span
                    className="px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-wider inline-block mb-1 text-white"
                    style={{
                      backgroundColor:
                        coord.category === 'CULTURAL'
                          ? '#FF2E93'
                          : coord.category === 'SPORTS'
                          ? '#FF5E3A'
                          : '#5227FF',
                    }}
                  >
                    {coord.category} • {coord.type}
                  </span>
                  <h3 className="text-base font-black text-[#090814] font-display">
                    {coord.name}
                  </h3>
                  <p className="text-xs text-[#525266] font-semibold">{coord.role}</p>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-[#525266]">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#5227FF] shrink-0" />
                  <span>{coord.email}</span>
                </p>
                <p className="flex items-center gap-2 font-mono text-[#717188]">
                  <Phone className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0" />
                  <span>{coord.phone}</span>
                </p>
              </div>

              {coord.bio && <p className="text-xs text-[#717188] line-clamp-2 leading-relaxed">{coord.bio}</p>}
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingCoord(coord);
                  setModalOpen(true);
                }}
                className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(coord.id)}
                className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete</span>
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && editingCoord && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingCoord.id ? 'Edit Coordinator' : 'Add Coordinator'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingCoord.name}
                  onChange={(e) => setEditingCoord({ ...editingCoord, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={editingCoord.role}
                    onChange={(e) => setEditingCoord({ ...editingCoord, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Domain</label>
                  <select
                    value={editingCoord.category}
                    onChange={(e) => setEditingCoord({ ...editingCoord, category: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="CULTURAL">CULTURAL</option>
                    <option value="SPORTS">SPORTS</option>
                    <option value="STUDENT_LEAD">STUDENT_LEAD</option>
                    <option value="CENTRAL">CENTRAL</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Type</label>
                  <select
                    value={editingCoord.type}
                    onChange={(e) => setEditingCoord({ ...editingCoord, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="FACULTY">FACULTY</option>
                    <option value="STUDENT">STUDENT</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Phone</label>
                  <input
                    type="text"
                    value={editingCoord.phone}
                    onChange={(e) => setEditingCoord({ ...editingCoord, phone: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingCoord.email}
                  onChange={(e) => setEditingCoord({ ...editingCoord, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <AdminPhotoPicker
                photoUrl={editingCoord.photo || ''}
                onChange={(url) => setEditingCoord({ ...editingCoord, photo: url })}
                label="Coordinator Profile Photo"
              />

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525266] hover:text-[#090814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Coordinator'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
