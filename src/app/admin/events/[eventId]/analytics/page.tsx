'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  ArrowLeft,
  Calendar,
  Clock,
  MapPin,
  Users,
  CheckCircle2,
  AlertCircle,
  Download,
  Printer,
  QrCode,
  Share2,
  Building,
  GraduationCap,
  Sparkles,
  BarChart3,
  TrendingUp,
  PieChart,
  UserCheck,
  Search,
  Check,
} from 'lucide-react';
import { generateCsvContent } from '@/lib/utils';

export default function EventAnalyticsPage() {
  const params = useParams();
  const eventId = params?.eventId as string;
  const router = useRouter();

  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [checkingInId, setCheckingInId] = useState<string | null>(null);

  const fetchEventAnalytics = () => {
    fetch(`/api/admin/events/${eventId}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
        }
      })
      .catch((err) => console.error('Failed to load event data:', err))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchEventAnalytics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [eventId]);

  const event = data?.event;
  const venue = data?.venue;
  const stats = data?.stats;
  const registrations: any[] = useMemo(() => data?.registrations || [], [data?.registrations]);
  const checkIns: any[] = useMemo(() => data?.checkIns || [], [data?.checkIns]);

  // Compute department breakdown
  const departmentBreakdown = useMemo(() => {
    const map: Record<string, number> = {};
    for (const reg of registrations) {
      const dept = reg.department || 'General / Unspecified';
      map[dept] = (map[dept] || 0) + 1;
    }
    return Object.entries(map).sort((a, b) => b[1] - a[1]);
  }, [registrations]);

  // Compute college breakdown
  const collegeBreakdown = useMemo(() => {
    let rvrjcCount = 0;
    let otherCount = 0;
    const collegeMap: Record<string, number> = {};

    for (const reg of registrations) {
      if (reg.collegeType === 'RVRJC' || reg.collegeName?.includes('R.V.R.') || reg.collegeName?.includes('RVR')) {
        rvrjcCount++;
      } else {
        otherCount++;
      }
      const cName = reg.collegeName || 'Unknown College';
      collegeMap[cName] = (collegeMap[cName] || 0) + 1;
    }

    return {
      rvrjcCount,
      otherCount,
      topColleges: Object.entries(collegeMap).sort((a, b) => b[1] - a[1]),
    };
  }, [registrations]);

  // Compute year of study breakdown
  const yearBreakdown = useMemo(() => {
    const map: Record<string, number> = {
      '1st Year': 0,
      '2nd Year': 0,
      '3rd Year': 0,
      '4th Year': 0,
      'Other / PG': 0,
    };
    for (const reg of registrations) {
      const y = reg.year || '';
      if (y.includes('1')) map['1st Year']++;
      else if (y.includes('2')) map['2nd Year']++;
      else if (y.includes('3')) map['3rd Year']++;
      else if (y.includes('4')) map['4th Year']++;
      else map['Other / PG']++;
    }
    return map;
  }, [registrations]);

  // Compute registration timeline (cumulative over days)
  const timelineData = useMemo(() => {
    if (registrations.length === 0) return [];
    const dateMap: Record<string, number> = {};

    for (const reg of registrations) {
      const d = reg.createdAt ? reg.createdAt.split('T')[0] : '2026-12-01';
      dateMap[d] = (dateMap[d] || 0) + 1;
    }

    const sortedDates = Object.keys(dateMap).sort();
    let cumulative = 0;
    return sortedDates.map((date) => {
      cumulative += dateMap[date];
      return { date, count: dateMap[date], cumulative };
    });
  }, [registrations]);

  // Filtered registrations for table
  const filteredRegistrations = useMemo(() => {
    if (!searchTerm.trim()) return registrations;
    const term = searchTerm.toLowerCase();
    return registrations.filter(
      (r) =>
        r.participantName?.toLowerCase().includes(term) ||
        r.collegeName?.toLowerCase().includes(term) ||
        r.id?.toLowerCase().includes(term) ||
        r.phone?.includes(term) ||
        r.studentId?.toLowerCase().includes(term)
    );
  }, [registrations, searchTerm]);

  // Fast manual check-in from analytics table
  const handleQuickCheckIn = async (regId: string) => {
    setCheckingInId(regId);
    try {
      const res = await fetch('/api/checkin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ registrationId: regId, mode: 'MANUAL_ENTRY' }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        fetchEventAnalytics();
      } else {
        alert(resJson.message);
      }
    } catch (e: any) {
      alert('Check-in error: ' + e.message);
    } finally {
      setCheckingInId(null);
    }
  };

  // Export CSV
  const handleExportCsv = () => {
    if (!event || registrations.length === 0) return;
    const headers = [
      'Registration ID',
      'Participant Name',
      'Email',
      'Phone',
      'College Name',
      'College Type',
      'Department',
      'Year',
      'Student ID',
      'Team Name',
      'Registration Status',
      'Check-In Status',
      'Checked-In At',
      'Checked-In By',
      'Registered Date',
    ];

    const rows = registrations.map((r) => [
      r.id,
      r.participantName,
      r.email,
      r.phone,
      r.collegeName,
      r.collegeType,
      r.department || '',
      r.year || '',
      r.studentId || '',
      r.teamName || '',
      r.status,
      r.checkInStatus,
      r.checkedInAt || '',
      r.checkedInBy || '',
      r.createdAt,
    ]);

    const csvContent = generateCsvContent(headers, rows);
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${event.slug}-attendees-analytics.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="min-h-[500px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-sm font-medium text-slate-600">Generating event analytics command center...</p>
        </div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-8 text-center bg-white rounded-2xl border border-gray-200 shadow-sm max-w-lg mx-auto">
        <AlertCircle className="w-12 h-12 text-rose-500 mx-auto mb-3" />
        <h2 className="text-xl font-bold text-gray-900">Event Not Found</h2>
        <p className="text-sm text-gray-600 mt-1 mb-4">No matching festival event found with ID {eventId}.</p>
        <Link
          href="/admin/events"
          className="inline-flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl text-sm font-semibold hover:bg-indigo-700 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Event Directory
        </Link>
      </div>
    );
  }

  const capacity = event.capacity || 50;
  const registeredCount = registrations.length;
  const capacityPercent = Math.min(100, Math.round((registeredCount / capacity) * 100));
  const checkedInCount = registrations.filter((r) => r.checkInStatus === 'CHECKED_IN').length;
  const checkInPercent = registeredCount > 0 ? Math.round((checkedInCount / registeredCount) * 100) : 0;
  const pendingCount = Math.max(0, registeredCount - checkedInCount);

  return (
    <div className="space-y-6">
      {/* Top Header & Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Link
              href="/admin/events"
              className="text-xs font-semibold text-indigo-600 hover:text-indigo-800 flex items-center gap-1"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              Event Catalog
            </Link>
            <span className="text-gray-300">•</span>
            <Link
              href={`/admin/events/${event.id}`}
              className="text-xs font-semibold text-slate-500 hover:text-slate-800"
            >
              Event Overview
            </Link>
            <span className="text-gray-300">•</span>
            <span className="text-xs font-bold text-gray-900">Live Analytics</span>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
              {event.title}
            </h1>
            <span
              className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
                event.category === 'cultural'
                  ? 'bg-pink-100 text-pink-700 border border-pink-200'
                  : event.category === 'sports'
                  ? 'bg-orange-100 text-orange-700 border border-orange-200'
                  : 'bg-indigo-100 text-indigo-700 border border-indigo-200'
              }`}
            >
              {event.subcategory}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-4 mt-2 text-xs text-gray-600">
            <span className="flex items-center gap-1 font-medium">
              <Calendar className="w-3.5 h-3.5 text-slate-400" />
              {event.date}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <Clock className="w-3.5 h-3.5 text-slate-400" />
              {event.startTime} - {event.endTime}
            </span>
            <span className="flex items-center gap-1 font-medium">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              {venue?.name || event.venueName}
            </span>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-wrap items-center gap-2 print:hidden">
          <Link
            href={`/entry?eventId=${event.id}`}
            className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <QrCode className="w-3.5 h-3.5" />
            <span>Open Entry Gate Station</span>
          </Link>

          <button
            onClick={handleExportCsv}
            disabled={registrations.length === 0}
            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition disabled:opacity-50"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export CSV</span>
          </button>

          <button
            onClick={() => window.print()}
            className="px-3 py-2 bg-white hover:bg-gray-50 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-sm transition"
          >
            <Printer className="w-3.5 h-3.5 text-slate-500" />
            <span>Print Report</span>
          </button>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Registrations */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Total Registered</span>
            <Users className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="text-3xl font-extrabold text-gray-900 mt-2">
            {registeredCount}{' '}
            <span className="text-xs font-normal text-gray-500">/ {capacity} capacity</span>
          </div>
          {/* Capacity Progress Bar */}
          <div className="mt-3">
            <div className="flex justify-between text-[11px] font-semibold text-gray-600 mb-1">
              <span>Utilization</span>
              <span className={capacityPercent > 80 ? 'text-amber-600 font-bold' : 'text-indigo-600 font-bold'}>
                {capacityPercent}%
              </span>
            </div>
            <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all duration-500 ${
                  capacityPercent >= 90
                    ? 'bg-rose-500'
                    : capacityPercent >= 75
                    ? 'bg-amber-500'
                    : 'bg-indigo-600'
                }`}
                style={{ width: `${capacityPercent}%` }}
              />
            </div>
          </div>
        </div>

        {/* Checked In */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Checked In</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="text-3xl font-extrabold text-emerald-600 mt-2">
            {checkedInCount}
          </div>
          <div className="text-xs text-gray-500 mt-2 flex items-center justify-between">
            <span>Check-In Rate</span>
            <span className="font-bold text-emerald-600">{checkInPercent}%</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mt-1">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${checkInPercent}%` }}
            />
          </div>
        </div>

        {/* Pending Check-In */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pending Entry</span>
            <Clock className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-3xl font-extrabold text-amber-600 mt-2">
            {pendingCount}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Awaiting gate checkpoint badge verification
          </div>
        </div>

        {/* Team Requirement / Avg Team Size */}
        <div className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Participation Type</span>
            <Sparkles className="w-4 h-4 text-pink-600" />
          </div>
          <div className="text-xl font-extrabold text-gray-900 mt-2 uppercase">
            {event.teamRequirement}
          </div>
          <div className="text-xs text-gray-500 mt-2">
            Squad size: {event.minTeamSize === event.maxTeamSize ? `${event.minTeamSize} Members` : `${event.minTeamSize} to ${event.maxTeamSize} Members`}
          </div>
        </div>
      </div>

      {/* SVG Registration Timeline Line Chart */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-indigo-50 text-indigo-600">
              <TrendingUp className="w-4 h-4" />
            </div>
            <h2 className="font-bold text-gray-900 text-sm sm:text-base">
              Registration Cumulative Momentum Trend
            </h2>
          </div>
          <span className="text-xs font-semibold text-slate-500">
            {timelineData.length} Recording Points
          </span>
        </div>

        {timelineData.length === 0 ? (
          <div className="py-12 text-center text-gray-500 text-xs">
            No registration history recorded yet for this event.
          </div>
        ) : (
          <div className="w-full overflow-x-auto py-2">
            <div className="min-w-[500px] h-56 flex flex-col justify-between">
              {/* SVG Area & Line Chart */}
              <svg className="w-full h-44 overflow-visible" viewBox="0 0 500 160">
                <defs>
                  <linearGradient id="areaGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#4F46E5" stopOpacity="0.35" />
                    <stop offset="100%" stopColor="#4F46E5" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Guide lines */}
                <line x1="0" y1="20" x2="500" y2="20" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="70" x2="500" y2="70" stroke="#E2E8F0" strokeDasharray="3 3" />
                <line x1="0" y1="120" x2="500" y2="120" stroke="#E2E8F0" strokeDasharray="3 3" />

                {(() => {
                  const maxVal = Math.max(...timelineData.map((d) => d.cumulative), 1);
                  const n = timelineData.length;
                  const stepX = n > 1 ? 500 / (n - 1) : 250;

                  const points = timelineData.map((d, i) => {
                    const x = n > 1 ? i * stepX : 250;
                    const y = 140 - (d.cumulative / maxVal) * 110;
                    return { x, y, data: d };
                  });

                  const pathD = points.reduce(
                    (acc, p, idx) => (idx === 0 ? `M ${p.x} ${p.y}` : `${acc} L ${p.x} ${p.y}`),
                    ''
                  );
                  const areaD = `${pathD} L ${points[points.length - 1].x} 150 L ${points[0].x} 150 Z`;

                  return (
                    <g>
                      <path d={areaD} fill="url(#areaGradient)" />
                      <path d={pathD} fill="none" stroke="#4F46E5" strokeWidth="3" strokeLinecap="round" />
                      {points.map((p, idx) => (
                        <g key={idx} className="group cursor-pointer">
                          <circle cx={p.x} cy={p.y} r="5" fill="#4F46E5" stroke="#FFFFFF" strokeWidth="2" />
                          <text
                            x={p.x}
                            y={p.y - 10}
                            textAnchor="middle"
                            fontSize="10"
                            fontWeight="bold"
                            fill="#1E293B"
                          >
                            {p.data.cumulative}
                          </text>
                        </g>
                      ))}
                    </g>
                  );
                })()}
              </svg>

              {/* X Axis Date Labels */}
              <div className="flex justify-between text-[10px] text-gray-500 font-medium px-2 border-t border-gray-100 pt-1">
                {timelineData.map((d, i) => (
                  <span key={i}>{d.date}</span>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Breakdowns Grid: College, Department, Year */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* College Distribution Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <Building className="w-4 h-4 text-indigo-600" />
            <h3 className="font-bold text-gray-900 text-sm">College Representation</h3>
          </div>

          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-gray-600">R.V.R. & J.C. CE:</span>
            <span className="font-bold text-indigo-600">{collegeBreakdown.rvrjcCount}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-indigo-600 h-full rounded-full"
              style={{
                width: `${registeredCount > 0 ? (collegeBreakdown.rvrjcCount / registeredCount) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="flex items-center justify-between text-xs mb-2">
            <span className="font-semibold text-gray-600">Other Colleges:</span>
            <span className="font-bold text-pink-600">{collegeBreakdown.otherCount}</span>
          </div>
          <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden mb-4">
            <div
              className="bg-pink-500 h-full rounded-full"
              style={{
                width: `${registeredCount > 0 ? (collegeBreakdown.otherCount / registeredCount) * 100 : 0}%`,
              }}
            />
          </div>

          <div className="border-t border-gray-100 pt-3">
            <span className="text-[11px] font-bold text-gray-500 uppercase tracking-wider block mb-2">
              Top Participating Colleges
            </span>
            <ul className="space-y-1.5 text-xs text-gray-700 max-h-36 overflow-y-auto">
              {collegeBreakdown.topColleges.slice(0, 5).map(([name, count], i) => (
                <li key={i} className="flex justify-between items-center py-0.5">
                  <span className="truncate pr-2 font-medium">{name}</span>
                  <span className="font-bold text-slate-800 shrink-0">{count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Department Breakdown Card */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <GraduationCap className="w-4 h-4 text-emerald-600" />
            <h3 className="font-bold text-gray-900 text-sm">Department Breakdown</h3>
          </div>

          <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
            {departmentBreakdown.length === 0 ? (
              <p className="text-xs text-gray-400 py-6 text-center">No department data yet.</p>
            ) : (
              departmentBreakdown.map(([dept, count], idx) => {
                const percent = registeredCount > 0 ? Math.round((count / registeredCount) * 100) : 0;
                return (
                  <div key={idx} className="space-y-1 text-xs">
                    <div className="flex justify-between font-medium">
                      <span className="truncate text-gray-700">{dept}</span>
                      <span className="font-bold text-gray-900 shrink-0">{count} ({percent}%)</span>
                    </div>
                    <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-emerald-500 h-full rounded-full"
                        style={{ width: `${percent}%` }}
                      />
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Academic Year Distribution */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-3">
            <BarChart3 className="w-4 h-4 text-pink-600" />
            <h3 className="font-bold text-gray-900 text-sm">Academic Year Distribution</h3>
          </div>

          <div className="space-y-3 pt-1">
            {Object.entries(yearBreakdown).map(([yearName, count], idx) => {
              const percent = registeredCount > 0 ? Math.round((count / registeredCount) * 100) : 0;
              return (
                <div key={idx} className="space-y-1 text-xs">
                  <div className="flex justify-between font-medium">
                    <span className="text-gray-700">{yearName}</span>
                    <span className="font-bold text-gray-900">{count} ({percent}%)</span>
                  </div>
                  <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-pink-500 to-indigo-600 h-full rounded-full"
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Registered Participants Roster */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div>
            <h2 className="font-bold text-gray-900 text-base">Registered Participants Roster</h2>
            <p className="text-xs text-gray-500 mt-0.5">
              Verified attendee list with live check-in toggle and search.
            </p>
          </div>

          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search name, ID, college..."
              className="w-full pl-9 pr-3 py-1.5 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-600"
            />
          </div>
        </div>

        {filteredRegistrations.length === 0 ? (
          <div className="text-center py-10 text-gray-400 text-xs">
            {registrations.length === 0 ? 'No participants registered for this event yet.' : 'No participants matching search filter.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
                <tr>
                  <th className="py-2.5 px-3">Participant</th>
                  <th className="py-2.5 px-3">Contact</th>
                  <th className="py-2.5 px-3">College & Dept</th>
                  <th className="py-2.5 px-3">Team / Pass</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredRegistrations.map((reg) => (
                  <tr key={reg.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-3 px-3">
                      <div className="font-bold text-gray-900">{reg.participantName}</div>
                      <div className="text-[10px] text-indigo-600 font-mono">{reg.id}</div>
                    </td>
                    <td className="py-3 px-3 text-gray-600">
                      <div>{reg.phone}</div>
                      <div className="text-[10px] text-gray-400">{reg.email}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-800 truncate max-w-[200px]">{reg.collegeName}</div>
                      <div className="text-[10px] text-gray-500">{reg.department || 'General'} • {reg.year || 'Student'}</div>
                    </td>
                    <td className="py-3 px-3">
                      <div className="font-medium text-gray-700">{reg.teamName || 'Solo Entry'}</div>
                      <div className="text-[10px] font-mono text-gray-400">{reg.ticketId || 'N/A'}</div>
                    </td>
                    <td className="py-3 px-3">
                      {reg.checkInStatus === 'CHECKED_IN' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                          <Check className="w-3 h-3" />
                          Checked In
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                          <Clock className="w-3 h-3" />
                          Pending Entry
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 text-right">
                      {reg.checkInStatus !== 'CHECKED_IN' ? (
                        <button
                          onClick={() => handleQuickCheckIn(reg.id)}
                          disabled={checkingInId === reg.id}
                          className="px-2.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-sm transition disabled:opacity-50"
                        >
                          {checkingInId === reg.id ? 'Checking In...' : 'Verify Entry'}
                        </button>
                      ) : (
                        <span className="text-[11px] font-mono text-gray-400">
                          {reg.checkedInAt ? new Date(reg.checkedInAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Verified'}
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
