'use client';

import React, { useState, useEffect } from 'react';
import {
  HelpCircle,
  Plus,
  CheckCircle,
  Edit2,
  Trash2,
  Search,
} from 'lucide-react';

export default function FaqAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<any>(null);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
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
      const isNew = !editingFaq.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'faqs',
          id: editingFaq.id,
          item: editingFaq,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'FAQ added' : 'FAQ updated');
        setModalOpen(false);
        setEditingFaq(null);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Remove this FAQ item?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'faqs',
          id,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('FAQ removed');
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

  const faqs = data.faqs || [];

  const filtered = faqs.filter((f: any) => {
    const matchesSearch =
      f.question.toLowerCase().includes(search.toLowerCase()) ||
      f.answer.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = categoryFilter === 'ALL' || f.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const categories = ['ALL', 'Registration', 'Events', 'Teams', 'Tickets', 'Venues', 'Schedule', 'Accommodation', 'General'];

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
            <HelpCircle className="w-4 h-4" />
            <span>Knowledge Base Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            FAQ Management ({faqs.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Maintain public answers for rules, dates, accommodation, team rosters, and ticketing.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingFaq({
              question: '',
              answer: '',
              category: 'Registration',
              published: true,
              order: faqs.length + 1,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-xs self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add FAQ</span>
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search FAQs..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                categoryFilter === cat
                  ? 'bg-[#5227FF] text-white shadow-xs'
                  : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* FAQs List */}
      <div className="space-y-3">
        {filtered.map((faq: any) => (
          <div
            key={faq.id}
            className="p-5 bg-white border border-gray-200 hover:shadow-md rounded-2xl transition-all flex flex-col md:flex-row md:items-start justify-between gap-4 shadow-xs"
          >
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-[#5227FF] border border-purple-200">
                  {faq.category}
                </span>
                <span
                  className={`px-2 py-0.5 rounded text-[9px] font-bold ${
                    faq.published ? 'text-emerald-700 bg-emerald-50 border border-emerald-200' : 'text-gray-500 bg-gray-100 border border-gray-200'
                  }`}
                >
                  {faq.published ? 'Live on Site' : 'Draft'}
                </span>
              </div>

              <h3 className="text-sm font-black text-[#090814]">{faq.question}</h3>
              <p className="text-xs text-[#525266] leading-relaxed max-w-3xl">{faq.answer}</p>
            </div>

            <div className="flex items-center gap-2 shrink-0 self-end md:self-start">
              <button
                onClick={() => {
                  setEditingFaq(faq);
                  setModalOpen(true);
                }}
                className="p-2 rounded-xl bg-gray-50 hover:bg-gray-100 border border-gray-200 text-[#5227FF] text-xs font-bold transition-colors"
              >
                <Edit2 className="w-3.5 h-3.5" />
              </button>

              <button
                onClick={() => handleDelete(faq.id)}
                className="p-2 rounded-xl bg-gray-50 hover:bg-red-50 border border-gray-200 text-red-600 hover:text-red-700 transition-colors"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* Modal */}
      {modalOpen && editingFaq && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingFaq.id ? 'Edit FAQ' : 'Add FAQ'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">✕</button>
            </div>

            <form onSubmit={handleSave} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Question</label>
                <input
                  type="text"
                  required
                  value={editingFaq.question}
                  onChange={(e) => setEditingFaq({ ...editingFaq, question: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Category</label>
                <select
                  value={editingFaq.category}
                  onChange={(e) => setEditingFaq({ ...editingFaq, category: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                >
                  {categories.filter((c) => c !== 'ALL').map((c) => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Answer</label>
                <textarea
                  rows={4}
                  required
                  value={editingFaq.answer}
                  onChange={(e) => setEditingFaq({ ...editingFaq, answer: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="pubFaq"
                  checked={editingFaq.published}
                  onChange={(e) => setEditingFaq({ ...editingFaq, published: e.target.checked })}
                  className="rounded text-[#5227FF] focus:ring-0"
                />
                <label htmlFor="pubFaq" className="text-xs font-bold text-[#090814]">
                  Visible in Public FAQ Section
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
                  {saving ? 'Saving...' : 'Save FAQ'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
