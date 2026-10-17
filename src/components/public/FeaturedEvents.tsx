'use client';

import React from 'react';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { ElectricBorder } from './ElectricBorder';
import { Calendar, MapPin, Users, ArrowRight, Sparkles } from 'lucide-react';

interface FeaturedEventsProps {
  events: EventItem[];
}

export const FeaturedEvents: React.FC<FeaturedEventsProps> = ({ events }) => {
  const featured = events.filter((e) => e.featured && e.status !== 'ARCHIVED' && e.status !== 'POSTPONED');
  if (featured.length === 0) return null;

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center max-w-3xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#5227FF] mb-2 shadow-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>High-Energy Showcases</span>
          </div>
          <h2 className="font-display font-black text-2xl sm:text-4xl text-[#090814] tracking-tight mb-2">
            FLAGSHIP CHAMPIONSHIPS
          </h2>
          <p className="text-xs sm:text-sm text-[#525266] font-medium">
            The most anticipated collegiate competitions of COLORIDO 2K26.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
          {featured.map((evt, idx) => {
            const isCultural = evt.category === 'cultural';
            const accentColor = isCultural ? '#FF2E93' : '#FF5E3A';

            return (
              <ElectricBorder
                key={evt.id}
                color={accentColor}
                intensity="subtle"
                className="h-full rounded-2xl"
              >
                <div className="h-full bg-white rounded-2xl border border-gray-200/90 shadow-xs overflow-hidden flex flex-col justify-between hover:shadow-md transition-all">
                  {/* Event Cover Image */}
                  <div className="relative h-36 sm:h-44 w-full overflow-hidden bg-gray-100">
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = '/images/colorido-hero-master.jpg';
                      }}
                    />
                    <div className="absolute top-2.5 left-2.5 z-10">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider text-white shadow-md ${
                          isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                        }`}
                      >
                        {evt.category.toUpperCase()} • {evt.subcategory}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-3.5 sm:p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-display font-bold text-base sm:text-lg text-[#090814] mb-1.5 leading-snug line-clamp-1">
                        {evt.title}
                      </h3>
                      <p className="text-xs text-[#525266] line-clamp-2 mb-3 leading-relaxed">
                        {evt.description}
                      </p>

                      <div className="space-y-1 text-xs text-[#525266] mb-4">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-3.5 h-3.5 text-[#5227FF] shrink-0" />
                          <span className="truncate">{evt.date} • {evt.startTime}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-3.5 h-3.5 text-[#FF2E93] shrink-0" />
                          <span className="truncate">{evt.venueName}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0" />
                          <span>
                            {evt.teamRequirement === 'TEAM'
                              ? `Squad (${evt.minTeamSize}-${evt.maxTeamSize})`
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

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between gap-2">
                      <Link
                        href={`/events/${evt.slug}`}
                        className="text-xs font-bold text-[#090814] hover:text-[#5227FF] inline-flex items-center gap-1"
                      >
                        <span>Details</span>
                        <ArrowRight className="w-3 h-3" />
                      </Link>

                      <Link
                        href={`/register?eventId=${evt.id}`}
                        className={`py-1.5 px-3 rounded-xl text-white text-xs font-bold shadow-xs hover:opacity-90 transition-all ${
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
                </div>
              </ElectricBorder>
            );
          })}
        </div>
      </div>
    </section>
  );
};
