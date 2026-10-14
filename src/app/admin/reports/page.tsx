'use client';

import React, { useState, useEffect } from 'react';
import {
  FileSpreadsheet,
  Download,
  Calendar,
  Users,
  CheckCircle2,
  Shield,
  Sparkles,
  Hotel,
} from 'lucide-react';
import { EventItem } from '@/lib/types';

export default function AdminReportsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [selectedEventId, setSelectedEventId] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setEvents(json.events || []);
          if (json.events?.length > 0) {
            setSelectedEventId(json.events[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const reportCards = [
    {
      title: 'Master Registrations Report',
      desc: 'Complete records of all confirmed and waitlisted collegiate participants across all festival categories.',
      type: 'master-registrations',
      icon: Users,
      badge: 'ALL CATEGORIES',
    },
    {
      title: 'Hostel Accommodation Roster',
      desc: 'Official outstation delegate stay reservations, room allocations (Boys/Girls blocks), duration, and emergency contact details.',
      type: 'accommodation',
      icon: Hotel,
      badge: 'CAMPUS STAY',
    },
    {
      title: 'Arena Check-In & Verification Report',
      desc: 'Timestamped audit logs of all participants verified at the campus check-in desk, including staff IDs.',
      type: 'check-ins',
      icon: CheckCircle2,
      badge: 'ATTENDANCE',
    },
    {
      title: 'Squads & Teams Roster',
      desc: 'All registered college teams for Cricket, Football, Basketball, Volleyball, and Street Dance crews.',
      type: 'teams',
      icon: Shield,
      badge: 'TEAM SQUADS',
    },
  ];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
          <FileSpreadsheet className="w-3.5 h-3.5" />
          <span>DATA EXPORT CENTER</span>
        </div>
        <h1 className="font-display font-black text-3xl text-[#090814]">
          OFFICIAL FESTIVAL CSV DOWNLOADS
        </h1>
        <p className="text-xs sm:text-sm text-[#525266]">
          Generate and download authentic, unadulterated participant rosters and attendance records directly from the database.
        </p>
      </div>

      {/* Global Reports Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {reportCards.map((rep) => {
          const Icon = rep.icon;
          return (
            <div
              key={rep.type}
              className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between space-y-6"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-gray-100 text-gray-700">
                    {rep.badge}
                  </span>
                  <Icon className="w-5 h-5 text-[#5227FF]" />
                </div>

                <h3 className="font-display font-bold text-lg text-[#090814] mb-2 leading-snug">
                  {rep.title}
                </h3>
                <p className="text-xs text-[#525266] leading-relaxed">
                  {rep.desc}
                </p>
              </div>

              <a
                href={`/api/admin/reports?type=${rep.type}`}
                className="w-full py-3 px-4 rounded-xl bg-[#090814] hover:bg-black text-white text-xs font-bold text-center flex items-center justify-center gap-2 shadow-sm transition-all"
              >
                <Download className="w-4 h-4 text-[#00DCEB]" />
                <span>Download CSV File</span>
              </a>
            </div>
          );
        })}
      </div>

      {/* Specific Championship Roster Exporter */}
      <div className="p-8 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-6">
        <div>
          <span className="text-xs font-extrabold uppercase tracking-widest text-[#717188] block mb-1">
            Championship-Specific Roster
          </span>
          <h2 className="font-display font-bold text-xl text-[#090814]">
            Export Individual Event Roll
          </h2>
          <p className="text-xs text-[#525266] mt-0.5">
            Download a dedicated spreadsheet for event coordinators, judges, and stage managers.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-4">
          <select
            value={selectedEventId}
            onChange={(e) => setSelectedEventId(e.target.value)}
            className="w-full sm:flex-1 p-3.5 rounded-xl border border-gray-200 text-xs sm:text-sm font-semibold text-[#090814] bg-[#FBFBFD]"
          >
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                [{evt.category.toUpperCase()}] {evt.title} ({evt.registeredCount} registered)
              </option>
            ))}
          </select>

          <a
            href={`/api/admin/reports?type=event-registrations&eventId=${selectedEventId}`}
            className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all flex items-center justify-center gap-2 shrink-0"
          >
            <Download className="w-4 h-4" />
            <span>Generate Excel / CSV</span>
          </a>
        </div>
      </div>
    </div>
  );
}
