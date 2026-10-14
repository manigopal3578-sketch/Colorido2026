'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  CalendarDays,
  Plus,
  Search,
  Filter,
  Copy,
  Archive,
  Trash2,
  Edit,
  ExternalLink,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Sparkles,
  BarChart3,
} from 'lucide-react';
import { EventItem, VenueItem } from '@/lib/types';

export default function AdminEventsPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  // Form State for Event Creation
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<'cultural' | 'sports'>('cultural');
  const [subcategory, setSubcategory] = useState('Dance');
  const [description, setDescription] = useState('');
  const [rules, setRules] = useState('Standard collegiate championship rules apply.');
  const [eligibility, setEligibility] = useState('Bonafide college students.');
  const [date, setDate] = useState('2026-12-28');
  const [startTime, setStartTime] = useState('10:00');
  const [endTime, setEndTime] = useState('13:00');
  const [venueId, setVenueId] = useState('');
  const [capacity, setCapacity] = useState(50);
  const [teamRequirement, setTeamRequirement] = useState<'INDIVIDUAL' | 'TEAM'>('INDIVIDUAL');
  const [minTeamSize, setMinTeamSize] = useState(1);
  const [maxTeamSize, setMaxTeamSize] = useState(1);
  const [coordinatorName, setCoordinatorName] = useState('Faculty Coordinator');
  const [coordinatorPhone, setCoordinatorPhone] = useState('+91 863 2288201');
  const [coordinatorEmail, setCoordinatorEmail] = useState('colorido@rvrjcce.ac.in');
  const [coverImage, setCoverImage] = useState('');
  const [creating, setCreating] = useState(false);

  const fetchState = () => {
    fetch('/api/data/state')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setEvents(json.events || []);
          setVenues(json.venues || []);
          if (json.venues?.length > 0 && !venueId) {
            setVenueId(json.venues[0].id);
          }
        }
      })
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchState();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setCreating(true);

    try {
      const res = await fetch('/api/admin/events', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'CREATE',
          eventData: {
            title,
            category,
            subcategory,
            description,
            rules: rules.split('\n').filter(Boolean),
            eligibility,
            date,
            startTime,
            endTime,
            venueId,
            capacity: Number(capacity),
            teamRequirement,
            minTeamSize: Number(minTeamSize),
            maxTeamSize: Number(maxTeamSize),
            coordinatorName,
            coordinatorPhone,
            coordinatorEmail,
            coverImage: coverImage || undefined,
            status: 'PUBLISHED',
          },
        }),
      });

      const json = await res.json();
      if (json.success) {
        setActionMsg(`Event "${title}" successfully created and published!`);
        setShowCreateModal(false);
        fetchState();
      }
    } finally {
      setCreating(false);
    }
  };

  const handleDuplicate = async (id: string) => {
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'DUPLICATE', eventId: id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionMsg('Event duplicated as Draft.');
      fetchState();
    }
  };

  const handleArchive = async (id: string) => {
    if (!confirm('Are you sure you want to archive this event?')) return;
    const res = await fetch('/api/admin/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'ARCHIVE', eventId: id }),
    });
    const json = await res.json();
    if (json.success) {
      setActionMsg('Event moved to Archive.');
      fetchState();
    }
  };

  const filteredEvents = events.filter((e) => {
    const matchCat = categoryFilter === 'ALL' || e.category === categoryFilter;
    const matchSearch =
      e.title.toLowerCase().includes(search.toLowerCase()) ||
      e.venueName.toLowerCase().includes(search.toLowerCase()) ||
      e.id.toLowerCase().includes(search.toLowerCase());
    return matchCat && matchSearch;
  });

  if (loading) {
    return <div className="p-8 text-xs font-bold text-gray-500 uppercase tracking-widest">Loading events...</div>;
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary-light text-[#5227FF] text-xs font-black uppercase tracking-widest mb-2">
            <CalendarDays className="w-3.5 h-3.5" />
            <span>FESTIVAL EVENTS CATALOG</span>
          </div>
          <h1 className="font-display font-black text-3xl text-[#090814]">
            EVENTS OPERATIONS & ROSTER
          </h1>
          <p className="text-xs sm:text-sm text-[#525266]">
            Configure championships, schedule venues, monitor registrations, and launch individual event command desks.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Event</span>
        </button>
      </div>

      {actionMsg && (
        <div className="p-3.5 rounded-xl bg-green-50 border border-green-200 text-green-800 text-xs font-bold flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-green-600" />
          <span>{actionMsg}</span>
        </div>
      )}

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-2xl bg-white border border-gray-200 shadow-sm">
        <div className="relative w-full sm:w-80">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Search by event title, venue, or code..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-gray-200 text-xs sm:text-sm"
          />
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          {['ALL', 'cultural', 'sports', 'technical'].map((cat) => (
            <button
              key={cat}
              onClick={() => setCategoryFilter(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                categoryFilter === cat
                  ? 'bg-[#090814] text-white'
                  : 'bg-[#F5F5FA] text-[#525266] hover:bg-gray-200'
              }`}
            >
              {cat.toUpperCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredEvents.map((evt) => {
          const isCultural = evt.category === 'cultural';
          const isPostponed = evt.status === 'POSTPONED';

          return (
            <div
              key={evt.id}
              className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between hover:shadow-md hover:border-gray-300 transition-all space-y-4"
            >
              <div>
                <div className="relative h-40 w-full rounded-xl overflow-hidden mb-3">
                  <img src={evt.coverImage} alt={evt.title} className="w-full h-full object-cover" />
                  <div className="absolute top-2 left-2">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                        isCultural ? 'bg-[#FF2E93]' : isPostponed ? 'bg-amber-600' : 'bg-[#FF5E3A]'
                      }`}
                    >
                      {evt.category} • {evt.status}
                    </span>
                  </div>
                </div>

                <span className="text-[10px] font-mono text-gray-400 block">{evt.id}</span>
                <h3 className="font-display font-bold text-base text-[#090814] leading-snug line-clamp-1">
                  {evt.title}
                </h3>
                <p className="text-xs text-[#525266] mt-1">
                  {evt.venueName} • {evt.date} ({evt.startTime})
                </p>

                <div className="mt-3 p-2.5 rounded-xl bg-[#FBFBFD] border border-gray-100 flex items-center justify-between text-xs text-[#525266]">
                  <span>Registrations: <strong>{evt.registeredCount} / {evt.capacity}</strong></span>
                  <span className="text-[#5227FF] font-bold">
                    {Math.round(((evt.registeredCount || 0) / (evt.capacity || 1)) * 100)}%
                  </span>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                <Link
                  href={`/admin/events/${evt.id}`}
                  className="flex-1 py-2 px-3 rounded-lg bg-[#090814] hover:bg-black text-white text-xs font-bold text-center transition-colors"
                >
                  Manage
                </Link>

                <Link
                  href={`/admin/events/${evt.id}/analytics`}
                  title="Event Analytics & Attendance"
                  className="py-2 px-3 rounded-lg bg-indigo-50 hover:bg-indigo-100 border border-indigo-200 text-indigo-700 text-xs font-bold text-center transition-colors flex items-center gap-1"
                >
                  <BarChart3 className="w-3.5 h-3.5" />
                  <span>Analytics</span>
                </Link>

                <button
                  onClick={() => handleDuplicate(evt.id)}
                  title="Duplicate Event"
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-100 text-gray-600"
                >
                  <Copy className="w-3.5 h-3.5" />
                </button>

                <button
                  onClick={() => handleArchive(evt.id)}
                  title="Archive Event"
                  className="p-2 rounded-lg border border-gray-200 hover:bg-amber-50 hover:text-amber-700 text-gray-600"
                >
                  <Archive className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Create Event Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-2xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <h3 className="font-display font-black text-xl text-[#090814]">
                CREATE NEW FESTIVAL EVENT
              </h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600 text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreate} className="space-y-4 text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#090814] mb-1">Event Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Swara Sangeet — Solo Classical Vocal"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 text-sm font-medium"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Category *</label>
                  <select
                    value={category}
                    onChange={(e: any) => setCategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="cultural">CULTURAL</option>
                    <option value="sports">SPORTS</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Subcategory *</label>
                  <input
                    type="text"
                    required
                    placeholder="Dance, Music, Cricket..."
                    value={subcategory}
                    onChange={(e) => setSubcategory(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Festival Date *</label>
                  <select
                    value={date}
                    onChange={(e) => setDate(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="2026-12-28">28 December 2026 (Day 01)</option>
                    <option value="2026-12-29">29 December 2026 (Day 02)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Campus Venue *</label>
                  <select
                    value={venueId}
                    onChange={(e) => setVenueId(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    {venues.map((v) => (
                      <option key={v.id} value={v.id}>{v.name}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Start Time *</label>
                  <input
                    type="time"
                    required
                    value={startTime}
                    onChange={(e) => setStartTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">End Time *</label>
                  <input
                    type="time"
                    required
                    value={endTime}
                    onChange={(e) => setEndTime(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Max Capacity *</label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={capacity}
                    onChange={(e) => setCapacity(Number(e.target.value))}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#090814] mb-1">Team Requirement *</label>
                  <select
                    value={teamRequirement}
                    onChange={(e: any) => setTeamRequirement(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200 bg-white"
                  >
                    <option value="INDIVIDUAL">INDIVIDUAL</option>
                    <option value="TEAM">TEAM / SQUAD</option>
                  </select>
                </div>

                {teamRequirement === 'TEAM' && (
                  <>
                    <div>
                      <label className="block font-bold text-[#090814] mb-1">Min Squad Size *</label>
                      <input
                        type="number"
                        min={1}
                        value={minTeamSize}
                        onChange={(e) => setMinTeamSize(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-gray-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-[#090814] mb-1">Max Squad Size *</label>
                      <input
                        type="number"
                        min={1}
                        value={maxTeamSize}
                        onChange={(e) => setMaxTeamSize(Number(e.target.value))}
                        className="w-full p-2.5 rounded-xl border border-gray-200"
                      />
                    </div>
                  </>
                )}

                <div className="sm:col-span-2">
                  <label className="block font-bold text-[#090814] mb-1">Description *</label>
                  <textarea
                    rows={2}
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-gray-200"
                  />
                </div>
              </div>

              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 font-bold text-[#090814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-6 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white font-bold shadow-md"
                >
                  {creating ? 'Saving Event...' : 'Publish Event'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
