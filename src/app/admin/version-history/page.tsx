'use client';

import React, { useState, useEffect } from 'react';
import {
  History,
  RotateCcw,
  Plus,
  CheckCircle,
  Clock,
  Shield,
  FileCode,
  AlertTriangle,
} from 'lucide-react';

export default function VersionHistoryAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [snapshotTarget, setSnapshotTarget] = useState<'HOMEPAGE' | 'FESTIVAL_SETTINGS'>('HOMEPAGE');
  const [snapshotSummary, setSnapshotSummary] = useState('');
  const [creating, setCreating] = useState(false);
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

  const handleCreateSnapshot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!snapshotSummary) return;

    setCreating(true);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE_SNAPSHOT',
          target: snapshotTarget,
          summary: snapshotSummary,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Snapshot checkpoint created');
        setSnapshotSummary('');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setCreating(false);
    }
  };

  const handleRestore = async (versionId: string) => {
    if (!confirm(`Are you sure you want to rollback to checkpoint ${versionId}? Current state will be replaced.`)) {
      return;
    }

    setRestoringId(versionId);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'RESTORE_VERSION',
          versionId,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(resJson.message);
        fetchData();
      } else {
        showToast(resJson.message || 'Rollback failed', 'error');
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    } finally {
      setRestoringId(null);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const versions = data.versionHistory || [];

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
          <History className="w-4 h-4" />
          <span>Immutable Audit & Recovery</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
          Version History & Rollback ({versions.length})
        </h1>
        <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
          Automatic snapshots created on every homepage and settings edit. One-click rollback restores festival states.
        </p>
      </div>

      {/* Create Manual Checkpoint */}
      <div className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs">
        <h3 className="text-sm font-black text-[#090814] mb-3">Create Safe Checkpoint</h3>
        <form onSubmit={handleCreateSnapshot} className="flex flex-col md:flex-row gap-3">
          <select
            value={snapshotTarget}
            onChange={(e: any) => setSnapshotTarget(e.target.value)}
            className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
          >
            <option value="HOMEPAGE">Homepage Config</option>
            <option value="FESTIVAL_SETTINGS">Festival Settings</option>
          </select>

          <input
            type="text"
            required
            placeholder="Summary of changes (e.g. Before Day 01 inaugurations)..."
            value={snapshotSummary}
            onChange={(e) => setSnapshotSummary(e.target.value)}
            className="flex-1 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF]"
          />

          <button
            type="submit"
            disabled={creating}
            className="px-4 py-2 bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold rounded-xl flex items-center gap-2 transition-all shadow-xs shrink-0"
          >
            <Plus className="w-4 h-4" />
            <span>{creating ? 'Saving...' : 'Save Checkpoint'}</span>
          </button>
        </form>
      </div>

      {/* Snapshots Timeline */}
      <div className="space-y-3">
        {versions.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <History className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-[#525266] text-sm font-semibold">No version snapshots recorded yet.</p>
          </div>
        ) : (
          versions.map((ver: any) => (
            <div
              key={ver.id}
              className="p-5 bg-white border border-gray-200 rounded-2xl shadow-xs hover:shadow-md transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="space-y-1.5">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-purple-50 text-[#5227FF] border border-purple-200 font-mono">
                    {ver.target} v{ver.versionNumber}
                  </span>
                  <span className="text-[11px] text-[#717188] font-mono flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#5227FF]" />
                    {new Date(ver.timestamp).toLocaleString()}
                  </span>
                  <span className="text-[11px] text-[#717188] font-semibold">
                    By {ver.actor}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-[#090814]">{ver.summary}</h3>
                <p className="text-[11px] font-mono text-[#717188]">ID: {ver.id}</p>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <button
                  onClick={() => handleRestore(ver.id)}
                  disabled={restoringId === ver.id}
                  className="px-3 py-1.5 rounded-xl bg-gray-50 hover:bg-emerald-50 border border-gray-200 text-[#090814] hover:text-emerald-700 text-xs font-bold transition-all flex items-center gap-1.5 shadow-xs"
                >
                  <RotateCcw className={`w-3.5 h-3.5 text-[#5227FF] ${restoringId === ver.id ? 'animate-spin' : ''}`} />
                  <span>{restoringId === ver.id ? 'Restoring...' : 'Rollback to this state'}</span>
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
