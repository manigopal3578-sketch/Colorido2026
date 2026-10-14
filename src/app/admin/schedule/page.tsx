'use client';

import React, { useState, useEffect } from 'react';
import {
  Calendar,
  Clock,
  MapPin,
  CheckCircle,
  Search,
  ArrowRight,
  Sparkles,
  Trophy,
  Save,
} from 'lucide-react';
import Link from 'next/link';

export default function ScheduleAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeDate, setActiveDate] = useState('2026-12-28');
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'cultural' | 'sports'>('ALL');
  const [search, setSearch] = useState('');
  const [editingEvent, setEditingEvent] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null);

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

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
  };

  const handleSaveSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/events', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: editingEvent.id,
          updates: {
            date: editingEvent.date,
            startTime: editingEvent.startTime,
            endTime: editingEvent.endTime,
            venueId: editingEvent.venueId,
            venueName: data.venues.find((v: any) => v.id === editingEvent.venueId)?.name || editingEvent.venueName,
          },
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Schedule time & venue updated successfully');
        setEditingEvent(null);
        fetchData();
      } else {
        showToast(resJson.message || 'Failed to update schedule', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const events = data.events || [];
  const venues = data.venues || [];

  const filteredEvents = events
    .filter((evt: any) => evt.date === activeDate && evt.status !== 'ARCHIVED' && evt.status !== 'POSTPONED')
    .filter((evt: any) => selectedCategory === 'ALL' || evt.category === selectedCategory)
    .filter((evt: any) =>
      search
        ? evt.title.toLowerCase().includes(search.toLowerCase()) ||
          evt.venueName.toLowerCase().includes(search.toLowerCase())
        : true
    )
    .sort((a: any, b: any) => a.startTime.localeCompare(b.startTime));

  return (
    <div className="space-y-6">
      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 ${toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'}`}>
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <Calendar className="w-4 h-4" />
            <span>Master Timetable Operations</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Festival Schedule Admin
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Manage slots, venue allocations, and timings for the 2-day festival (Dec 28–29, 2026).
          </p>
        </div>

        {/* Date Tabs */}
        <div className="flex items-center gap-2 p-1.5 bg-white border border-gray-200 rounded-2xl shadow-xs">
          <button
            onClick={() => setActiveDate('2026-12-28')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDate === '2026-12-28'
                ? 'bg-[#5227FF] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814]'
            }`}
          >
            Day 01 — 28 Dec 2026
          </button>
          <button
            onClick={() => setActiveDate('2026-12-29')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all ${
              activeDate === '2026-12-29'
                ? 'bg-[#FF5E3A] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814]'
            }`}
          >
            Day 02 — 29 Dec 2026
          </button>
        </div>
      </div>

      {/* Controls & Search */}
      <div className="flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search scheduled events or venues..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs text-[#090814] placeholder-gray-400 focus:outline-none focus:border-[#5227FF] shadow-xs"
          />
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
              selectedCategory === 'ALL'
                ? 'bg-[#090814] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            All Worlds
          </button>
          <button
            onClick={() => setSelectedCategory('cultural')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'cultural'
                ? 'bg-[#FF2E93] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5" />
            Cultural
          </button>
          <button
            onClick={() => setSelectedCategory('sports')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
              selectedCategory === 'sports'
                ? 'bg-[#FF5E3A] text-white shadow-xs'
                : 'text-[#525266] hover:text-[#090814] bg-white border border-gray-200'
            }`}
          >
            <Trophy className="w-3.5 h-3.5" />
            Sports
          </button>
        </div>
      </div>

      {/* Schedule Items List */}
      <div className="space-y-3">
        {filteredEvents.length === 0 ? (
          <div className="p-12 text-center bg-white border border-gray-200 rounded-2xl shadow-xs">
            <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-[#525266] text-sm font-semibold">No events scheduled for this filter.</p>
          </div>
        ) : (
          filteredEvents.map((evt: any) => {
            const isCultural = evt.category === 'cultural';

            return (
              <div
                key={evt.id}
                className="p-4 bg-white hover:bg-gray-50/80 border border-gray-200 rounded-2xl flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all shadow-xs"
              >
                <div className="flex items-start gap-4">
                  {/* Time Badge */}
                  <div className="w-28 shrink-0 text-center p-2.5 rounded-xl bg-gray-100 border border-gray-200">
                    <span className="text-xs font-black text-[#090814] block">
                      {evt.startTime}
                    </span>
                    <span className="text-[10px] text-[#717188] font-bold block">to {evt.endTime}</span>
                  </div>

                  {/* Details */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span
                        className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white"
                        style={{ backgroundColor: isCultural ? '#FF2E93' : '#FF5E3A' }}
                      >
                        {evt.category}
                      </span>
                      <span className="text-[11px] font-bold text-[#525266]">
                        {evt.subcategory}
                      </span>
                      {evt.status === 'LIVE' && (
                        <span className="px-2 py-0.5 rounded text-[10px] font-black bg-red-600 text-white animate-pulse">
                          LIVE NOW
                        </span>
                      )}
                    </div>

                    <h3 className="text-base font-black text-[#090814] font-display">
                      {evt.title}
                    </h3>

                    <div className="flex items-center gap-4 text-xs text-[#525266]">
                      <span className="flex items-center gap-1 font-semibold">
                        <MapPin className="w-3.5 h-3.5 text-[#5227FF]" />
                        {evt.venueName}
                      </span>
                      <span>Capacity: {evt.capacity}</span>
                      <span>Registered: {evt.registeredCount}</span>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 shrink-0 self-end md:self-center">
                  <button
                    onClick={() => setEditingEvent(evt)}
                    className="px-3.5 py-1.5 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#090814] text-xs font-bold transition-colors border border-gray-200"
                  >
                    Quick Reschedule
                  </button>
                  <Link
                    href={`/admin/events/${evt.id}`}
                    className="p-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-[#525266] hover:text-[#090814] transition-colors border border-gray-200"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Reschedule Modal */}
      {editingEvent && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-5 shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <h3 className="text-lg font-black text-[#090814] font-display">Reschedule Event</h3>
                <p className="text-xs text-[#525266] font-medium truncate max-w-xs">{editingEvent.title}</p>
              </div>
              <button
                onClick={() => setEditingEvent(null)}
                className="text-gray-400 hover:text-black text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveSchedule} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Festival Date</label>
                <select
                  value={editingEvent.date}
                  onChange={(e) => setEditingEvent({ ...editingEvent, date: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                >
                  <option value="2026-12-28">Day 01 — 28 December 2026</option>
                  <option value="2026-12-29">Day 02 — 29 December 2026</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Start Time</label>
                  <input
                    type="time"
                    value={editingEvent.startTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, startTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">End Time</label>
                  <input
                    type="time"
                    value={editingEvent.endTime}
                    onChange={(e) => setEditingEvent({ ...editingEvent, endTime: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Campus Venue</label>
                <select
                  value={editingEvent.venueId}
                  onChange={(e) => setEditingEvent({ ...editingEvent, venueId: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                >
                  {venues.map((v: any) => (
                    <option key={v.id} value={v.id}>
                      {v.name} ({v.type})
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setEditingEvent(null)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525266] hover:text-[#090814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 shadow-sm"
                >
                  <Save className="w-3.5 h-3.5" />
                  {saving ? 'Saving...' : 'Update Schedule'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
