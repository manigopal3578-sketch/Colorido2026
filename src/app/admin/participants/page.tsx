'use client';

import React, { useState, useEffect } from 'react';
import {
  Users,
  Search,
  Mail,
  Phone,
  Download,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { generateCsvContent, downloadFile } from '@/lib/utils';

export default function ParticipantsAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState<'ALL' | 'RVRJC' | 'OTHER'>('ALL');
  const [selectedForDelete, setSelectedForDelete] = useState<any>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

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

  const handleConfirmDeleteParticipant = async () => {
    if (!selectedForDelete) return;
    setIsDeleting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'participants',
          id: selectedForDelete.id,
        }),
      });
      const result = await res.json();
      if (result.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Participant ${selectedForDelete.name} (${selectedForDelete.email}) and all associated passes permanently deleted. Event quotas restored.`,
        });
        setSelectedForDelete(null);
        fetchData();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: result.message || 'Failed to delete participant.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Network error occurred while deleting participant.',
      });
    } finally {
      setIsDeleting(false);
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

  const participants = data.participants || [];
  const registrations = data.registrations || [];

  const filtered = participants.filter((p: any) => {
    const matchesSearch =
      search === '' ||
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.email.toLowerCase().includes(search.toLowerCase()) ||
      p.studentId?.toLowerCase().includes(search.toLowerCase()) ||
      p.collegeName.toLowerCase().includes(search.toLowerCase());

    const matchesCollege = collegeFilter === 'ALL' || p.collegeType === collegeFilter;

    return matchesSearch && matchesCollege;
  });

  const exportCsv = () => {
    const headers = ['ID', 'Name', 'Email', 'Phone', 'College Type', 'College Name', 'Department', 'Year', 'Student ID', 'Registered Events Count', 'Joined Date'];
    const rows = filtered.map((p: any) => [
      p.id,
      p.name,
      p.email,
      p.phone,
      p.collegeType,
      p.collegeName,
      p.department || '',
      p.year || '',
      p.studentId || '',
      p.registeredEventIds?.length || 0,
      p.createdAt,
    ]);
    const csv = generateCsvContent(headers, rows);
    downloadFile(csv, `colorido_participants_${new Date().toISOString().slice(0, 10)}.csv`, 'text/csv');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Users className="w-4 h-4" />
            <span>Participant Directory</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Registered Delegates ({participants.length})
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Unique students and delegates registered across all Cultural and Sports tournaments.
          </p>
        </div>

        <button
          onClick={exportCsv}
          className="px-4 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-[#090814] rounded-xl text-xs font-bold flex items-center gap-2 transition-all self-start md:self-center shadow-xs"
        >
          <Download className="w-4 h-4 text-[#5227FF]" />
          <span>Export Delegates CSV</span>
        </button>
      </div>

      {/* Feedback Message */}
      {feedbackMsg && (
        <div
          className={`p-4 rounded-2xl flex items-center justify-between text-xs font-bold ${
            feedbackMsg.type === 'success'
              ? 'bg-emerald-50 text-emerald-800 border border-emerald-200'
              : 'bg-red-50 text-red-800 border border-red-200'
          }`}
        >
          <span>{feedbackMsg.text}</span>
          <button
            onClick={() => setFeedbackMsg(null)}
            className="text-xs uppercase font-extrabold hover:underline ml-4"
          >
            Dismiss
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by student name, roll number, college..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCollegeFilter('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              collegeFilter === 'ALL' ? 'bg-[#5227FF] text-white shadow-xs' : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            All Colleges ({participants.length})
          </button>
          <button
            onClick={() => setCollegeFilter('RVRJC')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              collegeFilter === 'RVRJC' ? 'bg-[#090814] text-white shadow-xs' : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            RVRJC Internal ({participants.filter((p: any) => p.collegeType === 'RVRJC').length})
          </button>
          <button
            onClick={() => setCollegeFilter('OTHER')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              collegeFilter === 'OTHER' ? 'bg-[#FF5E3A] text-white shadow-xs' : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            External Colleges ({participants.filter((p: any) => p.collegeType === 'OTHER').length})
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200 text-[#717188] uppercase tracking-wider text-[10px] font-black">
              <tr>
                <th className="py-3.5 px-4">Delegate</th>
                <th className="py-3.5 px-4">College & Dept</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Roll / ID</th>
                <th className="py-3.5 px-4">Registered Events</th>
                <th className="py-3.5 px-4">Joined</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-[#525266]">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-[#717188] font-semibold">
                    No participants found matching the criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((p: any) => {
                  const pRegs = registrations.filter((r: any) => r.participantId === p.id);

                  return (
                    <tr key={p.id} className="hover:bg-gray-50/80 transition-colors">
                      <td className="py-3.5 px-4 font-semibold text-[#090814]">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-[#5227FF] to-[#FF2E93] flex items-center justify-center font-bold text-white text-xs shrink-0">
                            {p.name.charAt(0)}
                          </div>
                          <div>
                            <span className="block font-bold">{p.name}</span>
                            <span className="text-[10px] text-[#717188] font-mono">{p.id}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <div className="space-y-0.5">
                          <span
                            className={`inline-block px-1.5 py-0.5 rounded text-[9px] font-black uppercase tracking-wider mb-0.5 ${
                              p.collegeType === 'RVRJC'
                                ? 'bg-blue-100 text-blue-800'
                                : 'bg-orange-100 text-orange-800'
                            }`}
                          >
                            {p.collegeType === 'RVRJC' ? 'Host College' : 'External College'}
                          </span>
                          <p className="font-bold text-[#090814] truncate max-w-xs">{p.collegeName}</p>
                          <p className="text-[10px] text-[#717188]">{p.department} • {p.year}</p>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 space-y-0.5">
                        <p className="text-[#090814] font-medium flex items-center gap-1.5 font-mono text-[11px]">
                          <Mail className="w-3 h-3 text-[#5227FF]" />
                          {p.email}
                        </p>
                        <p className="text-[#525266] flex items-center gap-1.5 font-mono text-[11px]">
                          <Phone className="w-3 h-3 text-[#FF5E3A]" />
                          {p.phone}
                        </p>
                      </td>
                      <td className="py-3.5 px-4 font-mono font-bold text-[#090814]">
                        {p.studentId || 'N/A'}
                      </td>
                      <td className="py-3.5 px-4">
                        <span className="px-2 py-1 rounded-md bg-gray-100 text-[#090814] font-bold text-xs border border-gray-200">
                          {pRegs.length} Event{pRegs.length === 1 ? '' : 's'}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-[#717188] text-[11px]">
                        {new Date(p.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <button
                          type="button"
                          onClick={() => setSelectedForDelete({ ...p, regCount: pRegs.length })}
                          title="Permanently delete delegate and all associated passes"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-600 border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      {selectedForDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex items-center gap-3 text-red-600 mb-4">
              <div className="w-10 h-10 rounded-2xl bg-red-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <h3 className="font-display font-black text-lg text-[#090814]">
                  DELETE PARTICIPANT & PASSES?
                </h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to permanently delete this participant?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Delegate Name:</span>
                <span className="font-bold text-[#090814]">{selectedForDelete.name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Participant ID:</span>
                <span className="font-mono font-bold text-[#5227FF]">{selectedForDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Email:</span>
                <span className="font-mono text-gray-700">{selectedForDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">College:</span>
                <span className="text-gray-700 text-right truncate max-w-[220px]">
                  {selectedForDelete.collegeName}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Department & Roll:</span>
                <span className="text-gray-700">
                  {selectedForDelete.department || 'N/A'} ({selectedForDelete.studentId || 'N/A'})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Active Registrations:</span>
                <span className="px-2 py-0.5 rounded bg-red-100 text-red-800 font-bold text-[11px]">
                  {selectedForDelete.regCount || 0} Event Pass{(selectedForDelete.regCount === 1) ? '' : 'es'}
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium mb-6">
              ⚠️ <strong>Critical Warning:</strong> Permanently deleting this participant will also delete all their registered passes, revoke digital tickets, and restore the event capacities. This action cannot be reversed.
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => setSelectedForDelete(null)}
                className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={handleConfirmDeleteParticipant}
                className="px-5 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Deleting...</span>
                  </>
                ) : (
                  <>
                    <Trash2 className="w-4 h-4" />
                    <span>Delete Permanently</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
