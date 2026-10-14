'use client';

import React, { useState, useEffect } from 'react';
import {
  Award,
  Plus,
  ExternalLink,
  CheckCircle,
  Edit2,
  Trash2,
  Globe,
} from 'lucide-react';

export default function SponsorsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingSponsor, setEditingSponsor] = useState<any>(null);
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
      const isNew = !editingSponsor.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'sponsors',
          id: editingSponsor.id,
          item: editingSponsor,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Sponsor added' : 'Sponsor updated');
        setModalOpen(false);
        setEditingSponsor(null);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove sponsor?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'sponsors',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Sponsor removed');
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

  const sponsors = data.sponsors || [];

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
          <div className="flex items-center gap-2 text-[#FFC857] text-xs font-bold uppercase tracking-wider mb-1">
            <Award className="w-4 h-4 text-[#D97706]" />
            <span className="text-[#D97706]">Corporate Alliances</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Sponsors & Partners ({sponsors.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Title sponsors, powered-by brands, beverage partners, and media partners.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingSponsor({
              name: '',
              tier: 'ASSOCIATE',
              logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?q=80&w=400&auto=format&fit=crop',
              url: 'https://rvrjcce.ac.in',
              order: sponsors.length + 1,
              published: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Brand Partner</span>
        </button>
      </div>

      {/* Sponsors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sponsors.length === 0 ? (
          <div className="col-span-3 p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Award className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <h3 className="text-sm font-bold text-[#090814] uppercase tracking-wider">PARTNERS TO BE ANNOUNCED</h3>
            <p className="text-xs text-[#525266] mt-1 max-w-md mx-auto">
              Per official guidelines, no unverified brands are displayed. Add confirmed brand partners using the button above.
            </p>
          </div>
        ) : (
          sponsors.map((s: any) => (
            <div
              key={s.id}
              className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 shadow-xs hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-50 text-amber-700 border border-amber-200">
                    {s.tier} PARTNER
                  </span>
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      s.published ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-500 bg-gray-100 border border-gray-200'
                    }`}
                  >
                    {s.published ? 'Published' : 'Draft'}
                  </span>
                </div>

                <div className="h-24 bg-gray-50 rounded-xl p-4 flex items-center justify-center border border-gray-100">
                  <img src={s.logo} alt={s.name} className="max-h-full max-w-full object-contain" />
                </div>

                <div>
                  <h3 className="text-base font-black text-[#090814] font-display">{s.name}</h3>
                  {s.url && (
                    <a
                      href={s.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-[#525266] hover:text-[#5227FF] flex items-center gap-1 mt-1 transition-colors"
                    >
                      <Globe className="w-3.5 h-3.5" />
                      <span className="truncate">{s.url}</span>
                    </a>
                  )}
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingSponsor(s);
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
      {modalOpen && editingSponsor && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingSponsor.id ? 'Edit Sponsor' : 'Add Brand Partner'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Company / Brand Name</label>
                <input
                  type="text"
                  required
                  value={editingSponsor.name}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Partnership Tier</label>
                  <select
                    value={editingSponsor.tier}
                    onChange={(e) => setEditingSponsor({ ...editingSponsor, tier: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="TITLE">TITLE PARTNER</option>
                    <option value="POWERED_BY">POWERED BY</option>
                    <option value="ASSOCIATE">ASSOCIATE SPONSOR</option>
                    <option value="MEDIA">MEDIA PARTNER</option>
                    <option value="BEVERAGE">BEVERAGE PARTNER</option>
                  </select>
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Display Order</label>
                  <input
                    type="number"
                    value={editingSponsor.order}
                    onChange={(e) => setEditingSponsor({ ...editingSponsor, order: Number(e.target.value) })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Logo URL</label>
                <input
                  type="url"
                  required
                  value={editingSponsor.logo}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, logo: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Website URL</label>
                <input
                  type="url"
                  value={editingSponsor.url}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, url: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubSponsor"
                  checked={editingSponsor.published}
                  onChange={(e) => setEditingSponsor({ ...editingSponsor, published: e.target.checked })}
                  className="rounded text-[#5227FF] focus:ring-0"
                />
                <label htmlFor="pubSponsor" className="text-xs font-bold text-[#090814]">
                  Publish to Public Partners Section
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
                  {saving ? 'Saving...' : 'Save Sponsor'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
