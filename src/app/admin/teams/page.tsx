'use client';

import React, { useState, useEffect } from 'react';
import {
  Shield,
  Search,
  Download,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { generateCsvContent, downloadFile } from '@/lib/utils';

export default function TeamsAdminPage() {
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

  const registrations = data.registrations || [];
  const teamRegistrations = registrations.filter((r: any) => r.teamName && r.teamName.trim() !== '');

  const filtered = teamRegistrations.filter((t: any) => {
    return (
      search === '' ||
      t.teamName.toLowerCase().includes(search.toLowerCase()) ||
      t.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      t.participantName.toLowerCase().includes(search.toLowerCase()) ||
      t.collegeName.toLowerCase().includes(search.toLowerCase())
    );
  });

  const exportCsv = () => {
    const headers = ['Registration ID', 'Team Name', 'Event', 'Category', 'Captain / Leader', 'Email', 'Phone', 'College', 'Squad Size', 'Check-In Status'];
    const rows = filtered.map((t: any) => [
      t.id,
      t.teamName,
      t.eventTitle,
      t.category,
      t.participantName,
      t.email,
      t.phone,
      t.collegeName,
      1 + (t.teamMembers?.length || 0),
      t.checkInStatus,
    ]);
    const csv = generateCsvContent(headers, rows);
    downloadFile(csv, `colorido_teams_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#FF5E3A] text-xs font-bold uppercase tracking-wider mb-1">
            <Shield className="w-4 h-4" />
            <span>Squad & Team Tournaments</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Teams & Squads ({teamRegistrations.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Rosters registered for group dance, turf cricket, volleyball, relay, and band battles.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#090814] rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-start md:self-center shadow-xs"
        >
          <Download className="w-4 h-4 text-[#FF5E3A]" />
          <span>Export Teams CSV</span>
        </button>
      </div>

      {/* Search */}
      <div className="relative max-w-md">
        <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          placeholder="Search team name, tournament, or captain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
        />
      </div>

      {/* Teams Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filtered.length === 0 ? (
          <div className="col-span-2 p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Shield className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-[#525266] text-sm font-semibold">No registered teams found matching the search.</p>
          </div>
        ) : (
          filtered.map((team: any) => {
            const members = team.teamMembers || [];
            const isCheckedIn = team.checkInStatus === 'CHECKED_IN';

            return (
              <div
                key={team.id}
                className="bg-white border border-gray-200 rounded-2xl p-5 space-y-4 hover:shadow-md transition-all"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: team.category === 'cultural' ? '#FF2E93' : '#FF5E3A' }}
                      >
                        {team.category}
                      </span>
                      <span className="text-[10px] font-mono text-[#717188]">{team.id}</span>
                    </div>
                    <h3 className="text-base font-black text-[#090814] font-display mt-1">
                      {team.teamName}
                    </h3>
                    <p className="text-xs text-[#525266] font-semibold">{team.eventTitle}</p>
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider shrink-0 flex items-center gap-1 ${
                      isCheckedIn
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-gray-100 text-gray-600 border border-gray-200'
                    }`}
                  >
                    {isCheckedIn ? <CheckCircle2 className="w-3 h-3" /> : <Clock className="w-3 h-3" />}
                    {isCheckedIn ? 'Checked In' : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-gray-50 rounded-xl space-y-1.5 border border-gray-100 text-xs">
                  <div className="flex justify-between text-[#525266]">
                    <span>Captain:</span>
                    <span className="font-bold text-[#090814]">{team.participantName}</span>
                  </div>
                  <div className="flex justify-between text-[#525266]">
                    <span>College:</span>
                    <span className="font-semibold text-[#090814] truncate max-w-[200px]">{team.collegeName}</span>
                  </div>
                  <div className="flex justify-between text-[#525266]">
                    <span>Contact:</span>
                    <span className="font-mono text-[#5227FF] font-semibold">{team.phone}</span>
                  </div>
                  <div className="flex justify-between text-[#525266]">
                    <span>Total Members:</span>
                    <span className="font-bold text-[#090814]">{1 + members.length} Athletes/Artists</span>
                  </div>
                </div>

                {members.length > 0 && (
                  <div>
                    <span className="text-[10px] font-black uppercase tracking-wider text-[#717188] block mb-1.5">
                      Roster Members ({members.length})
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {members.map((m: any, idx: number) => (
                        <span
                          key={idx}
                          className="px-2.5 py-0.5 bg-gray-100 rounded-md text-[11px] text-[#090814] font-medium border border-gray-200"
                        >
                          {m.name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
