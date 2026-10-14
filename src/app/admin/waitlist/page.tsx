'use client';

import React, { useState, useEffect } from 'react';
import {
  Hourglass,
  CheckCircle,
  Search,
} from 'lucide-react';

export default function WaitlistAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
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

  const handlePromote = async (regId: string) => {
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE',
          collection: 'registrations',
          id: regId,
          item: { status: 'CONFIRMED' },
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Registration promoted from waitlist to CONFIRMED');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const handleReject = async (regId: string) => {
    if (!confirm('Reject this waitlisted entry?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE',
          collection: 'registrations',
          id: regId,
          item: { status: 'CANCELLED' },
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Waitlist entry rejected');
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

  const registrations = data.registrations || [];
  const waitlisted = registrations.filter((r: any) => r.status === 'WAITLIST');

  const filtered = waitlisted.filter((r: any) => {
    return (
      search === '' ||
      r.participantName.toLowerCase().includes(search.toLowerCase()) ||
      r.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.collegeName.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase())
    );
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
          <div className="flex items-center gap-2 text-amber-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Hourglass className="w-4 h-4" />
            <span>Capacity & Overfill Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Waitlist Queue ({waitlisted.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Participants queued when stage quotas or tournament slot maximums are reached.
          </p>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter waitlist by applicant or event..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
        />
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-[#717188] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-4">Applicant</th>
                <th className="py-3.5 px-4">Queued Event</th>
                <th className="py-3.5 px-4">College</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Queued Time</th>
                <th className="py-3.5 px-4 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-gray-400">
                    <Hourglass className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="font-bold text-[#090814] text-sm">Waitlist queue is empty.</p>
                    <p className="text-xs text-[#717188] mt-0.5">All registered participants have confirmed seats.</p>
                  </td>
                </tr>
              ) : (
                filtered.map((w: any) => (
                  <tr key={w.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#090814]">{w.participantName}</p>
                      <p className="text-[10px] text-[#717188] font-mono">{w.id}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#090814]">
                      {w.eventTitle}
                    </td>
                    <td className="py-3.5 px-4 text-[#525266] truncate max-w-xs font-medium">
                      {w.collegeName}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#525266]">
                      <p className="text-[#090814] font-semibold">{w.email}</p>
                      <p className="text-[#717188]">{w.phone}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[11px] text-[#717188]">
                      {new Date(w.createdAt).toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handlePromote(w.id)}
                          className="px-3 py-1.5 bg-emerald-100 hover:bg-emerald-200 text-emerald-800 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Confirm & Issue Pass
                        </button>
                        <button
                          onClick={() => handleReject(w.id)}
                          className="px-2.5 py-1.5 bg-red-100 hover:bg-red-200 text-red-800 rounded-lg text-[10px] font-bold transition-colors"
                        >
                          Reject
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
