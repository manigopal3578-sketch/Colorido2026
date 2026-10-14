'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  UserCheck,
  Search,
  Filter,
  FileSpreadsheet,
  QrCode,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  Trash2,
  AlertTriangle,
  Loader2,
} from 'lucide-react';
import { RegistrationItem } from '@/lib/types';

export default function AdminRegistrationsPage() {
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [collegeFilter, setCollegeFilter] = useState<'ALL' | 'RVRJC' | 'OTHER'>('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedForDelete, setSelectedForDelete] = useState<RegistrationItem | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchRegistrations = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setRegistrations(json.registrations || []);
      })
      .finally(() => setLoading(false));
  };

  const handleConfirmDelete = async () => {
    if (!selectedForDelete) return;
    setIsDeleting(true);
    setFeedbackMsg(null);
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'registrations',
          id: selectedForDelete.id,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setFeedbackMsg({
          type: 'success',
          text: `Registration ${selectedForDelete.id} permanently deleted. Ticket pass revoked and event capacity restored.`,
        });
        setSelectedForDelete(null);
        fetchRegistrations();
      } else {
        setFeedbackMsg({
          type: 'error',
          text: data.message || 'Failed to delete registration.',
        });
      }
    } catch (err: any) {
      setFeedbackMsg({
        type: 'error',
        text: err.message || 'Network error occurred while deleting registration.',
      });
    } finally {
      setIsDeleting(false);
    }
  };

  useEffect(() => {
    fetchRegistrations();
  }, []);

  const filtered = registrations.filter((r) => {
    const matchColg = collegeFilter === 'ALL' || r.collegeType === collegeFilter;
    const matchStatus = statusFilter === 'ALL' || r.status === statusFilter;
    const matchSearch =
      r.participantName.toLowerCase().includes(search.toLowerCase()) ||
      r.email.toLowerCase().includes(search.toLowerCase()) ||
      r.id.toLowerCase().includes(search.toLowerCase()) ||
      r.eventTitle.toLowerCase().includes(search.toLowerCase()) ||
      r.collegeName.toLowerCase().includes(search.toLowerCase());
    return matchColg && matchStatus && matchSearch;
  });

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
            <UserCheck className="w-3.5 h-3.5" />
            <span>CENTRAL ROSTER DATABASE</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            MASTER REGISTRATIONS ({registrations.length})
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Search, filter, inspect digital passes, and export verified participant records.
          </p>
        </div>

        <a
          href="/api/admin/reports?type=master-registrations"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#090814] shadow-sm shrink-0"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-700" />
          <span>Export Master CSV</span>
        </a>
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

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="relative w-full md:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by participant, pass ID, email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1 bg-[#F5F5FA] p-1 rounded-xl">
            <button
              onClick={() => setCollegeFilter('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                collegeFilter === 'ALL' ? 'bg-[#090814] text-white' : 'text-[#525266]'
              }`}
            >
              All Colleges ({registrations.length})
            </button>
            <button
              onClick={() => setCollegeFilter('RVRJC')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                collegeFilter === 'RVRJC' ? 'bg-[#5227FF] text-white' : 'text-[#525266]'
              }`}
            >
              RVRJC ({registrations.filter((r) => r.collegeType === 'RVRJC').length})
            </button>
            <button
              onClick={() => setCollegeFilter('OTHER')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                collegeFilter === 'OTHER' ? 'bg-[#FF5E3A] text-white' : 'text-[#525266]'
              }`}
            >
              Other Colleges ({registrations.filter((r) => r.collegeType === 'OTHER').length})
            </button>
          </div>
        </div>
      </div>

      {/* Registrations Table */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Pass ID</th>
                <th className="p-3">Participant</th>
                <th className="p-3">Championship Event</th>
                <th className="p-3">College & Department</th>
                <th className="p-3">Check-In</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.map((r) => {
                const isCheckedIn = r.checkInStatus === 'CHECKED_IN';
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#5227FF]">{r.id}</td>
                    <td className="p-3">
                      <strong className="text-[#090814] block">{r.participantName}</strong>
                      <span className="text-gray-400">{r.email} • {r.phone}</span>
                    </td>
                    <td className="p-3">
                      <span className="font-bold text-[#090814] block">{r.eventTitle}</span>
                      {r.teamName && (
                        <span className="text-[11px] text-[#5227FF] font-semibold">
                          Team: {r.teamName}
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <span className="block text-[#090814]">{r.collegeName}</span>
                      <span className="text-gray-500">{r.department} ({r.studentId})</span>
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isCheckedIn ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isCheckedIn ? 'CHECKED IN' : 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      <div className="inline-flex items-center gap-1.5 justify-end">
                        <Link
                          href={`/ticket/${r.id}`}
                          target="_blank"
                          title="View verified ticket pass"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-[#F5F5FA] hover:bg-black hover:text-white rounded-lg text-xs font-bold text-[#090814] transition-colors"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Pass</span>
                        </Link>
                        <button
                          type="button"
                          onClick={() => setSelectedForDelete(r)}
                          title="Permanently delete registration"
                          className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-50 hover:bg-red-600 hover:text-white rounded-lg text-xs font-bold text-red-600 border border-red-200 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          <span>Delete</span>
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}

              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-8 text-center text-gray-400">
                    No registrations found matching the specified search.
                  </td>
                </tr>
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
                  DELETE REGISTRATION?
                </h3>
                <p className="text-xs text-gray-500">
                  Are you sure you want to permanently delete this registration?
                </p>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200/80 space-y-2.5 text-xs mb-5">
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Participant:</span>
                <span className="font-bold text-[#090814]">{selectedForDelete.participantName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Registration ID:</span>
                <span className="font-mono font-bold text-[#5227FF]">{selectedForDelete.id}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Championship Event:</span>
                <span className="font-bold text-[#090814] text-right truncate max-w-[240px]">
                  {selectedForDelete.eventTitle}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">Email:</span>
                <span className="font-mono text-gray-700">{selectedForDelete.email}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500 font-semibold">College & Roll No:</span>
                <span className="text-gray-700 text-right">
                  {selectedForDelete.collegeName} ({selectedForDelete.studentId})
                </span>
              </div>
            </div>

            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-[11px] text-amber-900 font-medium mb-6">
              ⚠️ <strong>Critical Warning:</strong> This operation will permanently revoke the verified digital ticket pass and restore the reserved capacity to the event quota. This action cannot be reversed.
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
                onClick={handleConfirmDelete}
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
