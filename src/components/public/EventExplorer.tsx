'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { Search, Filter, Calendar, MapPin, Users, ArrowRight, AlertCircle, Sparkles } from 'lucide-react';

interface EventExplorerProps {
  events: EventItem[];
  showPostponedTechnicalCard?: boolean;
}

export const EventExplorer: React.FC<EventExplorerProps> = ({
  events,
  showPostponedTechnicalCard = true,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<'ALL' | 'cultural' | 'sports'>('ALL');
  const [selectedSubcategory, setSelectedSubcategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  // Exclude archived and postponed events from primary list
  const activeEvents = events.filter((e) => e.status !== 'ARCHIVED' && e.status !== 'POSTPONED');

  const availableSubcategories = React.useMemo(() => {
    const list = new Set<string>();
    const relevant = selectedCategory === 'ALL' ? activeEvents : activeEvents.filter((e) => e.category === selectedCategory);
    relevant.forEach((e) => {
      if (e.subcategory) list.add(e.subcategory);
    });
    return Array.from(list);
  }, [activeEvents, selectedCategory]);

  const filteredEvents = activeEvents.filter((evt) => {
    const matchesCat = selectedCategory === 'ALL' || evt.category === selectedCategory;
    const matchesSubcat = selectedSubcategory === 'ALL' || evt.subcategory === selectedSubcategory;
    const matchesQuery =
      evt.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.subcategory.toLowerCase().includes(searchQuery.toLowerCase()) ||
      evt.venueName.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSubcat && matchesQuery;
  });

  return (
    <section id="events" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 sm:gap-6 mb-6 sm:mb-10">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Two Worlds Explorer</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight">
              EXPLORE COLORIDO
            </h2>
            <p className="text-sm sm:text-base text-[#525266] font-medium mt-1">
              Discover official championships across Cultural Arts and Sports Arenas.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-80">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search event, dance, cricket..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 bg-[#FBFBFD] text-xs sm:text-sm font-medium focus:bg-white transition-all placeholder:text-gray-400"
            />
          </div>
        </div>

        {/* Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-3">
          <button
            onClick={() => { setSelectedCategory('ALL'); setSelectedSubcategory('ALL'); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === 'ALL'
                ? 'bg-[#090814] text-white shadow-md'
                : 'bg-[#F5F5FA] text-[#525266] hover:bg-gray-200'
            }`}
          >
            ALL EVENTS ({activeEvents.length})
          </button>
          <button
            onClick={() => { setSelectedCategory('cultural'); setSelectedSubcategory('ALL'); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === 'cultural'
                ? 'bg-[#FF2E93] text-white shadow-md'
                : 'bg-[#FFEBF4] text-[#FF2E93] hover:opacity-80'
            }`}
          >
            CULTURAL ({activeEvents.filter((e) => e.category === 'cultural').length})
          </button>
          <button
            onClick={() => { setSelectedCategory('sports'); setSelectedSubcategory('ALL'); }}
            className={`px-5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all shrink-0 ${
              selectedCategory === 'sports'
                ? 'bg-[#FF5E3A] text-white shadow-md'
                : 'bg-[#FFF0EB] text-[#FF5E3A] hover:opacity-80'
            }`}
          >
            SPORTS ({activeEvents.filter((e) => e.category === 'sports').length})
          </button>
        </div>

        {/* Subcategory Filter Pills */}
        {availableSubcategories.length > 0 && (
          <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-6">
            <button
              onClick={() => setSelectedSubcategory('ALL')}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all shrink-0 ${
                selectedSubcategory === 'ALL'
                  ? 'bg-gray-900 text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              All Subcategories
            </button>
            {availableSubcategories.map((subcat) => (
              <button
                key={subcat}
                onClick={() => setSelectedSubcategory(subcat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all shrink-0 ${
                  selectedSubcategory === subcat
                    ? selectedCategory === 'cultural'
                      ? 'bg-pink-600 text-white shadow-sm'
                      : selectedCategory === 'sports'
                      ? 'bg-orange-600 text-white shadow-sm'
                      : 'bg-indigo-600 text-white shadow-sm'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {subcat}
              </button>
            ))}
          </div>
        )}

        {/* Events Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {filteredEvents.map((evt) => {
            const isCultural = evt.category === 'cultural';
            return (
              <div
                key={evt.id}
                className="group rounded-2xl bg-[#FBFBFD] border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-gray-300 transition-all duration-300"
              >
                <div>
                  <div className="relative h-36 sm:h-48 w-full overflow-hidden bg-gray-100">
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/colorido-hero-master.jpg';
                      }}
                    />
                    <div className="absolute top-3 left-3 z-10">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white shadow-sm ${
                          isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                        }`}
                      >
                        {evt.category} • {evt.subcategory}
                      </span>
                    </div>

                    <div className="absolute bottom-2 right-3 z-10 px-2 py-0.5 rounded bg-black/60 backdrop-blur-sm text-[11px] font-bold text-white">
                      {evt.date}
                    </div>
                  </div>

                  <div className="p-3.5 sm:p-5">
                    <h3 className="font-display font-bold text-base sm:text-lg text-[#090814] mb-1.5 sm:mb-2 leading-snug line-clamp-1 group-hover:text-[#5227FF] transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-[#525266] line-clamp-2 mb-3 sm:mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-xs text-[#525266]">
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span className="truncate">{evt.venueName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
                        <span>
                          {evt.teamRequirement === 'TEAM'
                            ? `Squad (${evt.minTeamSize}-${evt.maxTeamSize} members)`
                            : 'Solo Entry'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between pt-1.5 border-t border-gray-100 text-[11px]">
                        <span className="font-semibold text-gray-600">
                          Slots: <strong className="text-gray-900">{evt.registeredCount || 0} / {evt.capacity}</strong> {evt.teamRequirement === 'TEAM' ? 'Teams' : 'Entries'}
                        </span>
                        <span className={`px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                          (evt.registeredCount || 0) >= evt.capacity
                            ? 'bg-red-100 text-red-700'
                            : (evt.registeredCount || 0) >= evt.capacity * 0.8
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-emerald-100 text-emerald-700'
                        }`}>
                          {(evt.registeredCount || 0) >= evt.capacity ? 'FULL' : (evt.registeredCount || 0) >= evt.capacity * 0.8 ? 'LIMITED' : 'OPEN'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="p-3.5 sm:p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-3 mt-2 sm:mt-3">
                  <Link
                    href={`/events/${evt.slug}`}
                    className="text-xs font-bold text-[#090814] hover:text-[#5227FF] flex items-center gap-1"
                  >
                    <span>Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/register?eventId=${evt.id}`}
                    className={`py-2 px-4 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all ${
                      (evt.registeredCount || 0) >= evt.capacity
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : isCultural
                        ? 'bg-[#FF2E93]'
                        : 'bg-[#FF5E3A]'
                    }`}
                  >
                    {(evt.registeredCount || 0) >= evt.capacity ? 'Waitlist' : 'Register'}
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredEvents.length === 0 && (
          <div className="text-center py-16 bg-[#FBFBFD] rounded-2xl border border-gray-200">
            <p className="text-base font-bold text-[#090814] mb-1">NO EVENTS MATCH YOUR SEARCH</p>
            <p className="text-xs text-[#525266]">
              Try adjusting your category filter or search query.
            </p>
          </div>
        )}

        {/* Section 10: Official Controlled Notice for Postponed Technical Events */}
        {showPostponedTechnicalCard && (
          <div className="mt-12 p-6 rounded-2xl bg-[#F5F5FA] border border-gray-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
            <div className="flex items-start gap-3.5">
              <div className="p-2.5 rounded-xl bg-amber-100 text-amber-800 shrink-0">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-amber-800 block mb-0.5">
                  Official Technical Event Schedule Update
                </span>
                <h4 className="font-display font-bold text-base text-[#090814]">
                  TECHNICAL EVENTS POSTPONED TO 9 OCTOBER 2026
                </h4>
                <p className="text-xs text-[#525266] mt-0.5 max-w-2xl">
                  To ensure maximum participation across technical hackathons and symposia, all technical competitions will take place on 9 October 2026. The primary 28–29 December COLORIDO experience remains focused strictly on Cultural Arts and Sports Championships.
                </p>
              </div>
            </div>

            <span className="px-3 py-1.5 rounded-lg bg-white border border-gray-200 text-xs font-extrabold text-[#090814] shrink-0">
              STATUS: POSTPONED
            </span>
          </div>
        )}
      </div>
    </section>
  );
};
