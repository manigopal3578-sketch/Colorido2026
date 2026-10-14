'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Edit,
  Save,
  Eye,
  ExternalLink,
  Sparkles,
  X,
  Users,
  Building,
  DollarSign,
  ArrowRight,
} from 'lucide-react';
import { ResultItem, EventItem, RegistrationItem } from '@/lib/types';

export default function AdminResultsPage() {
  const [results, setResults] = useState<ResultItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const [editingItem, setEditingItem] = useState<ResultItem | null>(null);
  const [previewItem, setPreviewItem] = useState<ResultItem | null>(null);
  const [saving, setSaving] = useState(false);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'cultural' | 'sports'>('ALL');
  const [selectedEventIdFilter, setSelectedEventIdFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');
  const [msg, setMsg] = useState('');

  const fetchData = async () => {
    try {
      const [resResults, resState] = await Promise.all([
        fetch('/api/admin/results').then((r) => r.json()),
        fetch('/api/data/state').then((r) => r.json()),
      ]);

      if (resResults.success) {
        setResults(resResults.results || []);
      }
      if (resState.success) {
        setEvents(resState.events || []);
        setRegistrations(resState.registrations || []);
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

  const handleSaveResult = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!editingItem) return;

    setSaving(true);
    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editingItem),
      });

      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setEditingItem(null);
        setMsg('Results successfully updated and ratified!');
        setTimeout(() => setMsg(''), 4000);
      } else {
        alert(data.message || 'Failed to save results');
      }
    } catch (e: any) {
      alert('Network error saving results');
    } finally {
      setSaving(false);
    }
  };

  const handleTogglePublish = async (item: ResultItem) => {
    const newPublished = !item.published;
    const updated: ResultItem = {
      ...item,
      published: newPublished,
      status: newPublished ? 'PUBLISHED' : 'PENDING',
    };

    try {
      const res = await fetch('/api/admin/results', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updated),
      });
      const data = await res.json();
      if (data.success) {
        setResults(data.results);
        setMsg(
          newPublished
            ? `Standings for "${item.eventTitle}" are now LIVE on the public website!`
            : `Unpublished results for "${item.eventTitle}". Reverted to pending.`
        );
        setTimeout(() => setMsg(''), 4000);
      }
    } catch (e) {
      console.error(e);
    }
  };

  // Registrations filtered for the currently editing event
  const eventRegistrations = useMemo(() => {
    if (!editingItem) return [];
    return registrations.filter((r) => r.eventId === editingItem.eventId);
  }, [editingItem, registrations]);

  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const matchCat =
        categoryFilter === 'ALL' || res.category?.toLowerCase() === categoryFilter.toLowerCase();
      const matchEvent =
        selectedEventIdFilter === 'ALL' || res.eventId === selectedEventIdFilter;
      const query = searchQuery.trim().toLowerCase();
      const matchSearch =
        !query ||
        res.eventTitle.toLowerCase().includes(query) ||
        res.subcategory?.toLowerCase().includes(query) ||
        res.winner?.name.toLowerCase().includes(query) ||
        res.winner?.college.toLowerCase().includes(query);

      return matchCat && matchEvent && matchSearch;
    });
  }, [results, categoryFilter, selectedEventIdFilter, searchQuery]);

  // Handle participant auto-fill from dropdown
  const handleSelectParticipant = (
    tier: 'winner' | 'runnerUp' | 'secondRunnerUp',
    regId: string
  ) => {
    if (!editingItem) return;
    if (!regId) return;

    const reg = eventRegistrations.find((r) => r.id === regId);
    if (!reg) return;

    setEditingItem({
      ...editingItem,
      [tier]: {
        ...(editingItem[tier] || {}),
        name: reg.participantName,
        college: reg.collegeName,
        teamName: reg.teamName || undefined,
        teamMembers: reg.teamMembers?.map((m) => m.name) || undefined,
      },
    });
  };

  if (loading) {
    return (
      <div className="p-12 text-center text-xs font-bold text-gray-500 uppercase tracking-widest flex items-center justify-center gap-3">
        <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin" />
        <span>Loading Results System...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-5 shadow-sm">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-50 border border-indigo-200 text-indigo-700 text-xs font-black uppercase tracking-widest mb-2">
            <Trophy className="w-3.5 h-3.5" />
            <span>FESTIVAL JURY & PODIUM RATIFICATION</span>
          </div>
          <h1 className="font-display font-black text-2xl sm:text-3xl text-gray-900 tracking-tight">
            Festival Event Results Management
          </h1>
          <p className="text-xs sm:text-sm text-gray-600 mt-1">
            Pick winners from registered participants or type manual entries, assign genuine prizes, and manage live public ratification.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Link
            href="/results"
            target="_blank"
            className="px-3.5 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-300 text-gray-700 font-semibold rounded-xl text-xs flex items-center gap-1.5 transition shadow-xs"
          >
            <span>Preview Public Results</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>

      {msg && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold flex items-center gap-2 shadow-xs">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{msg}</span>
        </div>
      )}

      {/* Filter and Event Selector */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl p-4 shadow-sm">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          {/* Category Tabs */}
          <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-xl">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'ALL'
                  ? 'bg-white text-gray-900 shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              ALL
            </button>
            <button
              onClick={() => setCategoryFilter('cultural')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'cultural'
                  ? 'bg-pink-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              CULTURAL
            </button>
            <button
              onClick={() => setCategoryFilter('sports')}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition ${
                categoryFilter === 'sports'
                  ? 'bg-orange-600 text-white shadow-xs'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              SPORTS
            </button>
          </div>

          {/* Quick Event Selector Dropdown */}
          <select
            value={selectedEventIdFilter}
            onChange={(e) => setSelectedEventIdFilter(e.target.value)}
            className="px-3 py-1.5 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 bg-white focus:outline-none focus:border-indigo-600"
          >
            <option value="ALL">All Events ({results.length})</option>
            {events.map((evt) => (
              <option key={evt.id} value={evt.id}>
                [{evt.category.toUpperCase().slice(0, 4)}] {evt.title}
              </option>
            ))}
          </select>
        </div>

        {/* Search */}
        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search event, winner, or college..."
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-300 rounded-xl text-xs text-gray-900 placeholder-gray-500 focus:outline-none focus:border-indigo-600"
          />
        </div>
      </div>

      {/* Results Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Event Title</th>
                <th className="py-3 px-3">Category</th>
                <th className="py-3 px-3">Winner (1st Place)</th>
                <th className="py-3 px-3">Runner-Up (2nd Place)</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredResults.map((item) => (
                <tr key={item.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-3 max-w-[240px]">
                    <div className="font-bold text-gray-900 line-clamp-1">{item.eventTitle}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{item.eventId}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                        item.category === 'cultural'
                          ? 'bg-pink-100 text-pink-700'
                          : 'bg-orange-100 text-orange-700'
                      }`}
                    >
                      {item.subcategory}
                    </span>
                  </td>
                  <td className="py-3 px-3 max-w-[180px]">
                    {item.winner?.name ? (
                      <div>
                        <div className="font-bold text-emerald-700 line-clamp-1">🥇 {item.winner.name}</div>
                        <div className="text-[10px] text-gray-500 line-clamp-1">{item.winner.college}</div>
                        {item.winner.teamName && (
                          <div className="text-[9px] text-indigo-600 font-semibold">Team: {item.winner.teamName}</div>
                        )}
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">PENDING JURY DELIBERATION</span>
                    )}
                  </td>
                  <td className="py-3 px-3 max-w-[180px]">
                    {item.runnerUp?.name ? (
                      <div>
                        <div className="font-medium text-gray-800 line-clamp-1">🥈 {item.runnerUp.name}</div>
                        <div className="text-[10px] text-gray-500 line-clamp-1">{item.runnerUp.college}</div>
                      </div>
                    ) : (
                      <span className="text-gray-400 italic">—</span>
                    )}
                  </td>
                  <td className="py-3 px-3">
                    {item.published ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                        <CheckCircle2 className="w-3 h-3" />
                        Published
                      </span>
                    ) : item.status === 'DRAFT' ? (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-slate-100 text-slate-700 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Draft
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                        <Clock className="w-3 h-3" />
                        Pending
                      </span>
                    )}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => handleTogglePublish(item)}
                        className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
                          item.published
                            ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                            : 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        }`}
                      >
                        {item.published ? 'Unpublish' : 'Publish'}
                      </button>

                      <button
                        onClick={() => setEditingItem(item)}
                        className="px-2.5 py-1 bg-indigo-50 hover:bg-indigo-100 text-indigo-700 font-semibold rounded-lg text-xs transition flex items-center gap-1 border border-indigo-200"
                      >
                        <Edit className="w-3.5 h-3.5" />
                        <span>Manage Laurels</span>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Edit Winner Modal */}
      {editingItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
          <div className="w-full max-w-3xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 max-h-[92vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <div>
                <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-wider">
                  PODIUM RATIFICATION & PRIZE POOL
                </span>
                <h3 className="font-bold text-xl text-gray-900">{editingItem.eventTitle}</h3>
                <p className="text-xs text-gray-500 font-mono">{editingItem.eventId} • {eventRegistrations.length} registered participant(s)</p>
              </div>
              <button
                onClick={() => setEditingItem(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveResult} className="space-y-6 text-xs">
              {/* Status Radio / Selector */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-2">
                <label className="block font-bold text-gray-800 uppercase tracking-wider text-[11px]">
                  Publication Status
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, status: 'DRAFT', published: false })}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      editingItem.status === 'DRAFT'
                        ? 'bg-slate-900 text-white border-slate-900'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    DRAFT (Hidden)
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, status: 'PENDING', published: false })}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      editingItem.status === 'PENDING' && !editingItem.published
                        ? 'bg-amber-500 text-white border-amber-500'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    PENDING DELIBERATION
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingItem({ ...editingItem, status: 'PUBLISHED', published: true })}
                    className={`py-2 px-3 rounded-xl font-bold border transition text-center ${
                      editingItem.published
                        ? 'bg-emerald-600 text-white border-emerald-600'
                        : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-100'
                    }`}
                  >
                    PUBLISHED (Public)
                  </button>
                </div>
              </div>

              {/* 1st Prize Winner */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-amber-900 text-sm flex items-center gap-1.5">
                    <span>🥇 1st Prize Winner • Champion</span>
                  </h4>

                  {/* Registered participant picker */}
                  {eventRegistrations.length > 0 && (
                    <select
                      onChange={(e) => handleSelectParticipant('winner', e.target.value)}
                      className="px-2.5 py-1 border border-amber-300 rounded-lg text-xs bg-white text-amber-900 font-medium"
                    >
                      <option value="">-- Pick from Registered ({eventRegistrations.length}) --</option>
                      {eventRegistrations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.participantName} ({r.collegeName}) {r.teamName ? `[${r.teamName}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Participant / Winner Name *</label>
                    <input
                      type="text"
                      value={editingItem.winner?.name || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          winner: {
                            ...(editingItem.winner || { college: '' }),
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Rahul Sharma"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">College / Institution *</label>
                    <input
                      type="text"
                      value={editingItem.winner?.college || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          winner: {
                            ...(editingItem.winner || { name: '' }),
                            college: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. R.V.R. & J.C. College of Engg"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Team Name (If Team Event)</label>
                    <input
                      type="text"
                      value={editingItem.winner?.teamName || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          winner: {
                            ...(editingItem.winner || { name: '', college: '' }),
                            teamName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. RVR Strikers"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">1st Prize Cash Award</label>
                    <input
                      type="text"
                      value={editingItem.prizes?.firstPrize || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          prizes: {
                            ...(editingItem.prizes || {}),
                            firstPrize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹10,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-amber-600"
                    />
                  </div>
                </div>
              </div>

              {/* 2nd Prize Winner */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <span>🥈 2nd Prize Winner • Runner-Up</span>
                  </h4>

                  {eventRegistrations.length > 0 && (
                    <select
                      onChange={(e) => handleSelectParticipant('runnerUp', e.target.value)}
                      className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 font-medium"
                    >
                      <option value="">-- Pick from Registered ({eventRegistrations.length}) --</option>
                      {eventRegistrations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.participantName} ({r.collegeName}) {r.teamName ? `[${r.teamName}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Participant / Winner Name</label>
                    <input
                      type="text"
                      value={editingItem.runnerUp?.name || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          runnerUp: {
                            ...(editingItem.runnerUp || { college: '' }),
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">College / Institution</label>
                    <input
                      type="text"
                      value={editingItem.runnerUp?.college || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          runnerUp: {
                            ...(editingItem.runnerUp || { name: '' }),
                            college: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Vignan University"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Team Name (Optional)</label>
                    <input
                      type="text"
                      value={editingItem.runnerUp?.teamName || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          runnerUp: {
                            ...(editingItem.runnerUp || { name: '', college: '' }),
                            teamName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Western Sparks"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">2nd Prize Cash Award</label>
                    <input
                      type="text"
                      value={editingItem.prizes?.secondPrize || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          prizes: {
                            ...(editingItem.prizes || {}),
                            secondPrize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹5,000"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* 3rd Prize Winner */}
              <div className="p-4 rounded-2xl bg-gray-50 border border-gray-200 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <h4 className="font-bold text-gray-900 text-sm flex items-center gap-1.5">
                    <span>🥉 3rd Prize Winner • Second Runner-Up</span>
                  </h4>

                  {eventRegistrations.length > 0 && (
                    <select
                      onChange={(e) => handleSelectParticipant('secondRunnerUp', e.target.value)}
                      className="px-2.5 py-1 border border-gray-300 rounded-lg text-xs bg-white text-gray-700 font-medium"
                    >
                      <option value="">-- Pick from Registered ({eventRegistrations.length}) --</option>
                      {eventRegistrations.map((r) => (
                        <option key={r.id} value={r.id}>
                          {r.participantName} ({r.collegeName}) {r.teamName ? `[${r.teamName}]` : ''}
                        </option>
                      ))}
                    </select>
                  )}
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Participant / Winner Name</label>
                    <input
                      type="text"
                      value={editingItem.secondRunnerUp?.name || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          secondRunnerUp: {
                            ...(editingItem.secondRunnerUp || { college: '' }),
                            name: e.target.value,
                          },
                        })
                      }
                      placeholder="Full Name"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">College / Institution</label>
                    <input
                      type="text"
                      value={editingItem.secondRunnerUp?.college || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          secondRunnerUp: {
                            ...(editingItem.secondRunnerUp || { name: '' }),
                            college: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. KL University"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">Team Name (Optional)</label>
                    <input
                      type="text"
                      value={editingItem.secondRunnerUp?.teamName || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          secondRunnerUp: {
                            ...(editingItem.secondRunnerUp || { name: '', college: '' }),
                            teamName: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. Titans"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                  <div>
                    <label className="block font-semibold text-gray-700 mb-1">3rd Prize Cash Award</label>
                    <input
                      type="text"
                      value={editingItem.prizes?.thirdPrize || ''}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          prizes: {
                            ...(editingItem.prizes || {}),
                            thirdPrize: e.target.value,
                          },
                        })
                      }
                      placeholder="e.g. ₹2,500"
                      className="w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:border-indigo-600"
                    />
                  </div>
                </div>
              </div>

              {/* Official Jury Remarks */}
              <div>
                <label className="block font-semibold text-gray-700 mb-1">Official Jury Ratification Remarks</label>
                <textarea
                  rows={2}
                  value={editingItem.notes || ''}
                  onChange={(e) => setEditingItem({ ...editingItem, notes: e.target.value })}
                  placeholder="Official results confirmed by judge panel."
                  className="w-full px-3 py-2 border border-gray-300 rounded-xl focus:outline-none focus:border-indigo-600"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setPreviewItem(editingItem)}
                  className="px-4 py-2 border border-indigo-200 text-indigo-700 bg-indigo-50 hover:bg-indigo-100 rounded-xl font-bold transition flex items-center gap-1.5"
                >
                  <Eye className="w-4 h-4" />
                  <span>Live Preview Public Podium</span>
                </button>

                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEditingItem(null)}
                    className="px-4 py-2 border border-gray-300 rounded-xl font-semibold text-gray-700 hover:bg-gray-50 transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={saving}
                    className="px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow transition disabled:opacity-50 flex items-center gap-1.5"
                  >
                    <Save className="w-4 h-4" />
                    <span>{saving ? 'Saving...' : 'Save & Ratify Results'}</span>
                  </button>
                </div>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Live Preview Modal */}
      {previewItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-2xl bg-slate-950 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-slate-100">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-cyan-500/20 text-cyan-300 border border-cyan-500/40">
                  PUBLIC PREVIEW
                </span>
                <span className="text-xs text-slate-400">Live preview of /results card</span>
              </div>
              <button
                onClick={() => setPreviewItem(null)}
                className="text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div>
              <h3 className="text-xl font-extrabold text-white">{previewItem.eventTitle}</h3>
              <p className="text-xs text-slate-400">{previewItem.subcategory}</p>
            </div>

            {/* Podium Preview */}
            <div className="space-y-3">
              {previewItem.winner?.name && (
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border border-amber-500/60 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-amber-500/30 flex items-center justify-center text-lg">
                      🥇
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider">
                        1st Prize • Champion
                      </div>
                      <div className="font-bold text-white text-base">{previewItem.winner.name}</div>
                      <div className="text-xs text-slate-400">{previewItem.winner.college}</div>
                      {previewItem.winner.teamName && (
                        <div className="text-xs text-amber-300 font-semibold mt-1">
                          Team: {previewItem.winner.teamName}
                        </div>
                      )}
                    </div>
                  </div>
                  {previewItem.prizes?.firstPrize && (
                    <div className="px-3 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-bold text-xs self-center">
                      {previewItem.prizes.firstPrize}
                    </div>
                  )}
                </div>
              )}

              {previewItem.runnerUp?.name && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-700 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center text-sm">
                      🥈
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                        2nd Prize • Runner-Up
                      </div>
                      <div className="font-bold text-white text-sm">{previewItem.runnerUp.name}</div>
                      <div className="text-xs text-slate-400">{previewItem.runnerUp.college}</div>
                    </div>
                  </div>
                  {previewItem.prizes?.secondPrize && (
                    <div className="px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs self-center">
                      {previewItem.prizes.secondPrize}
                    </div>
                  )}
                </div>
              )}

              {previewItem.secondRunnerUp?.name && (
                <div className="p-3.5 rounded-xl bg-slate-900 border border-amber-900/40 flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-amber-950/40 flex items-center justify-center text-sm">
                      🥉
                    </div>
                    <div>
                      <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                        3rd Prize • Second Runner-Up
                      </div>
                      <div className="font-bold text-white text-sm">{previewItem.secondRunnerUp.name}</div>
                      <div className="text-xs text-slate-400">{previewItem.secondRunnerUp.college}</div>
                    </div>
                  </div>
                  {previewItem.prizes?.thirdPrize && (
                    <div className="px-2.5 py-1 rounded-lg bg-amber-950/60 border border-amber-900/60 text-amber-400 font-bold text-xs self-center">
                      {previewItem.prizes.thirdPrize}
                    </div>
                  )}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-3 border-t border-slate-800">
              <button
                type="button"
                onClick={() => setPreviewItem(null)}
                className="px-5 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
