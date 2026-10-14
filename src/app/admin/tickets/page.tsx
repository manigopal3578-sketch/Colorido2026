'use client';

import React, { useState, useEffect } from 'react';
import {
  QrCode,
  Search,
  CheckCircle,
  XCircle,
  ExternalLink,
} from 'lucide-react';
import Link from 'next/link';

export default function TicketsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'VALID' | 'USED' | 'CANCELLED'>('ALL');
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

  const handleToggleStatus = async (ticketId: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'VALID' ? 'CANCELLED' : 'VALID';
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'UPDATE',
          collection: 'tickets',
          id: ticketId,
          item: { status: nextStatus },
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(`Ticket ${ticketId} marked as ${nextStatus}`);
        fetchData();
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const tickets = data.tickets || [];

  const filtered = tickets.filter((t: any) => {
    const matchesSearch =
      search === '' ||
      t.id.toLowerCase().includes(search.toLowerCase()) ||
      t.registrationId.toLowerCase().includes(search.toLowerCase()) ||
      t.participantName.toLowerCase().includes(search.toLowerCase()) ||
      t.eventTitle.toLowerCase().includes(search.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || t.status === statusFilter;
    return matchesSearch && matchesStatus;
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
            <QrCode className="w-4 h-4" />
            <span>Digital Credential Issuance</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Festival Passes & Tickets ({tickets.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Cryptographically verifiable QR access passes issued to registered delegates.
          </p>
        </div>

        <Link
          href="/admin/checkin"
          className="px-4 py-2.5 bg-[#5227FF] hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-start md:self-center shadow-sm"
        >
          <QrCode className="w-4 h-4" />
          <span>Launch QR Scanner Desk</span>
        </Link>
      </div>

      {/* Controls */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search ticket code, reg ID, delegate..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          {(['ALL', 'VALID', 'USED', 'CANCELLED'] as const).map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                statusFilter === status
                  ? 'bg-[#090814] text-white shadow-xs'
                  : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-[#717188] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-4">Pass Code</th>
                <th className="py-3.5 px-4">Delegate</th>
                <th className="py-3.5 px-4">Event & Venue</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Pass Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#717188] font-semibold">
                    No tickets found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((t: any) => {
                  const isValid = t.status === 'VALID';
                  const isUsed = t.status === 'USED';

                  return (
                    <tr key={t.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-mono font-bold text-[#090814]">
                        <div className="flex items-center gap-2">
                          <QrCode className="w-4 h-4 text-[#5227FF]" />
                          <span>{t.id}</span>
                        </div>
                        <span className="text-[10px] text-[#717188] font-normal">Reg: {t.registrationId}</span>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#090814]">{t.participantName}</p>
                        <p className="text-[10px] text-[#717188] truncate max-w-xs">{t.collegeName}</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <p className="font-bold text-[#090814]">{t.eventTitle}</p>
                        <p className="text-[10px] text-[#717188]">{t.venueName} • {t.date} ({t.time})</p>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className="px-2 py-0.5 rounded text-[10px] font-black uppercase text-white"
                          style={{ backgroundColor: t.category === 'cultural' ? '#FF2E93' : '#FF5E3A' }}
                        >
                          {t.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                            isUsed
                              ? 'bg-blue-100 text-blue-800'
                              : isValid
                              ? 'bg-emerald-100 text-emerald-800'
                              : 'bg-red-100 text-red-800'
                          }`}
                        >
                          {isUsed ? <CheckCircle className="w-3 h-3" /> : isValid ? <CheckCircle className="w-3 h-3" /> : <XCircle className="w-3 h-3" />}
                          {t.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <Link
                            href={`/ticket/${t.registrationId}`}
                            target="_blank"
                            className="p-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-[#090814] transition-colors border border-gray-200"
                            title="Open digital pass"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Link>
                          {t.status !== 'USED' && (
                            <button
                              onClick={() => handleToggleStatus(t.id, t.status)}
                              className={`px-2.5 py-1 rounded-lg text-[10px] font-bold ${
                                isValid
                                  ? 'bg-red-100 text-red-700 hover:bg-red-200'
                                  : 'bg-emerald-100 text-emerald-700 hover:bg-emerald-200'
                              }`}
                            >
                              {isValid ? 'Revoke' : 'Reactivate'}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
