'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { EventItem } from '@/lib/types';
import { Music, Sparkles, Calendar, MapPin, Users, ArrowRight, Heart } from 'lucide-react';

export default function CulturalPage() {
  const [events, setEvents] = useState<EventItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setEvents(json.events.filter((e: EventItem) => e.category === 'cultural' && e.status !== 'ARCHIVED'));
        }
      })
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Cultural Hero Header */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#FFEBF4]/60 via-white to-white border-b border-border overflow-hidden">
          <div className="absolute top-0 right-1/4 w-96 h-96 rounded-full bg-[#FF2E93]/15 blur-[100px] pointer-events-none" />

          <div className="max-w-5xl mx-auto text-center relative z-10">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-[#FFEBF4] border border-[#FF2E93]/30 text-xs font-black uppercase tracking-widest text-[#FF2E93] mb-4">
              <Music className="w-3.5 h-3.5" />
              <span>World 01 • Cultural Arts</span>
            </div>

            <h1 className="font-display font-black text-5xl sm:text-7xl text-[#090814] tracking-tight mb-4">
              EXPRESSION, RHYTHM & SOUL
            </h1>

            <p className="text-base sm:text-xl text-[#525266] max-w-2xl mx-auto font-medium leading-relaxed mb-8">
              A celebration of classical Indian heritage, contemporary street dance battles, acoustic vocal competitions, and theatrical spectacles.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-3 text-xs sm:text-sm font-bold text-[#090814]">
              <span className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                28–29 December 2026
              </span>
              <span className="px-4 py-2 rounded-xl bg-white border border-gray-200 shadow-sm">
                Silver Jubilee Auditorium & OAT
              </span>
              <Link
                href="/register?category=cultural"
                className="px-6 py-2 rounded-xl bg-[#FF2E93] text-white shadow-md hover:bg-[#E01C7B] transition-colors"
              >
                Register Cultural
              </Link>
            </div>
          </div>
        </section>

        {/* Cultural Events Showcase */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="mb-8">
            <h2 className="font-display font-black text-2xl sm:text-3xl text-[#090814]">
              CULTURAL CHAMPIONSHIPS ({events.length})
            </h2>
            <p className="text-xs sm:text-sm text-[#525266] font-medium">
              Review official rules and book your performance slot.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((evt) => (
              <div
                key={evt.id}
                className="group rounded-2xl bg-[#FBFBFD] border border-gray-200 overflow-hidden flex flex-col justify-between hover:shadow-xl hover:border-[#FF2E93]/40 transition-all duration-300"
              >
                <div>
                  <div className="relative h-52 w-full overflow-hidden">
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 px-2.5 py-1 rounded-md text-[10px] font-black uppercase tracking-wider text-white bg-[#FF2E93] shadow-sm">
                      {evt.subcategory}
                    </div>
                  </div>

                  <div className="p-5">
                    <h3 className="font-display font-bold text-lg text-[#090814] mb-2 leading-snug group-hover:text-[#FF2E93] transition-colors">
                      {evt.title}
                    </h3>
                    <p className="text-xs text-[#525266] line-clamp-2 mb-4 leading-relaxed">
                      {evt.description}
                    </p>

                    <div className="space-y-1 text-xs text-[#525266]">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-3.5 h-3.5 text-[#5227FF]" />
                        <span>{evt.date} • {evt.startTime}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <MapPin className="w-3.5 h-3.5 text-gray-400" />
                        <span>{evt.venueName}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Users className="w-3.5 h-3.5 text-gray-400" />
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
                </div>

                <div className="p-5 pt-0 border-t border-gray-100 flex items-center justify-between gap-3 mt-3">
                  <Link
                    href={`/events/${evt.slug}`}
                    className="text-xs font-bold text-[#090814] hover:text-[#FF2E93] flex items-center gap-1"
                  >
                    <span>Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>

                  <Link
                    href={`/register?eventId=${evt.id}`}
                    className={`py-2 px-4 rounded-xl text-white text-xs font-bold shadow-sm transition-all ${
                      (evt.registeredCount || 0) >= evt.capacity
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : 'bg-[#FF2E93] hover:bg-[#E01C7B]'
                    }`}
                  >
                    {(evt.registeredCount || 0) >= evt.capacity ? 'Waitlist' : 'Register'}
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
