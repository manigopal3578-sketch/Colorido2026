'use client';

import React, { useState, useEffect } from 'react';
import {
  Activity,
  CheckCircle2,
  Users,
  Search,
  Download,
  Camera,
  Keyboard,
} from 'lucide-react';
import { generateCsvContent, downloadFile } from '@/lib/utils';
import Link from 'next/link';

export default function AttendanceAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const checkIns = data.checkIns || [];
  const totalRegistrations = data.registrations?.length || 0;
  const attendanceRate = totalRegistrations > 0 ? Math.round((checkIns.length / totalRegistrations) * 100) : 0;

  const filtered = checkIns.filter((c: any) => {
    return (
      search === '' ||
      c.participantName.toLowerCase().includes(search.toLowerCase()) ||
      c.ticketId.toLowerCase().includes(search.toLowerCase()) ||
      c.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      c.collegeName.toLowerCase().includes(search.toLowerCase()) ||
      c.staffName?.toLowerCase().includes(search.toLowerCase())
    );
  });

  const exportCsv = () => {
    const headers = ['Check-In ID', 'Ticket ID', 'Registration ID', 'Participant Name', 'College', 'Event Title', 'Timestamp', 'Staff Operator', 'Scan Mode'];
    const rows = filtered.map((c: any) => [
      c.id,
      c.ticketId,
      c.registrationId,
      c.participantName,
      c.collegeName,
      c.eventTitle,
      c.timestamp,
      c.staffName,
      c.mode,
    ]);
    const csv = generateCsvContent(headers, rows);
    downloadFile(csv, `colorido_attendance_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-emerald-600 text-xs font-bold uppercase tracking-wider mb-1">
            <Activity className="w-4 h-4" />
            <span>Gate & Arena Admissions</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Live Gate Turnout & Admissions
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Real-time admissions across Silver Jubilee auditorium, sports grounds, and outdoor arenas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={exportCsv}
            className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#090814] rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <Download className="w-4 h-4 text-[#5227FF]" />
            <span>Export Gate Log</span>
          </button>
          <Link
            href="/admin/checkin"
            className="px-4 py-2 bg-[#5227FF] hover:bg-primary-hover text-white rounded-xl text-xs font-bold flex items-center gap-2 transition-all shadow-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Open Scanner Desk</span>
          </Link>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#717188] font-bold uppercase tracking-wider block">
            Admitted Turnout
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#090814]">{checkIns.length}</span>
            <span className="text-xs text-[#525266] font-semibold">/ {totalRegistrations} total delegates</span>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#717188] font-bold uppercase tracking-wider block">
            Overall Check-In Rate
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-emerald-600">{attendanceRate}%</span>
            <span className="text-xs text-[#525266] font-semibold">capacity utilization</span>
          </div>
        </div>

        <div className="p-6 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <span className="text-[10px] text-[#717188] font-bold uppercase tracking-wider block">
            Active Gates & Desks
          </span>
          <div className="flex items-baseline gap-2 mt-1">
            <span className="text-3xl font-black text-[#5227FF]">4</span>
            <span className="text-xs text-[#525266] font-semibold">campus entry points</span>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Filter by delegate, event, ticket ID, or staff..."
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
                <th className="py-3.5 px-4">Delegate</th>
                <th className="py-3.5 px-4">Pass & Reg ID</th>
                <th className="py-3.5 px-4">Event Admission</th>
                <th className="py-3.5 px-4">Admitted At</th>
                <th className="py-3.5 px-4">Gate Staff</th>
                <th className="py-3.5 px-4">Scan Mode</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-[#717188] font-semibold">
                    No check-in admission records found matching search.
                  </td>
                </tr>
              ) : (
                filtered.map((c: any) => (
                  <tr key={c.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4">
                      <p className="font-bold text-[#090814]">{c.participantName}</p>
                      <p className="text-[10px] text-[#717188] truncate max-w-xs">{c.collegeName}</p>
                    </td>
                    <td className="py-3.5 px-4 font-mono">
                      <p className="text-[#5227FF] font-bold">{c.ticketId}</p>
                      <p className="text-[10px] text-[#717188]">{c.registrationId}</p>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-[#090814]">
                      {c.eventTitle}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-[#090814] text-[11px]">
                      {new Date(c.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-[#090814]">
                      {c.staffName}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-gray-100 text-[#090814] flex items-center gap-1 w-fit border border-gray-200">
                        {c.mode === 'CAMERA_SCAN' ? <Camera className="w-3 h-3 text-[#FF2E93]" /> : <Keyboard className="w-3 h-3 text-[#5227FF]" />}
                        {c.mode}
                      </span>
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
