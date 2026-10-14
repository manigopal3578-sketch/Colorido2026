'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  BarChart3,
  TrendingUp,
  PieChart,
  Users,
  Building,
  Award,
  Calendar,
  CheckCircle2,
  Sparkles,
  ArrowRight,
  ExternalLink,
  GitCompare,
  Download,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { EventItem, RegistrationItem } from '@/lib/types';

export default function AdminAnalyticsPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Multi-event comparison state
  const [compareEventIdA, setCompareEventIdA] = useState<string>('');
  const [compareEventIdB, setCompareEventIdB] = useState<string>('');

  useEffect(() => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
          if (json.events?.length >= 2) {
            setCompareEventIdA(json.events[0].id);
            setCompareEventIdB(json.events[1].id);
          }
        }
      })
      .finally(() => setLoading(false));
  }, []);

  const metrics = data?.metrics || {};
  const events: EventItem[] = useMemo(() => data?.events || [], [data?.events]);
  const regs: RegistrationItem[] = useMemo(() => data?.registrations || [], [data?.registrations]);

  const culturalRegs = regs.filter((r) => r.category === 'cultural').length;
  const sportsRegs = regs.filter((r) => r.category === 'sports').length;

  const rvrjcCount = regs.filter((r) => r.collegeType === 'RVRJC').length;
  const otherCount = regs.filter((r) => r.collegeType === 'OTHER').length;

  // Ranked Events by Registrations
  const rankedEvents = useMemo(() => {
    return [...events]
      .filter((e) => e.status !== 'POSTPONED')
      .sort((a, b) => (b.registeredCount || 0) - (a.registeredCount || 0));
  }, [events]);

  const eventA = events.find((e) => e.id === compareEventIdA);
  const eventB = events.find((e) => e.id === compareEventIdB);

  const getEventStats = (evt?: EventItem) => {
    if (!evt) return null;
    const evtRegs = regs.filter((r) => r.eventId === evt.id);
    const checkedIn = evtRegs.filter((r) => r.checkInStatus === 'CHECKED_IN').length;
    const rvrjc = evtRegs.filter((r) => r.collegeType === 'RVRJC').length;
    const other = evtRegs.filter((r) => r.collegeType === 'OTHER').length;
    const checkInRate = evtRegs.length > 0 ? Math.round((checkedIn / evtRegs.length) * 100) : 0;
    const capacityPercent = Math.min(100, Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100));
    return {
      total: evtRegs.length,
      checkedIn,
      pending: Math.max(0, evtRegs.length - checkedIn),
      checkInRate,
      capacityPercent,
      rvrjc,
      other,
    };
  };

  const statsA = getEventStats(eventA);
  const statsB = getEventStats(eventB);

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Festival Intelligence Engine...</span>
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest mb-2">
            <BarChart3 className="w-3.5 h-3.5" />
            <span>OPERATIONAL INTELLIGENCE</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            FESTIVAL ANALYTICS COMMAND CENTER
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Real-time descriptive analytics on participation trends, collegiate demographics, and capacity utilization.
          </p>
        </div>

        <div className="flex items-center gap-2 print:hidden">
          <button
            onClick={() => window.print()}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 rounded-xl text-xs font-semibold shadow-sm transition flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* Top Level Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Total Registrations
          </span>
          <span className="font-display font-black text-3xl sm:text-4xl text-gray-900">
            {regs.length}
          </span>
          <span className="text-xs text-emerald-600 font-semibold block mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" />
            Active verified entries
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Overall Check-In Ratio
          </span>
          <span className="font-display font-black text-3xl sm:text-4xl text-emerald-600">
            {metrics.checkInRate}%
          </span>
          <span className="text-xs text-gray-500 block mt-1">
            {metrics.totalCheckIns} of {regs.length} Verified
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Host Institution (RVRJC)
          </span>
          <span className="font-display font-black text-3xl sm:text-4xl text-indigo-600">
            {regs.length > 0 ? Math.round((rvrjcCount / regs.length) * 100) : 0}%
          </span>
          <span className="text-xs text-gray-500 block mt-1">
            {rvrjcCount} RVRJC Scholars
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm">
          <span className="text-xs font-bold text-gray-500 uppercase tracking-wider block mb-1">
            Visiting Delegations
          </span>
          <span className="font-display font-black text-3xl sm:text-4xl text-pink-600">
            {regs.length > 0 ? Math.round((otherCount / regs.length) * 100) : 0}%
          </span>
          <span className="text-xs text-gray-500 block mt-1">
            {otherCount} External Participants
          </span>
        </div>
      </div>

      {/* Leaderboard: Most Registered Events Ranking */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Award className="w-5 h-5 text-amber-500" />
            <h2 className="font-display font-bold text-lg text-gray-900">
              Most Registered Events Leaderboard
            </h2>
          </div>
          <span className="text-xs font-semibold text-gray-500">Top Competitions by Demand</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {rankedEvents.slice(0, 6).map((evt, idx) => {
            const isTop3 = idx < 3;
            const pct = Math.min(100, Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100));

            return (
              <div
                key={evt.id}
                className="p-4 rounded-xl border border-gray-200 bg-gray-50/50 hover:bg-white hover:shadow-md transition flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-black ${
                        idx === 0
                          ? 'bg-amber-400 text-slate-950 shadow-sm'
                          : idx === 1
                          ? 'bg-slate-300 text-slate-900'
                          : idx === 2
                          ? 'bg-amber-700 text-white'
                          : 'bg-gray-200 text-gray-700'
                      }`}
                    >
                      #{idx + 1}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                        evt.category === 'cultural'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {evt.subcategory}
                    </span>
                  </div>

                  <h3 className="font-bold text-gray-900 text-sm line-clamp-1">{evt.title}</h3>
                  <div className="text-xs text-gray-500 mt-1 flex justify-between">
                    <span>Slots: <strong>{evt.registeredCount} / {evt.capacity}</strong></span>
                    <span className="font-bold text-indigo-600">{pct}%</span>
                  </div>

                  <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${
                        evt.category === 'cultural' ? 'bg-pink-500' : 'bg-orange-500'
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="mt-3 pt-2 border-t border-gray-200/60 flex items-center justify-between">
                  <span className="text-[11px] text-gray-500">{evt.venueName}</span>
                  <Link
                    href={`/admin/events/${evt.id}/analytics`}
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
                  >
                    <span>Inspect</span>
                    <ArrowRight className="w-3 h-3" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Multi-Event Comparison Tool */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <GitCompare className="w-5 h-5 text-indigo-600" />
            <h2 className="font-display font-bold text-lg text-gray-900">
              Multi-Event Side-by-Side Comparison Tool
            </h2>
          </div>
          <p className="text-xs text-gray-500">
            Compare capacity, attendee velocity, and check-in rates between two festival events.
          </p>
        </div>

        {/* Event Selectors */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-4 rounded-xl bg-indigo-50/50 border border-indigo-100">
            <label className="block text-xs font-bold text-indigo-900 uppercase tracking-wider mb-2">
              Select First Event (A)
            </label>
            <select
              value={compareEventIdA}
              onChange={(e) => setCompareEventIdA(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-indigo-600"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.category.toUpperCase()} • {e.subcategory})
                </option>
              ))}
            </select>
          </div>

          <div className="p-4 rounded-xl bg-pink-50/50 border border-pink-100">
            <label className="block text-xs font-bold text-pink-900 uppercase tracking-wider mb-2">
              Select Second Event (B)
            </label>
            <select
              value={compareEventIdB}
              onChange={(e) => setCompareEventIdB(e.target.value)}
              className="w-full p-2.5 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-900 focus:outline-none focus:border-pink-600"
            >
              {events.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.title} ({e.category.toUpperCase()} • {e.subcategory})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Side by Side Comparative Metrics */}
        {eventA && eventB && statsA && statsB && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-2">
            {/* Event A Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-indigo-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded">
                    EVENT A • {eventA.subcategory}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 mt-1">{eventA.title}</h3>
                </div>
                <Link
                  href={`/admin/events/${eventA.id}/analytics`}
                  className="px-3 py-1.5 bg-indigo-600 text-white rounded-lg text-xs font-bold hover:bg-indigo-700 transition"
                >
                  Full View
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Total Registered</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">{eventA.registeredCount} / {eventA.capacity}</div>
                  <div className="text-[10px] text-indigo-600 font-semibold mt-1">{statsA.capacityPercent}% capacity</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Check-In Rate</div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">{statsA.checkInRate}%</div>
                  <div className="text-[10px] text-gray-500 mt-1">{statsA.checkedIn} verified entries</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">RVRJC Ratio</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">{statsA.rvrjc} students</div>
                  <div className="text-[10px] text-gray-500 mt-1">{statsA.other} external colleges</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Format</div>
                  <div className="text-base font-bold text-gray-900 mt-0.5">{eventA.teamRequirement}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{eventA.minTeamSize}-{eventA.maxTeamSize} team size</div>
                </div>
              </div>
            </div>

            {/* Event B Card */}
            <div className="p-5 rounded-2xl bg-white border-2 border-pink-200 space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] font-black uppercase text-pink-600 bg-pink-50 px-2 py-0.5 rounded">
                    EVENT B • {eventB.subcategory}
                  </span>
                  <h3 className="font-bold text-base text-gray-900 mt-1">{eventB.title}</h3>
                </div>
                <Link
                  href={`/admin/events/${eventB.id}/analytics`}
                  className="px-3 py-1.5 bg-pink-600 text-white rounded-lg text-xs font-bold hover:bg-pink-700 transition"
                >
                  Full View
                </Link>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Total Registered</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">{eventB.registeredCount} / {eventB.capacity}</div>
                  <div className="text-[10px] text-pink-600 font-semibold mt-1">{statsB.capacityPercent}% capacity</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Check-In Rate</div>
                  <div className="text-xl font-bold text-emerald-600 mt-0.5">{statsB.checkInRate}%</div>
                  <div className="text-[10px] text-gray-500 mt-1">{statsB.checkedIn} verified entries</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">RVRJC Ratio</div>
                  <div className="text-xl font-bold text-gray-900 mt-0.5">{statsB.rvrjc} students</div>
                  <div className="text-[10px] text-gray-500 mt-1">{statsB.other} external colleges</div>
                </div>
                <div className="p-3 bg-gray-50 rounded-xl">
                  <div className="text-gray-500">Format</div>
                  <div className="text-base font-bold text-gray-900 mt-0.5">{eventB.teamRequirement}</div>
                  <div className="text-[10px] text-gray-500 mt-1">{eventB.minTeamSize}-{eventB.maxTeamSize} team size</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Two Worlds & Institutional Demographics */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Cultural vs Sports Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-gray-900 flex items-center justify-between">
            <span>Two Worlds Distribution</span>
            <span className="text-xs text-gray-500 font-normal">Active Categories</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#FF2E93]">CULTURAL WORLD</span>
                <span>{culturalRegs} participants ({regs.length > 0 ? Math.round((culturalRegs / regs.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#FF2E93] rounded-full"
                  style={{ width: `${regs.length > 0 ? (culturalRegs / regs.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-[#FF5E3A]">SPORTS ARENA</span>
                <span>{sportsRegs} participants ({regs.length > 0 ? Math.round((sportsRegs / regs.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-[#FF5E3A] rounded-full"
                  style={{ width: `${regs.length > 0 ? (sportsRegs / regs.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Institution Distribution */}
        <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
          <h3 className="font-display font-bold text-lg text-gray-900 flex items-center justify-between">
            <span>Institutional Demographics</span>
            <span className="text-xs text-gray-500 font-normal">College Representation</span>
          </h3>

          <div className="space-y-4 pt-2">
            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-indigo-600">R.V.R. & J.C. College of Engineering</span>
                <span>{rvrjcCount} ({regs.length > 0 ? Math.round((rvrjcCount / regs.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-indigo-600 rounded-full"
                  style={{ width: `${regs.length > 0 ? (rvrjcCount / regs.length) * 100 : 0}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-bold mb-1">
                <span className="text-pink-600">External Colleges</span>
                <span>{otherCount} ({regs.length > 0 ? Math.round((otherCount / regs.length) * 100) : 0}%)</span>
              </div>
              <div className="w-full h-3 rounded-full bg-gray-100 overflow-hidden">
                <div
                  className="h-full bg-pink-500 rounded-full"
                  style={{ width: `${regs.length > 0 ? (otherCount / regs.length) * 100 : 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Events Capacity Utilization Table with Direct Analytics Link */}
      <div className="p-6 rounded-2xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="font-display font-bold text-lg text-gray-900">
            Championship Capacity Utilization & Command Links
          </h3>
          <span className="text-xs text-gray-500">{events.length} Programmed Events</span>
        </div>

        <div className="divide-y divide-gray-100">
          {events.map((evt) => {
            const pct = Math.min(100, Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100));
            return (
              <div key={evt.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-bold text-gray-900 text-sm">{evt.title}</span>
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        evt.category === 'cultural'
                          ? 'bg-pink-100 text-pink-700'
                          : evt.category === 'sports'
                          ? 'bg-orange-100 text-orange-700'
                          : 'bg-indigo-100 text-indigo-700'
                      }`}
                    >
                      {evt.subcategory}
                    </span>
                  </div>
                  <div className="text-gray-500">
                    {evt.venueName} • {evt.registeredCount} / {evt.capacity} registered ({pct}%)
                  </div>
                  <div className="w-full max-w-md bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
                    <div
                      className={`h-full rounded-full ${evt.category === 'cultural' ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <Link
                    href={`/admin/events/${evt.id}/analytics`}
                    className="px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-bold rounded-lg text-xs transition flex items-center gap-1 border border-indigo-200"
                  >
                    <span>Event Command Center</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
