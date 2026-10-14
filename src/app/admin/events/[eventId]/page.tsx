'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  FileSpreadsheet,
  ArrowLeft,
  UserCheck,
  Shield,
  BarChart3,
  ExternalLink,
} from 'lucide-react';
import { EventItem, RegistrationItem } from '@/lib/types';

export default function AdminEventDetailPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();

  const [eventData, setEventData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchEventState = () => {
    fetch(`/api/admin/events/${eventId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setEventData(json);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEventState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const handleQuickCheckIn = async (regId: string) => {
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, mode: 'MANUAL_ENTRY' }),
      });
      const json = await res.json();
      if (json.success) {
        fetchEventState();
      } else {
        alert(json.message);
      }
    } catch (e: any) {
      alert(e.message);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Event Command Center...</div>;
  }

  if (!eventData?.event) {
    return <div className="p-8 text-sm text-red-600 font-bold">Event not found.</div>;
  }

  const evt: EventItem = eventData.event;
  const stats = eventData.stats;
  const regs: RegistrationItem[] = eventData.registrations || [];

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Back and Title */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#525266] hover:text-[#090814]"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Events Roster</span>
        </Link>

        <a
          href={`/api/admin/reports?type=event-registrations&eventId=${evt.id}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-300 hover:bg-gray-50 text-xs font-bold text-[#090814] shadow-sm"
        >
          <FileSpreadsheet className="w-4 h-4 text-green-700" />
          <span>Download Event Roster (CSV)</span>
        </a>
      </div>

      {/* Header Banner */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="relative w-20 h-20 rounded-2xl overflow-hidden shrink-0 shadow-md">
            <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-primary-light text-[#5227FF]">
                {evt.category} • {evt.subcategory}
              </span>
              <span className="text-xs font-mono text-gray-400">{evt.id}</span>
            </div>
            <h1 className="font-display font-black text-2xl text-[#090814]">
              {evt.title}
            </h1>
            <p className="text-xs text-[#525266] mt-0.5">
              {evt.venueName} • {evt.date} ({evt.startTime} - {evt.endTime})
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href={`/admin/events/${evt.id}/analytics`}
            className="px-4 py-2 rounded-xl bg-indigo-50 hover:bg-indigo-100 text-xs font-bold text-indigo-700 flex items-center gap-1.5 border border-indigo-200"
          >
            <BarChart3 className="w-3.5 h-3.5" />
            <span>Event Analytics</span>
          </Link>
          <Link
            href={`/events/${evt.slug}`}
            target="_blank"
            className="px-4 py-2 rounded-xl bg-[#F5F5FA] hover:bg-gray-200 text-xs font-bold text-[#090814] flex items-center gap-1.5"
          >
            <span>Public Page</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {/* Operational Metrics Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#717188] block mb-1">
            Total Registrations
          </span>
          <span className="font-display font-black text-3xl text-[#090814]">
            {stats.totalRegistrations}
          </span>
          <span className="text-xs text-[#525266] block mt-1">
            {stats.rvrjcCount} RVRJC • {stats.otherCollegeCount} Other Colg
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#717188] block mb-1">
            Checked-In
          </span>
          <span className="font-display font-black text-3xl text-green-700">
            {stats.checkedInCount}
          </span>
          <span className="text-xs text-[#525266] block mt-1">
            {stats.pendingCheckIn} Pending Check-In
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#717188] block mb-1">
            Capacity Utilization
          </span>
          <span className="font-display font-black text-3xl text-[#5227FF]">
            {stats.capacityUtilization}%
          </span>
          <span className="text-xs text-[#525266] block mt-1">
            {stats.remainingCapacity} Slots Remaining
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#717188] block mb-1">
            Squads & Crews
          </span>
          <span className="font-display font-black text-3xl text-[#FF5E3A]">
            {stats.teamsCount}
          </span>
          <span className="text-xs text-[#525266] block mt-1">
            {stats.uniqueCollegesCount} Unique Colleges
          </span>
        </div>
      </div>

      {/* Participant Roster Table */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-display font-bold text-lg text-[#090814]">
            Registered Participants & Squads ({regs.length})
          </h2>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#FBFBFD] text-gray-500 font-bold uppercase border-b border-gray-200">
              <tr>
                <th className="p-3">Reg ID</th>
                <th className="p-3">Participant</th>
                <th className="p-3">College & Dept</th>
                <th className="p-3">Team / Squad</th>
                <th className="p-3">Check-In Status</th>
                <th className="p-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {regs.map((r) => {
                const isChecked = r.checkInStatus === 'CHECKED_IN';
                return (
                  <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-3 font-mono font-bold text-[#5227FF]">{r.id}</td>
                    <td className="p-3">
                      <strong className="text-[#090814] block">{r.participantName}</strong>
                      <span className="text-gray-400">{r.email} • {r.phone}</span>
                    </td>
                    <td className="p-3">
                      <span className="block text-[#090814]">{r.collegeName}</span>
                      <span className="text-gray-500">{r.department} • {r.year}</span>
                    </td>
                    <td className="p-3">
                      {r.teamName ? (
                        <span className="font-bold text-[#090814]">{r.teamName}</span>
                      ) : (
                        <span className="text-gray-400">Solo</span>
                      )}
                    </td>
                    <td className="p-3">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          isChecked ? 'bg-green-100 text-green-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {isChecked ? 'CHECKED IN' : 'PENDING'}
                      </span>
                    </td>
                    <td className="p-3 text-right">
                      {!isChecked ? (
                        <button
                          onClick={() => handleQuickCheckIn(r.id)}
                          className="px-3 py-1 bg-green-600 hover:bg-green-700 text-white rounded-lg text-xs font-bold transition-colors"
                        >
                          Check In
                        </button>
                      ) : (
                        <span className="text-[11px] text-green-700 font-bold">Verified</span>
                      )}
                    </td>
                  </tr>
                );
              })}

              {regs.length === 0 && (
                <tr>
                  <td colSpan={6} className="p-6 text-center text-gray-400">
                    No participants registered for this event yet.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
