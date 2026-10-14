'use client';

import React, { useState, useEffect } from 'react';
import {
  Music,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Edit2,
  Trash2,
  Sparkles,
} from 'lucide-react';

export default function PerformersAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingPerformer, setEditingPerformer] = useState<any>(null);
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
      const isNew = !editingPerformer.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'speakersPerformers',
          id: editingPerformer.id,
          item: editingPerformer,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Performer profile created' : 'Performer profile updated');
        setModalOpen(false);
        setEditingPerformer(null);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove performer profile?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'speakersPerformers',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Profile removed');
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

  const allItems = data.speakersPerformers || [];
  const performers = allItems.filter((s: any) => s.type === 'PERFORMER');

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
          <div className="flex items-center gap-2 text-[#FF2E93] text-xs font-bold uppercase tracking-wider mb-1">
            <Music className="w-4 h-4" />
            <span>Pro-Shows & Headliners</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Performers & Artists ({performers.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Celebrity acts, rock bands, classical troupes, and EDM artists headlining the festival nights.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingPerformer({
              name: '',
              role: 'Headlining Musical Act',
              type: 'PERFORMER',
              bio: '',
              photo: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=800&auto=format&fit=crop',
              sessionTitle: 'Mega Pro-Night Live Concert',
              date: '2026-12-29',
              time: '07:30 PM',
              venue: 'Open Air Mega Amphitheatre',
              published: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#FF2E93] hover:bg-[#e0247f] text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Headliner / Performer</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {performers.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Music className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#090814] uppercase tracking-wider">HEADLINERS TO BE ANNOUNCED</h3>
            <p className="text-xs text-[#525266] mt-1 max-w-md mx-auto">
              Per official protocol, only finalized contracts and artist bookings are released. Add confirmed performers using the button above.
            </p>
          </div>
        ) : (
          performers.map((p: any) => (
            <div
              key={p.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 relative bg-gray-100">
                  <img src={p.photo} alt={p.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-[#FF2E93] text-white">
                    PRO-SHOW ACT
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      p.published ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {p.published ? 'Published' : 'Hidden'}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-[#090814] font-display">{p.name}</h3>
                    <p className="text-xs text-[#FF2E93] font-semibold">{p.role}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-[#525266] space-y-1">
                    <p className="font-bold text-[#090814]">{p.sessionTitle}</p>
                    <p className="text-[#525266] text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5227FF]" />
                      {p.date} • {p.time}
                    </p>
                    <p className="text-[#525266] text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
                      {p.venue}
                    </p>
                  </div>

                  {p.bio && <p className="text-xs text-[#717188] line-clamp-2 leading-relaxed">{p.bio}</p>}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingPerformer(p);
                    setModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#FF2E93] hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(p.id)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal */}
      {modalOpen && editingPerformer && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingPerformer.id ? 'Edit Performer' : 'Add Performer / Artist'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Artist / Band Name</label>
                <input
                  type="text"
                  required
                  value={editingPerformer.name}
                  onChange={(e) => setEditingPerformer({ ...editingPerformer, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Performance Title</label>
                <input
                  type="text"
                  required
                  value={editingPerformer.sessionTitle}
                  onChange={(e) => setEditingPerformer({ ...editingPerformer, sessionTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingPerformer.date}
                    onChange={(e) => setEditingPerformer({ ...editingPerformer, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Time</label>
                  <input
                    type="text"
                    value={editingPerformer.time}
                    onChange={(e) => setEditingPerformer({ ...editingPerformer, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Venue</label>
                  <input
                    type="text"
                    value={editingPerformer.venue}
                    onChange={(e) => setEditingPerformer({ ...editingPerformer, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editingPerformer.photo}
                  onChange={(e) => setEditingPerformer({ ...editingPerformer, photo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Bio / Accolades</label>
                <textarea
                  rows={2}
                  value={editingPerformer.bio}
                  onChange={(e) => setEditingPerformer({ ...editingPerformer, bio: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#FF2E93]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubCheckPerformer"
                  checked={editingPerformer.published}
                  onChange={(e) => setEditingPerformer({ ...editingPerformer, published: e.target.checked })}
                  className="rounded text-[#FF2E93] focus:ring-0"
                />
                <label htmlFor="pubCheckPerformer" className="text-xs font-bold text-[#090814]">
                  Publish to Public Website
                </label>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525266] hover:bg-gray-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-xl bg-[#FF2E93] hover:bg-[#e0247f] text-white text-xs font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Performer'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
