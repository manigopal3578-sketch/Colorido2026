'use client';

import React, { useState, useEffect } from 'react';
import {
  Bell,
  Plus,
  Pin,
  CheckCircle,
  AlertTriangle,
  Info,
  Clock,
  Edit2,
  Trash2,
} from 'lucide-react';

export default function AnnouncementsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingAnn, setEditingAnn] = useState<any>(null);
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
      const isNew = !editingAnn.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'announcements',
          id: editingAnn.id,
          item: editingAnn,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Announcement posted' : 'Announcement updated');
        setModalOpen(false);
        setEditingAnn(null);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this announcement bulletin?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'announcements',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Announcement removed');
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

  const announcements = data.announcements || [];

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
            <Bell className="w-4 h-4" />
            <span>Festival Flash Broadcasts</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Announcements & Bulletins ({announcements.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Broadcast emergency alerts, schedule revisions, deadline reminders, and spot registration notices.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingAnn({
              title: '',
              content: '',
              type: 'IMPORTANT',
              published: true,
              pinned: false,
              date: new Date().toISOString().slice(0, 10),
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>New Announcement</span>
        </button>
      </div>

      {/* List */}
      <div className="space-y-3">
        {announcements.map((ann: any) => (
          <div
            key={ann.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col md:flex-row md:items-center justify-between gap-4 ${
              ann.pinned
                ? 'bg-purple-50/50 border-[#5227FF]/40 shadow-xs'
                : 'bg-white border-gray-200 shadow-xs hover:shadow-md'
            }`}
          >
            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2">
                <span
                  className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                    ann.type === 'ALERT'
                      ? 'bg-red-50 text-red-700 border border-red-200'
                      : ann.type === 'IMPORTANT'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-blue-50 text-blue-700 border border-blue-200'
                  }`}
                >
                  {ann.type}
                </span>

                {ann.pinned && (
                  <span className="flex items-center gap-1 text-[10px] font-bold text-amber-600">
                    <Pin className="w-3 h-3 fill-current" />
                    Pinned
                  </span>
                )}

                <span className="text-[11px] text-[#717188] font-mono">
                  {ann.date}
                </span>

                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    ann.published ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-500 bg-gray-100 border border-gray-200'
                  }`}
                >
                  {ann.published ? 'Live on Site' : 'Draft'}
                </span>
              </div>

              <h3 className="text-sm font-black text-[#090814]">{ann.title}</h3>
              <p className="text-xs text-[#525266] max-w-3xl leading-relaxed">{ann.content}</p>
            </div>

            <div className="flex items-center gap-2 self-end md:self-center shrink-0">
              <button
                onClick={() => {
                  setEditingAnn(ann);
                  setModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#5227FF] text-xs font-bold transition-colors flex items-center gap-1.5"
              >
                <Edit2 className="w-3.5 h-3.5" />
                <span>Edit</span>
              </button>

              <button
                onClick={() => handleDelete(ann.id)}
                className="p-1.5 rounded-xl text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && editingAnn && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingAnn.id ? 'Edit Announcement' : 'Post New Announcement'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Headline</label>
                <input
                  type="text"
                  required
                  value={editingAnn.title}
                  onChange={(e) => setEditingAnn({ ...editingAnn, title: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  placeholder="e.g. Spot Registrations Open at Admin Desk"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Alert Level</label>
                  <select
                    value={editingAnn.type}
                    onChange={(e) => setEditingAnn({ ...editingAnn, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="INFO">INFO</option>
                    <option value="IMPORTANT">IMPORTANT</option>
                    <option value="ALERT">ALERT / URGENT</option>
                    <option value="DEADLINE">DEADLINE</option>
                    <option value="UPDATE">UPDATE</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Display Date</label>
                  <input
                    type="date"
                    value={editingAnn.date}
                    onChange={(e) => setEditingAnn({ ...editingAnn, date: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Announcement Body</label>
                <textarea
                  rows={4}
                  required
                  value={editingAnn.content}
                  onChange={(e) => setEditingAnn({ ...editingAnn, content: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center gap-6">
                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-[#090814]">
                  <input
                    type="checkbox"
                    checked={editingAnn.published}
                    onChange={(e) => setEditingAnn({ ...editingAnn, published: e.target.checked })}
                    className="rounded text-[#5227FF] focus:ring-0"
                  />
                  <span>Live on Public Website</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer text-xs font-bold text-amber-700">
                  <input
                    type="checkbox"
                    checked={editingAnn.pinned}
                    onChange={(e) => setEditingAnn({ ...editingAnn, pinned: e.target.checked })}
                    className="rounded text-amber-500 focus:ring-0"
                  />
                  <span>Pin to Top Banner</span>
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
                  {saving ? 'Saving...' : 'Save Announcement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
