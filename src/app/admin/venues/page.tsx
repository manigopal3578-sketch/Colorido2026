'use client';

import React, { useState, useEffect, useMemo } from 'react';
import {
  MapPin,
  Plus,
  Users,
  Navigation,
  CheckCircle,
  Edit2,
  Trash2,
  BarChart3,
  Calendar,
  Activity,
  Percent,
  CheckCircle2,
} from 'lucide-react';

export default function VenuesAdminPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingVenue, setEditingVenue] = useState<any>(null);
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

  const handleSaveVenue = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const isNew = !editingVenue.id;
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: isNew ? 'ADD' : 'UPDATE',
          collection: 'venues',
          id: editingVenue.id,
          item: editingVenue,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast(isNew ? 'Venue created successfully' : 'Venue updated successfully');
        setModalOpen(false);
        setEditingVenue(null);
        fetchData();
      } else {
        showToast(resJson.message || 'Error saving venue', 'error');
      }
    } catch (err: any) {
      showToast(err.message, 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteVenue = async (venueId: string) => {
    if (!confirm('Are you sure you want to delete this campus venue?')) return;
    try {
      const res = await fetch('/api/admin/mutate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'DELETE',
          collection: 'venues',
          id: venueId,
        }),
      });
      const resJson = await res.json();
      if (resJson.success) {
        showToast('Venue removed');
        fetchData();
      }
    } catch (e: any) {
      showToast(e.message, 'error');
    }
  };

  const venues = data?.venues || [];
  const events = data?.events || [];
  const registrations = data?.registrations || [];
  const checkIns = data?.checkIns || [];

  // Compute database-driven analytics for each venue
  const venueAnalytics = useMemo(() => {
    return venues.map((v: any) => {
      const hostedEvents = events.filter(
        (e: any) => e.venueId === v.id || e.venueName === v.name
      );
      const hostedEventIds = new Set(hostedEvents.map((e: any) => e.id));

      const venueRegs = registrations.filter(
        (r: any) => hostedEventIds.has(r.eventId) && r.status === 'CONFIRMED'
      );
      const venueChecks = checkIns.filter((c: any) => hostedEventIds.has(c.eventId));

      const regCount = venueRegs.length;
      const checkCount = venueChecks.length;

      const attendanceRateNum = regCount > 0 ? (checkCount / regCount) * 100 : 0;
      const capacityUtilNum = v.capacity > 0 ? (regCount / v.capacity) * 100 : 0;

      return {
        ...v,
        eventsHosted: hostedEvents.length,
        totalRegistrations: regCount,
        checkIns: checkCount,
        attendanceRate: attendanceRateNum.toFixed(1),
        capacityUtilization: capacityUtilNum.toFixed(1),
        attendanceRateNum,
        capacityUtilNum,
      };
    });
  }, [venues, events, registrations, checkIns]);

  const totalCampusCapacity = useMemo(() => {
    return venues.reduce((acc: number, v: any) => acc + (v.capacity || 0), 0);
  }, [venues]);

  const totalArenaRegistrations = useMemo(() => {
    return venueAnalytics.reduce((acc: number, v: any) => acc + v.totalRegistrations, 0);
  }, [venueAnalytics]);

  const totalArenaCheckIns = useMemo(() => {
    return venueAnalytics.reduce((acc: number, v: any) => acc + v.checkIns, 0);
  }, [venueAnalytics]);

  const overallAttendanceRate = useMemo(() => {
    return totalArenaRegistrations > 0
      ? ((totalArenaCheckIns / totalArenaRegistrations) * 100).toFixed(1)
      : '0.0';
  }, [totalArenaRegistrations, totalArenaCheckIns]);

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {toast && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl text-white text-xs font-bold shadow-2xl flex items-center gap-2 ${
            toast.type === 'success' ? 'bg-emerald-600' : 'bg-red-600'
          }`}
        >
          <CheckCircle className="w-4 h-4" />
          {toast.message}
        </div>
      )}

      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-[#5227FF] text-xs font-bold uppercase tracking-wider mb-1">
            <MapPin className="w-4 h-4" />
            <span>Campus Infrastructure & Arena Analytics</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Venues & Arenas Management
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Database-driven operational analytics, capacity utilization, verified check-ins, and campus navigation coordinates.
          </p>
        </div>

        <button
          onClick={() => {
            setEditingVenue({
              name: '',
              code: 'VEN-01',
              description: '',
              capacity: 500,
              type: 'AUDITORIUM',
              directions: '',
              mapCoords: { x: 50, y: 50 },
              image:
                'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
              isAvailable: true,
            });
            setModalOpen(true);
          }}
          className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold flex items-center gap-2 transition-all shadow-sm self-start md:self-center"
        >
          <Plus className="w-4 h-4" />
          <span>Add Campus Venue</span>
        </button>
      </div>

      {/* Database-Driven Real KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Users className="w-3.5 h-3.5 text-[#5227FF]" />
            <span>Total Campus Capacity</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {totalCampusCapacity.toLocaleString()}
          </div>
          <div className="text-[10px] text-gray-500">Across {venues.length} active venues</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-pink-600" />
            <span>Events Scheduled</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-gray-900">
            {events.length}
          </div>
          <div className="text-[10px] text-gray-500">Cultural & Sports arenas</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Activity className="w-3.5 h-3.5 text-cyan-600" />
            <span>Arena Registrations</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-cyan-700">
            {totalArenaRegistrations}
          </div>
          <div className="text-[10px] text-gray-500">Real confirmed bookings</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>Physical Check-Ins</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-emerald-600">
            {totalArenaCheckIns}
          </div>
          <div className="text-[10px] text-gray-500">Verified through entry scanner</div>
        </div>

        <div className="p-4 rounded-2xl bg-white border border-gray-200 shadow-xs space-y-1 col-span-2 md:col-span-1">
          <div className="text-[10px] font-bold text-gray-500 uppercase tracking-wider flex items-center gap-1.5">
            <Percent className="w-3.5 h-3.5 text-amber-600" />
            <span>Attendance Rate</span>
          </div>
          <div className="text-xl sm:text-2xl font-black text-amber-600">
            {overallAttendanceRate}%
          </div>
          <div className="text-[10px] text-gray-500">
            {totalArenaRegistrations === 0 ? 'Awaiting registrations' : 'Live attendance ratio'}
          </div>
        </div>
      </div>

      {/* Real Venue Operations & Analytics Table */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm space-y-4">
        <div className="flex items-center justify-between border-b border-gray-100 pb-3">
          <div className="flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-[#5227FF]" />
            <h2 className="font-bold text-base text-gray-900">
              Venue Capacity Utilization & Attendance Metrics
            </h2>
          </div>
          <span className="text-[11px] text-gray-500 font-medium">
            Database-synchronized (zero values reported honestly)
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 text-gray-600 font-semibold border-b border-gray-200">
              <tr>
                <th className="py-3 px-3">Venue / Code</th>
                <th className="py-3 px-3">Type</th>
                <th className="py-3 px-3 text-right">Capacity</th>
                <th className="py-3 px-3 text-right">Events Hosted</th>
                <th className="py-3 px-3 text-right">Registered</th>
                <th className="py-3 px-3 text-right">Checked In</th>
                <th className="py-3 px-3">Attendance Rate</th>
                <th className="py-3 px-3">Capacity Utilization</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {venueAnalytics.map((v: any) => (
                <tr key={v.id} className="hover:bg-gray-50 transition">
                  <td className="py-3 px-3 font-semibold text-gray-900">
                    <div>{v.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">{v.code}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-gray-100 text-gray-700">
                      {v.type}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-right font-mono text-gray-800">
                    {v.capacity.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-gray-900">
                    {v.eventsHosted}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-cyan-700">
                    {v.totalRegistrations}
                  </td>
                  <td className="py-3 px-3 text-right font-bold text-emerald-600">
                    {v.checkIns}
                  </td>
                  {/* Attendance Rate with Bar */}
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-emerald-500 h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, v.attendanceRateNum)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 w-10 text-right font-mono">
                        {v.attendanceRate}%
                      </span>
                    </div>
                  </td>
                  {/* Capacity Utilization with Bar */}
                  <td className="py-3 px-3 min-w-[140px]">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-gray-100 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-[#5227FF] h-full rounded-full transition-all duration-500"
                          style={{ width: `${Math.min(100, v.capacityUtilNum)}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-bold text-gray-700 w-10 text-right font-mono">
                        {v.capacityUtilization}%
                      </span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Venues Grid with Photos */}
      <div className="space-y-4">
        <h2 className="text-base font-bold text-gray-900">Configured Campus Stages & Venues</h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {venues.map((v: any) => (
            <div
              key={v.id}
              className="bg-white border border-gray-200 rounded-2xl overflow-hidden hover:shadow-md transition-all flex flex-col justify-between"
            >
              <div>
                {/* Image banner */}
                <div className="h-40 relative overflow-hidden bg-gray-100">
                  <img
                    src={v.image}
                    alt={v.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src =
                        'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider bg-black/70 text-white backdrop-blur-xs">
                    {v.type}
                  </span>
                  <span
                    className={`absolute top-3 right-3 px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase tracking-wider ${
                      v.isAvailable ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'
                    }`}
                  >
                    {v.isAvailable ? 'Available' : 'Occupied'}
                  </span>
                </div>

                {/* Content */}
                <div className="p-5 space-y-2.5">
                  <div>
                    <span className="text-[10px] font-bold text-[#5227FF] tracking-wider uppercase block font-mono">
                      CODE: {v.code}
                    </span>
                    <h3 className="text-base font-black text-[#090814] font-display mt-0.5">
                      {v.name}
                    </h3>
                  </div>

                  <p className="text-xs text-[#525266] line-clamp-2 leading-relaxed">{v.description}</p>

                  <div className="flex items-center gap-4 text-xs text-[#090814] font-bold pt-2 border-t border-gray-100">
                    <span className="flex items-center gap-1.5">
                      <Users className="w-3.5 h-3.5 text-[#5227FF]" />
                      Capacity: {v.capacity.toLocaleString()}
                    </span>
                  </div>

                  {v.directions && (
                    <p className="text-[11px] text-[#717188] flex items-center gap-1">
                      <Navigation className="w-3 h-3 text-gray-400 shrink-0" />
                      <span className="truncate">{v.directions}</span>
                    </p>
                  )}
                </div>
              </div>

              {/* Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
                <button
                  onClick={() => {
                    setEditingVenue(v);
                    setModalOpen(true);
                  }}
                  className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <Edit2 className="w-3.5 h-3.5" />
                  <span>Edit Details</span>
                </button>

                <button
                  onClick={() => handleDeleteVenue(v.id)}
                  className="text-xs font-bold text-red-600 hover:text-red-700 flex items-center gap-1.5 transition-colors"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalOpen && editingVenue && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white border border-gray-200 rounded-3xl w-full max-w-lg p-6 space-y-4 max-h-[90vh] overflow-y-auto shadow-2xl">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <h3 className="text-lg font-black text-[#090814] font-display">
                {editingVenue.id ? 'Edit Campus Venue' : 'Create Campus Venue'}
              </h3>
              <button onClick={() => setModalOpen(false)} className="text-gray-400 hover:text-black">
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveVenue} className="space-y-4">
              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Venue Name</label>
                <input
                  type="text"
                  required
                  value={editingVenue.name}
                  onChange={(e) => setEditingVenue({ ...editingVenue, name: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  placeholder="e.g. Silver Jubilee Main Auditorium"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Code / Short Tag</label>
                  <input
                    type="text"
                    required
                    value={editingVenue.code}
                    onChange={(e) => setEditingVenue({ ...editingVenue, code: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                    placeholder="e.g. SJ-AUD"
                  />
                </div>
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Capacity</label>
                  <input
                    type="number"
                    required
                    value={editingVenue.capacity}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, capacity: Number(e.target.value) })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Venue Type</label>
                  <select
                    value={editingVenue.type}
                    onChange={(e) => setEditingVenue({ ...editingVenue, type: e.target.value })}
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="AUDITORIUM">AUDITORIUM</option>
                    <option value="STADIUM">STADIUM</option>
                    <option value="OUTDOOR">OUTDOOR</option>
                    <option value="INDOOR">INDOOR</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-bold text-[#525266] block mb-1">Availability</label>
                  <select
                    value={editingVenue.isAvailable ? 'true' : 'false'}
                    onChange={(e) =>
                      setEditingVenue({ ...editingVenue, isAvailable: e.target.value === 'true' })
                    }
                    className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  >
                    <option value="true">Available</option>
                    <option value="false">Occupied / Reserved</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Directions / Landmark</label>
                <input
                  type="text"
                  value={editingVenue.directions}
                  onChange={(e) => setEditingVenue({ ...editingVenue, directions: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                  placeholder="e.g. Opposite Administrative Block, Ground Floor"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Photo URL</label>
                <input
                  type="url"
                  value={editingVenue.image}
                  onChange={(e) => setEditingVenue({ ...editingVenue, image: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#525266] block mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingVenue.description}
                  onChange={(e) => setEditingVenue({ ...editingVenue, description: e.target.value })}
                  className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs text-[#090814] focus:outline-none focus:border-[#5227FF]"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-bold text-[#525266] hover:text-[#090814]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-sm"
                >
                  {saving ? 'Saving...' : 'Save Venue'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
