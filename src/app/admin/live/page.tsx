'use client';

import React, { useState, useEffect } from 'react';
import {
  Radio,
  Clock,
  MapPin,
  AlertTriangle,
  CheckCircle2,
  Play,
  Pause,
  RefreshCw,
  Send,
  Sparkles,
} from 'lucide-react';

export default function AdminLiveControlPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [noticeText, setNoticeText] = useState('');
  const [updating, setUpdating] = useState(false);
  const [actionSuccess, setActionSuccess] = useState('');

  const fetchState = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setData(json);
          setNoticeText(json.settings.emergencyNotice || '');
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchState();
  }, []);

  const handleStatusChange = async (newStatus: string) => {
    setUpdating(true);
    setActionSuccess('');

    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'SET_FESTIVAL_STATUS',
          updates: { status: newStatus },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(`Festival status updated to ${newStatus}`);
        fetchState();
      }
    } finally {
      setUpdating(false);
    }
  };

  const handleEmergencyToggle = async (active: boolean) => {
    setUpdating(true);
    try {
      const res = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'TOGGLE_EMERGENCY',
          updates: {
            emergencyNoticeActive: active,
            emergencyNotice: noticeText,
          },
        }),
      });
      const json = await res.json();
      if (json.success) {
        setActionSuccess(active ? 'Emergency notice published!' : 'Emergency notice deactivated.');
        fetchState();
      }
    } finally {
      setUpdating(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading Live Control...</div>;
  }

  const settings = data?.settings || {};
  const events = data?.events || [];
  const publishedEvents = events.filter((e: any) => e.status === 'PUBLISHED' || e.status === 'LIVE');
  const liveEvents = events.filter((e: any) => e.status === 'LIVE');
  const nowEvent = liveEvents[0] || publishedEvents[0];
  const nextEvent = liveEvents.length > 0 ? publishedEvents[0] : publishedEvents[1];

  return (
    <div className="space-y-8 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-100 text-red-700 text-xs font-black uppercase tracking-widest mb-2">
            <Radio className="w-3.5 h-3.5 animate-pulse" />
            <span>FESTIVAL DAY OPERATIONS</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            LIVE FESTIVAL CONTROL
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Real-time status management, NOW / NEXT / LATER scheduling, and emergency announcements.
          </p>
        </div>

        <button
          onClick={fetchState}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-white border border-gray-200 text-xs font-bold text-[#090814] hover:bg-gray-50 shadow-sm"
        >
          <RefreshCw className="w-3.5 h-3.5" />
          <span>Refresh Live Pulse</span>
        </button>
      </div>

      {actionSuccess && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{actionSuccess}</span>
        </div>
      )}

      {/* Festival State Switcher */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <span className="text-xs font-extrabold uppercase tracking-widest text-[#717188] block">
          Current Global Festival State
        </span>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {['UPCOMING', 'LIVE', 'PAUSED', 'COMPLETED'].map((st) => {
            const isCurrent = settings.status === st;
            return (
              <button
                key={st}
                disabled={updating}
                onClick={() => handleStatusChange(st)}
                className={`p-4 rounded-2xl border-2 text-left transition-all ${
                  isCurrent
                    ? st === 'LIVE'
                      ? 'bg-red-500 text-white border-red-500 shadow-md scale-[1.02]'
                      : 'bg-[#090814] text-white border-black shadow-md scale-[1.02]'
                    : 'bg-[#FBFBFD] text-[#090814] border-gray-200 hover:border-gray-400'
                }`}
              >
                <span className={`text-[10px] font-black uppercase tracking-wider block ${isCurrent ? 'text-white' : 'text-[#717188]'}`}>
                  State
                </span>
                <span className="font-display font-black text-lg block mt-0.5">
                  {st}
                </span>
                {isCurrent && (
                  <span className="text-[10px] font-bold mt-1 inline-block bg-white/20 px-2 py-0.5 rounded">
                    ACTIVE NOW
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Emergency Notice Publisher */}
      <div className="p-6 rounded-3xl bg-white border border-gray-200 shadow-sm space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500" />
            <h3 className="font-display font-bold text-base text-[#090814]">
              Emergency Announcement Banner
            </h3>
          </div>

          <span
            className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wider ${
              settings.emergencyNoticeActive
                ? 'bg-red-100 text-red-700'
                : 'bg-gray-100 text-gray-600'
            }`}
          >
            {settings.emergencyNoticeActive ? 'LIVE ON HOMEPAGE' : 'INACTIVE'}
          </span>
        </div>

        <p className="text-xs text-[#525266]">
          Broadcast an urgent alert across the public website (e.g. weather adjustments, venue shifts, reporting call).
        </p>

        <textarea
          rows={2}
          value={noticeText}
          onChange={(e) => setNoticeText(e.target.value)}
          placeholder="e.g. Due to rain, the Western Street Dance is shifted from OAT to Silver Jubilee Auditorium at 3:00 PM."
          className="w-full p-3 rounded-xl border border-gray-300 text-xs sm:text-sm font-medium focus:border-red-500"
        />

        <div className="flex items-center justify-end gap-3">
          {settings.emergencyNoticeActive && (
            <button
              onClick={() => handleEmergencyToggle(false)}
              disabled={updating}
              className="px-4 py-2 rounded-xl bg-gray-200 hover:bg-gray-300 text-xs font-bold text-[#090814]"
            >
              Take Down Notice
            </button>
          )}

          <button
            onClick={() => handleEmergencyToggle(true)}
            disabled={updating || !noticeText.trim()}
            className="px-6 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-md transition-all flex items-center gap-2"
          >
            <Send className="w-3.5 h-3.5" />
            <span>Publish Emergency Notice</span>
          </button>
        </div>
      </div>

      {/* Real-time Arena Status (NOW / NEXT) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="p-6 rounded-3xl bg-[#FBFBFD] border-2 border-red-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-red-600 bg-red-100 px-3 py-1 rounded-full">
              NOW LIVE IN ARENA
            </span>
          </div>

          {nowEvent ? (
            <div>
              <h3 className="font-display font-black text-xl text-[#090814] mb-1">
                {nowEvent.title}
              </h3>
              <p className="text-xs text-[#525266] mb-4">
                Venue: <strong>{nowEvent.venueName}</strong> • {nowEvent.startTime} - {nowEvent.endTime}
              </p>
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex justify-between">
                <span>Total Registrations:</span>
                <strong className="text-[#090814]">{nowEvent.registeredCount}</strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#717188]">No event currently live.</p>
          )}
        </div>

        <div className="p-6 rounded-3xl bg-[#FBFBFD] border-2 border-gray-200 space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-black uppercase tracking-widest text-[#5227FF] bg-primary-light px-3 py-1 rounded-full">
              NEXT SCHEDULED TOURNAMENT
            </span>
          </div>

          {nextEvent ? (
            <div>
              <h3 className="font-display font-black text-xl text-[#090814] mb-1">
                {nextEvent.title}
              </h3>
              <p className="text-xs text-[#525266] mb-4">
                Venue: <strong>{nextEvent.venueName}</strong> • {nextEvent.startTime} - {nextEvent.endTime}
              </p>
              <div className="p-3 bg-white rounded-xl border border-gray-200 text-xs flex justify-between">
                <span>Slots Allocated:</span>
                <strong className="text-[#090814]">{nextEvent.registeredCount} / {nextEvent.capacity}</strong>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#717188]">No next event queued.</p>
          )}
        </div>
      </div>
    </div>
  );
}
