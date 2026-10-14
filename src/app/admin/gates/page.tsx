'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  MapPin,
  Plus,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  Edit,
  Save,
  X,
  QrCode,
  ShieldCheck,
} from 'lucide-react';
import { GateItem } from '@/lib/types';

export default function AdminGatesPage() {
  const [gates, setGates] = useState<GateItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newGateName, setNewGateName] = useState('');
  const [newGateCode, setNewGateCode] = useState('');
  const [newGateDesc, setNewGateDesc] = useState('');
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const fetchGates = () => {
    fetch('/api/admin/gates')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setGates(data.gates);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchGates();
  }, []);

  const handleCreateGate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newGateName.trim() || !newGateCode.trim()) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/gates', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: newGateName.trim(),
          code: newGateCode.trim().toUpperCase(),
          description: newGateDesc.trim(),
          isActive: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        setGates(data.gates);
        setShowAddModal(false);
        setNewGateName('');
        setNewGateCode('');
        setNewGateDesc('');
        setMsg('New gate checkpoint created successfully!');
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to create gate');
      }
    } catch (e: any) {
      alert('Network error creating gate');
    } finally {
      setSaving(false);
    }
  };

  const handleToggleGate = async (gate: GateItem) => {
    try {
      const res = await fetch('/api/admin/gates', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: gate.id,
          updates: { isActive: !gate.isActive },
        }),
      });
      const data = await res.json();
      if (data.success) {
        setGates(data.gates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteGate = async (gateId: string) => {
    if (!confirm('Are you sure you want to delete this checkpoint gate?')) return;
    try {
      const res = await fetch(`/api/admin/gates?id=${gateId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setGates(data.gates);
      }
    } catch (e) {
      console.error(e);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Checkpoint Gates...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest mb-2">
            <MapPin className="w-3.5 h-3.5" />
            <span>CAMPUS PERIMETER CONTROL</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Festival Entry Gates Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Configure campus checkpoints for Cultural, Sports, and VIP security validation.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/entry"
            target="_blank"
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Entry Gate Station</span>
          </Link>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Checkpoint Gate</span>
          </button>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          <span>{msg}</span>
        </div>
      )}

      {/* Gates Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {gates.map((g) => (
          <div
            key={g.id}
            className={`p-5 rounded-2xl bg-white border shadow-sm flex flex-col justify-between transition ${
              g.isActive ? 'border-gray-200' : 'border-gray-200 opacity-60'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-gray-100 text-gray-700">
                  {g.code}
                </span>
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                    g.isActive
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-gray-100 text-gray-500'
                  }`}
                >
                  {g.isActive ? 'ACTIVE' : 'INACTIVE'}
                </span>
              </div>

              <h2 className="font-bold text-gray-900 text-base leading-snug">{g.name}</h2>
              <p className="text-xs text-gray-500 mt-1 line-clamp-2">{g.description || 'No checkpoint description set.'}</p>
            </div>

            <div className="mt-4 pt-3 border-t border-gray-100 flex items-center justify-between">
              <button
                onClick={() => handleToggleGate(g)}
                className={`text-xs font-semibold px-2.5 py-1 rounded-lg transition ${
                  g.isActive ? 'bg-amber-50 text-amber-800 hover:bg-amber-100' : 'bg-emerald-50 text-emerald-800 hover:bg-emerald-100'
                }`}
              >
                {g.isActive ? 'Deactivate' : 'Activate'}
              </button>

              <div className="flex items-center gap-1">
                <Link
                  href={`/entry?gateId=${g.id}`}
                  className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium"
                  title="Launch Station for this Gate"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </Link>
                <button
                  onClick={() => handleDeleteGate(g.id)}
                  className="p-1.5 rounded-lg hover:bg-rose-50 text-gray-400 hover:text-rose-600 transition"
                  title="Delete Gate"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Add Gate Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-bold text-lg text-gray-900">Add Checkpoint Gate</h3>
              <button onClick={() => setShowAddModal(false)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateGate} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Gate Name</label>
                <input
                  type="text"
                  required
                  value={newGateName}
                  onChange={(e) => setNewGateName(e.target.value)}
                  placeholder="e.g. North Hostel & Sports Gate"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Gate Code</label>
                <input
                  type="text"
                  required
                  value={newGateCode}
                  onChange={(e) => setNewGateCode(e.target.value)}
                  placeholder="e.g. GATE-05"
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600 font-mono uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-gray-700 mb-1">Description / Location</label>
                <textarea
                  rows={2}
                  value={newGateDesc}
                  onChange={(e) => setNewGateDesc(e.target.value)}
                  placeholder="Access point instructions..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50"
                >
                  {saving ? 'Creating...' : 'Create Gate'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
