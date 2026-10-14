'use client';

import React, { useState, useEffect } from 'react';
import {
  Mic,
  Plus,
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Eye,
  EyeOff,
  Edit2,
  Trash2,
  AlertCircle,
} from 'lucide-react';

export default function SpeakersAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSpeaker, setEditingSpeaker] = useState<any>(null);
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
      const isNew = !editingSpeaker.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'speakersPerformers',
          id: editingSpeaker.id,
          item: editingSpeaker,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Speaker/Guest created' : 'Speaker/Guest updated');
        setModalOpen(false);
        setEditingSpeaker(null);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove speaker/guest profile?')) return;
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
  const speakers = allItems.filter((s: any) => s.type === 'SPEAKER' || s.type === 'CELEBRITY_GUEST');

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
            <Mic className="w-4 h-4" />
            <span>Keynotes & Dignitaries</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Speakers & Guests ({speakers.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Manage keynotes, honorary chief guests, and panel moderators. Only confirmed guests are published.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSpeaker({
              name: '',
              role: 'Chief Guest / Keynote',
              type: 'SPEAKER',
              bio: '',
              photo: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=800&auto=format&fit=crop',
              sessionTitle: 'COLORIDO 2K26 Inauguration Address',
              date: '2026-12-28',
              time: '10:00 AM',
              venue: 'Silver Jubilee Main Auditorium',
              published: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Speaker / Guest</span>
        </button>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {speakers.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Mic className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#090814] uppercase tracking-wider">GUESTS TO BE ANNOUNCED</h3>
            <p className="text-xs text-[#525266] mt-1 max-w-md mx-auto">
              Per official protocol, only confirmed dignitaries are displayed publicly. Add official guests using the button above.
            </p>
          </div>
        ) : (
          speakers.map((s: any) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                <div className="h-44 relative bg-gray-100">
                  <img src={s.photo} alt={s.name} className="w-full h-full object-cover" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
                  <span className="absolute top-3 left-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-sm border border-white/20">
                    {s.type}
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                      s.published ? 'bg-emerald-600 text-white' : 'bg-gray-700 text-gray-200'
                    }`}
                  >
                    {s.published ? 'Published' : 'Hidden'}
                  </span>
                </div>

                <div className="p-5 space-y-3">
                  <div>
                    <h3 className="text-base font-black text-[#090814] font-display">{s.name}</h3>
                    <p className="text-xs text-[#5227FF] font-semibold">{s.role}</p>
                  </div>

                  <div className="p-3 bg-gray-50 rounded-xl border border-gray-100 text-xs text-[#525266] space-y-1">
                    <p className="font-bold text-[#090814]">{s.sessionTitle}</p>
                    <p className="text-[#525266] text-[11px] flex items-center gap-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#5227FF]" />
                      {s.date} • {s.time}
                    </p>
                    <p className="text-[#525266] text-[11px] flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
                      {s.venue}
                    </p>
                  </div>

                  {s.bio && <p className="text-xs text-[#717188] line-clamp-2 leading-relaxed">{s.bio}</p>}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingSpeaker(s);
                    setModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit</span>
                </button>

                <button
                  onClick={() => handleDelete(s.id)}
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
      {modalOpen && editingSpeaker && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingSpeaker.id ? 'Edit Speaker' : 'Add Speaker / Guest'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Speaker Name</label>
                <input
                  type="text"
                  required
                  value={editingSpeaker.name}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Role / Designation</label>
                  <input
                    type="text"
                    required
                    value={editingSpeaker.role}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, role: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Guest Classification</label>
                  <select
                    value={editingSpeaker.type}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="SPEAKER">Keynote Speaker</option>
                    <option value="CELEBRITY_GUEST">Celebrity / Honorary Guest</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Session / Address Title</label>
                <input
                  type="text"
                  required
                  value={editingSpeaker.sessionTitle}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, sessionTitle: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Date</label>
                  <input
                    type="date"
                    value={editingSpeaker.date}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Time</label>
                  <input
                    type="text"
                    value={editingSpeaker.time}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, time: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Venue</label>
                  <input
                    type="text"
                    value={editingSpeaker.venue}
                    onChange={(e) => setEditingSpeaker({ ...editingSpeaker, venue: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editingSpeaker.photo}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, photo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="publishedCheck"
                  checked={editingSpeaker.published}
                  onChange={(e) => setEditingSpeaker({ ...editingSpeaker, published: e.target.checked })}
                  className="rounded text-[#5227FF] focus:ring-0"
                />
                <label htmlFor="publishedCheck" className="text-xs font-bold text-[#090814]">
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
                  className="px-4 py-2 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-xs"
                >
                  {saving ? 'Saving...' : 'Save Speaker'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
