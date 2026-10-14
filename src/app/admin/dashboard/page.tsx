'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  UserCheck,
  CheckCircle2,
  Users,
  Radio,
  FileSpreadsheet,
  LayoutTemplate,
  Plus,
  ArrowRight,
  Sparkles,
  AlertTriangle,
  Building,
  Trophy,
  Music,
} from 'lucide-react';

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchState = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setData(json);
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchState();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <p className="text-xs font-bold uppercase tracking-widest text-[#525266] animate-pulse">
          Loading command center metrics...
        </p>
      </div>
    );
  }

  const metrics = data?.metrics || {};
  const settings = data?.settings || {};
  const events = data?.events || [];
  const logs = data?.auditLogs || [];

  return (
    <div className="space-y-8">
      {/* Top Banner with Festival Dates */}
      <div className="p-6 rounded-3xl bg-gradient-to-r from-[#090814] via-[#1A182E] to-[#090814] text-white flex flex-col md:flex-row items-start md:items-center justify-between gap-6 shadow-xl">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#00DCEB]">
              FESTIVAL OPERATIONS PLATFORM
            </span>
            <span className="text-gray-500">•</span>
            <span className="text-xs text-gray-300 font-bold">28–29 DECEMBER 2026</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-4xl tracking-tight">
            COLORIDO 2K26 COMMAND CENTER
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Active Worlds: Cultural Arts & Sports Championships • R.V.R. & J.C. College of Engineering
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/admin/live"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all animate-pulse"
          >
            <Radio className="w-4 h-4" />
            <span>LIVE CONTROL</span>
          </Link>

          <Link
            href="/admin/checkin"
            className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-md transition-all"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>OPEN CHECK-IN</span>
          </Link>
        </div>
      </div>

      {/* Primary Operational Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#717188]">
              Registrations
            </span>
            <div className="p-2 rounded-xl bg-primary-light">
              <UserCheck className="w-4 h-4 text-[#5227FF]" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#090814] block mb-1">
              {metrics.totalRegistrations || 0}
            </span>
            <div className="text-[11px] text-[#525266] font-semibold flex items-center gap-2">
              <span className="text-[#5227FF]">{metrics.rvrjcRegistrations || 0} RVRJC</span>
              <span>•</span>
              <span className="text-[#FF5E3A]">{metrics.otherCollegeRegistrations || 0} Other Colg</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#717188]">
              Checked-In Today
            </span>
            <div className="p-2 rounded-xl bg-green-100">
              <CheckCircle2 className="w-4 h-4 text-green-700" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#090814] block mb-1">
              {metrics.totalCheckIns || 0}
            </span>
            <span className="text-[11px] text-[#525266] font-semibold block">
              {metrics.checkInRate}% check-in conversion
            </span>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#717188]">
              Active Events
            </span>
            <div className="p-2 rounded-xl bg-[#FFEBF4]">
              <CalendarDays className="w-4 h-4 text-[#FF2E93]" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#090814] block mb-1">
              {metrics.publishedEvents || 0}
            </span>
            <div className="text-[11px] text-[#525266] font-semibold flex items-center gap-2">
              <span className="text-[#FF2E93]">{metrics.culturalEvents || 0} Cultural</span>
              <span>•</span>
              <span className="text-[#FF5E3A]">{metrics.sportsEvents || 0} Sports</span>
            </div>
          </div>
        </div>

        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold uppercase tracking-wider text-[#717188]">
              Registered Squads
            </span>
            <div className="p-2 rounded-xl bg-[#FFF0EB]">
              <Users className="w-4 h-4 text-[#FF5E3A]" />
            </div>
          </div>
          <div>
            <span className="font-display font-black text-3xl sm:text-4xl text-[#090814] block mb-1">
              {metrics.totalTeams || 0}
            </span>
            <span className="text-[11px] text-[#525266] font-semibold block">
              Sports & Dance Crews
            </span>
          </div>
        </div>
      </div>

      {/* Quick Action Navigation Grid */}
      <div>
        <h2 className="font-display font-bold text-lg text-[#090814] mb-3">
          Quick Operations Actions
        </h2>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          <Link
            href="/admin/events"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#5227FF] hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-primary-light flex items-center justify-center text-[#5227FF] mb-2 group-hover:scale-105 transition-transform">
              <Plus className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">Add Event</span>
          </Link>

          <Link
            href="/admin/checkin"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-green-600 hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center text-green-700 mb-2 group-hover:scale-105 transition-transform">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">QR Check-In</span>
          </Link>

          <Link
            href="/admin/homepage"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-black hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F5F5FA] flex items-center justify-center text-gray-700 mb-2 group-hover:scale-105 transition-transform">
              <LayoutTemplate className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">Homepage Builder</span>
          </Link>

          <Link
            href="/admin/registrations"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF2E93] hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFEBF4] flex items-center justify-center text-[#FF2E93] mb-2 group-hover:scale-105 transition-transform">
              <UserCheck className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">Rosters</span>
          </Link>

          <Link
            href="/admin/reports"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-[#FF5E3A] hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-[#FFF0EB] flex items-center justify-center text-[#FF5E3A] mb-2 group-hover:scale-105 transition-transform">
              <FileSpreadsheet className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">Download CSV</span>
          </Link>

          <Link
            href="/admin/live"
            className="p-4 rounded-2xl bg-white border border-gray-200 hover:border-red-600 hover:shadow-md transition-all text-center flex flex-col items-center justify-center group"
          >
            <div className="w-10 h-10 rounded-xl bg-red-100 flex items-center justify-center text-red-600 mb-2 group-hover:scale-105 transition-transform">
              <Radio className="w-5 h-5" />
            </div>
            <span className="text-xs font-bold text-[#090814]">Live Control</span>
          </Link>
        </div>
      </div>

      {/* Main Grid: Active Championships & Recent Audit Log */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Active Events Overview */}
        <div className="lg:col-span-8 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#090814]">
              Active Championships Status ({events.length})
            </h2>
            <Link
              href="/admin/events"
              className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1"
            >
              <span>Manage All Events</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="divide-y divide-gray-100">
            {events.slice(0, 6).map((evt: any) => (
              <div
                key={evt.id}
                className="py-3.5 flex items-center justify-between gap-4 hover:bg-[#FBFBFD] px-2 rounded-xl transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="relative w-12 h-12 rounded-xl overflow-hidden shrink-0">
                    <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <span
                      className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded text-white ${
                        evt.category === 'cultural'
                          ? 'bg-[#FF2E93]'
                          : evt.category === 'sports'
                          ? 'bg-[#FF5E3A]'
                          : 'bg-amber-600'
                      }`}
                    >
                      {evt.category} • {evt.status}
                    </span>
                    <h3 className="font-display font-bold text-sm text-[#090814] truncate max-w-sm">
                      {evt.title}
                    </h3>
                    <p className="text-[11px] text-[#717188]">{evt.venueName} • {evt.date}</p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <Link
                    href={`/admin/events/${evt.id}`}
                    className="px-3 py-1.5 rounded-lg bg-[#F5F5FA] hover:bg-black hover:text-white text-xs font-bold text-[#090814] transition-colors"
                  >
                    Command Center
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Audit Stream */}
        <div className="lg:col-span-4 p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-display font-bold text-lg text-[#090814]">
              Recent Activity Logs
            </h2>
            <Link
              href="/admin/activity"
              className="text-xs font-bold text-[#5227FF] hover:underline"
            >
              Full Log
            </Link>
          </div>

          <div className="space-y-3">
            {logs.slice(0, 7).map((log: any) => (
              <div key={log.id} className="p-3 rounded-xl bg-[#FBFBFD] border border-gray-100 text-xs">
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-[#090814]">{log.action}</span>
                  <span className="text-[10px] text-gray-400 font-mono">
                    {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                <p className="text-[#525266] text-[11px] line-clamp-2">{log.details}</p>
                <span className="text-[10px] text-[#717188] font-semibold mt-1 block">
                  Actor: {log.actor} ({log.actorRole})
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
