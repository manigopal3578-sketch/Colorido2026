'use client';

import React, { useState, useEffect } from 'react';
import {
  UserCog,
  Plus,
  Mail,
  CheckCircle,
  Edit2,
  Trash2,
} from 'lucide-react';
import { AdminPhotoPicker } from '@/components/admin/AdminPhotoPicker';

export default function OrganizersAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingOrg, setEditingOrg] = useState<any>(null);
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
      const isNew = !editingOrg.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'organizers',
          id: editingOrg.id,
          item: editingOrg,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Organizer added successfully' : 'Organizer updated successfully');
        setModalOpen(false);
        setEditingOrg(null);
        fetchData();
      } else {
        showToast(resJson.message || 'Error saving organizer', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this festival organizer profile?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'organizers',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Organizer removed');
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

  const organizers = data.organizers || [];

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
            <UserCog className="w-4 h-4" />
            <span>Festival Executive Committee</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Festival Organizers & Conveners
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Key faculty chairpersons, chief patrons, and conveners overseeing COLORIDO 2K26.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingOrg({
              organizerId: `CLR26-ORG-${Date.now().toString().slice(-4)}`,
              name: '',
              role: 'ADMIN',
              email: '',
              phone: '+91 863 2288201',
              photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
              status: 'ACTIVE',
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Organizer</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {organizers.map((org: any) => (
          <div
            key={org.id}
            className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all flex flex-col justify-between"
          >
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <img
                  src={org.photo}
                  alt={org.name}
                  className="w-14 h-14 rounded-2xl object-cover border border-gray-200 shrink-0"
                />
                <div>
                  <span className="text-[10px] font-mono text-[#5227FF] font-bold block">
                    {org.organizerId}
                  </span>
                  <h3 className="text-base font-black text-[#090814] font-display">
                    {org.name}
                  </h3>
                  <span className="inline-block mt-0.5 px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-gray-100 text-[#525266] border border-gray-200">
                    {org.role}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 text-xs text-[#525266]">
                <p className="flex items-center gap-2 truncate">
                  <Mail className="w-3.5 h-3.5 text-[#5227FF] shrink-0" />
                  <span>{org.email}</span>
                </p>
                {org.phone && (
                  <p className="flex items-center gap-2 font-mono text-[#717188]">
                    <span>Phone:</span>
                    <span>{org.phone}</span>
                  </p>
                )}
              </div>
            </div>

            <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => {
                  setEditingOrg(org);
                  setModalOpen(true);
                }}
                className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(org.id)}
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
      {modalOpen && editingOrg && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingOrg.id ? 'Edit Organizer' : 'Add Organizer'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={editingOrg.name}
                  onChange={(e) => setEditingOrg({ ...editingOrg, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Role</label>
                  <select
                    value={editingOrg.role}
                    onChange={(e) => setEditingOrg({ ...editingOrg, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="ADMIN">ADMIN</option>
                    <option value="EVENT_MANAGER">EVENT_MANAGER</option>
                    <option value="COORDINATOR">COORDINATOR</option>
                    <option value="CHECK_IN_STAFF">CHECK_IN_STAFF</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Organizer ID</label>
                  <input
                    type="text"
                    required
                    value={editingOrg.organizerId}
                    onChange={(e) => setEditingOrg({ ...editingOrg, organizerId: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Email</label>
                <input
                  type="email"
                  required
                  value={editingOrg.email}
                  onChange={(e) => setEditingOrg({ ...editingOrg, email: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <AdminPhotoPicker
                photoUrl={editingOrg.photo || ''}
                onChange={(url) => setEditingOrg({ ...editingOrg, photo: url })}
                label="Organizer Profile Photo"
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
                  {saving ? 'Saving...' : 'Save Organizer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
