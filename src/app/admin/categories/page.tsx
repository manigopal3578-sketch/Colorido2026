'use client';

import React, { useState, useEffect } from 'react';
import {
  Tags,
  Sparkles,
  Trophy,
  Cpu,
  CheckCircle,
  Clock,
  ArrowRight,
  Calendar,
  Users,
} from 'lucide-react';
import Link from 'next/link';

export default function CategoriesPage() {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedWorld, setSelectedWorld] = useState<'ALL' | 'cultural' | 'sports' | 'technical'>('ALL');
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

  if (loading || !data) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-2 border-[#5227FF] border-t-transparent animate-spin" />
      </div>
    );
  }

  const events = data.events || [];

  const categoriesStats = [
    {
      id: 'cultural',
      name: 'World 01: Cultural Arts',
      color: '#FF2E93',
      bgLight: '#FFEBF4',
      icon: Sparkles,
      status: 'ACTIVE',
      dates: '28–29 December 2026',
      totalEvents: events.filter((e: any) => e.category === 'cultural').length,
      registrations: events
        .filter((e: any) => e.category === 'cultural')
        .reduce((sum: number, e: any) => sum + (e.registeredCount || 0), 0),
      subcategories: Array.from(new Set(events.filter((e: any) => e.category === 'cultural').map((e: any) => e.subcategory))),
      description: 'Dance, music, theatre, literary arts, and fashion runway championships.',
    },
    {
      id: 'sports',
      name: 'World 02: Sports Arena',
      color: '#FF5E3A',
      bgLight: '#FFF0EB',
      icon: Trophy,
      status: 'ACTIVE',
      dates: '28–29 December 2026',
      totalEvents: events.filter((e: any) => e.category === 'sports').length,
      registrations: events
        .filter((e: any) => e.category === 'sports')
        .reduce((sum: number, e: any) => sum + (e.registeredCount || 0), 0),
      subcategories: Array.from(new Set(events.filter((e: any) => e.category === 'sports').map((e: any) => e.subcategory))),
      description: 'Athletics, turf cricket, volleyball, basketball, and badminton leagues.',
    },
    {
      id: 'technical',
      name: 'Technical Symposium (Postponed)',
      color: '#008C99',
      bgLight: '#E6FBFC',
      icon: Cpu,
      status: 'POSTPONED',
      dates: '9 October 2026 (Separately Scheduled)',
      totalEvents: events.filter((e: any) => e.category === 'technical').length,
      registrations: 0,
      subcategories: ['Coding Hackathon', 'Robotics Expo', 'Paper Presentation', 'Web Dev Challenge'],
      description: 'Technical paper symposium, coding competitions, and AI robotics demonstrations.',
    },
  ];

  const filteredCategories =
    selectedWorld === 'ALL'
      ? categoriesStats
      : categoriesStats.filter((c) => c.id === selectedWorld);

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
            <Tags className="w-4 h-4" />
            <span>Festival Architecture & Domains</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-[#090814] tracking-tight">
            Categories & Festival Worlds
          </h1>
          <p className="text-[#525266] text-xs sm:text-sm mt-0.5 font-medium">
            Active festival experience is focused on Cultural Arts and Sports Arena (Dec 28–29). Technical symposium is scheduled for Oct 9.
          </p>
        </div>

        {/* Filter buttons */}
        <div className="flex items-center gap-1.5 p-1 bg-white border border-gray-200 rounded-xl shadow-xs">
          {(['ALL', 'cultural', 'sports', 'technical'] as const).map((world) => (
            <button
              key={world}
              onClick={() => setSelectedWorld(world)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all ${
                selectedWorld === world
                  ? 'bg-[#5227FF] text-white shadow-xs'
                  : 'text-[#525266] hover:text-[#090814] hover:bg-gray-100'
              }`}
            >
              {world}
            </button>
          ))}
        </div>
      </div>

      {/* Categories Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {filteredCategories.map((cat) => {
          const Icon = cat.icon;
          const isPostponed = cat.status === 'POSTPONED';

          return (
            <div
              key={cat.id}
              className="bg-white border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between"
              style={{ borderTop: `4px solid ${cat.color}` }}
            >
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center font-bold"
                    style={{ backgroundColor: cat.bgLight, color: cat.color }}
                  >
                    <Icon className="w-6 h-6" />
                  </div>

                  <span
                    className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isPostponed
                        ? 'bg-amber-100 text-amber-800 border border-amber-200'
                        : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                    }`}
                  >
                    {cat.status}
                  </span>
                </div>

                <div>
                  <h3 className="text-lg font-black font-display text-[#090814] tracking-tight">
                    {cat.name}
                  </h3>
                  <p className="text-xs text-[#525266] flex items-center gap-1.5 mt-1 font-semibold">
                    <Clock className="w-3.5 h-3.5 text-gray-400" />
                    {cat.dates}
                  </p>
                  <p className="text-xs text-[#717188] mt-2 leading-relaxed">
                    {cat.description}
                  </p>
                </div>

                {/* Metrics */}
                <div className="grid grid-cols-2 gap-3 py-3 border-y border-gray-100">
                  <div>
                    <span className="text-[10px] text-[#717188] uppercase tracking-wider block font-bold">
                      Events Count
                    </span>
                    <span className="text-2xl font-black text-[#090814]">{cat.totalEvents}</span>
                  </div>
                  <div>
                    <span className="text-[10px] text-[#717188] uppercase tracking-wider block font-bold">
                      Registrations
                    </span>
                    <span className="text-2xl font-black" style={{ color: cat.color }}>
                      {cat.registrations}
                    </span>
                  </div>
                </div>

                {/* Subcategories */}
                <div>
                  <span className="text-[10px] uppercase tracking-wider font-black text-[#717188] block mb-2">
                    Subcategories & Tracks ({cat.subcategories.length})
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {cat.subcategories.map((sub: any, i: number) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-lg text-[11px] text-[#090814] font-semibold"
                      >
                        {sub}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              <div className="pt-6 mt-6 border-t border-gray-100 flex items-center justify-between">
                <Link
                  href={`/admin/events?category=${cat.id}`}
                  className="text-xs font-bold text-[#5227FF] hover:underline flex items-center gap-1.5 transition-colors"
                >
                  <span>Manage {cat.id} events</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
