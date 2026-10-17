'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { EventItem } from '@/lib/types';
import { Calendar, Clock, MapPin, ArrowRight, Sparkles } from 'lucide-react';

interface ScheduleSectionProps {
  events: EventItem[];
}

export const ScheduleSection: React.FC<ScheduleSectionProps> = ({ events }) => {
  const [selectedDay, setSelectedDay] = useState<'2026-12-28' | '2026-12-29'>('2026-12-28');

  // Filter only active festival days
  const dayEvents = events
    .filter((e) => e.date === selectedDay && e.status !== 'ARCHIVED' && e.status !== 'POSTPONED')
    .sort((a, b) => a.startTime.localeCompare(b.startTime));

  return (
    <section id="schedule" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Master Timeline</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            FESTIVAL SCHEDULE
          </h2>
          <p className="text-xs sm:text-sm text-[#525266] font-medium">
            Strict 2-day timeline of all Cultural and Sports championships.
          </p>

          {/* Day 01 vs Day 02 Switcher */}
          <div className="inline-flex p-1 sm:p-1.5 mt-6 sm:mt-8 bg-white border border-gray-200 rounded-2xl shadow-sm">
            <button
              onClick={() => setSelectedDay('2026-12-28')}
              className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                selectedDay === '2026-12-28'
                  ? 'bg-[#090814] text-white shadow-md'
                  : 'text-[#525266] hover:text-[#090814]'
              }`}
            >
              DAY 01 • DEC 28
            </button>
            <button
              onClick={() => setSelectedDay('2026-12-29')}
              className={`px-3 sm:px-6 py-2 sm:py-2.5 rounded-xl text-xs sm:text-sm font-extrabold transition-all ${
                selectedDay === '2026-12-29'
                  ? 'bg-[#090814] text-white shadow-md'
                  : 'text-[#525266] hover:text-[#090814]'
              }`}
            >
              DAY 02 • DEC 29
            </button>
          </div>
        </div>

        {/* Schedule List */}
        <div className="space-y-4">
          {dayEvents.map((evt) => {
            const isCultural = evt.category === 'cultural';
            return (
              <div
                key={evt.id}
                className="p-5 sm:p-6 rounded-2xl bg-white border border-gray-200 shadow-sm hover:border-gray-300 transition-all flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
              >
                <div className="flex items-start sm:items-center gap-4">
                  <div className="p-3 rounded-xl bg-[#F5F5FA] border border-gray-100 flex flex-col items-center justify-center shrink-0 w-20">
                    <Clock className="w-4 h-4 text-[#5227FF] mb-1" />
                    <span className="text-xs font-black text-[#090814]">{evt.startTime}</span>
                  </div>

                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                          isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                        }`}
                      >
                        {evt.category}
                      </span>
                      <span className="text-xs font-bold text-[#717188]">{evt.subcategory}</span>
                    </div>

                    <h4 className="font-display font-bold text-base sm:text-lg text-[#090814]">
                      {evt.title}
                    </h4>

                    <div className="flex items-center gap-1.5 text-xs text-[#525266] mt-1 font-medium">
                      <MapPin className="w-3.5 h-3.5 text-gray-400" />
                      <span>{evt.venueName}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-3 w-full sm:w-auto justify-end pt-3 sm:pt-0 border-t sm:border-t-0 border-gray-100">
                  <Link
                    href={`/events/${evt.slug}`}
                    className="text-xs font-bold text-[#525266] hover:text-[#090814] px-3 py-1.5 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    View Details
                  </Link>

                  <Link
                    href={`/register?eventId=${evt.id}`}
                    className={`py-2 px-4 rounded-xl text-white text-xs font-bold shadow-sm hover:opacity-90 transition-all ${
                      isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                    }`}
                  >
                    Register
                  </Link>
                </div>
              </div>
            );
          })}

          {dayEvents.length === 0 && (
            <div className="text-center py-12 bg-white rounded-2xl border border-gray-200">
              <p className="text-sm font-bold text-[#090814]">SCHEDULE TO BE ANNOUNCED</p>
              <p className="text-xs text-[#717188] mt-1">Events for this day are currently being finalized.</p>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
