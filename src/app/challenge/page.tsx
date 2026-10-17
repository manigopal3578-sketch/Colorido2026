'use client';

import React from 'react';
import Link from 'next/link';
import {
  Trophy,
  Calendar,
  MapPin,
  Sparkles,
  ArrowRight,
  Flame,
  Music,
  Users,
  Award,
  CheckCircle2,
} from 'lucide-react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';

export default function FestivalChallengesPage() {
  const culturalChallenges = [
    {
      title: 'Natya Tharanga — Classical & Semi-Classical Solo Dance',
      category: 'Dance (Solo)',
      venue: 'Silver Jubilee Main Auditorium',
      date: '28 December 2026',
      badge: 'CULTURAL',
      color: 'border-[#FF2E93] text-[#FF2E93]',
      slug: 'natya-tharanga-classical-dance',
    },
    {
      title: 'Battle of the Bands — Collegiate Rock & Fusion Showdown',
      category: 'Music & Band (Group)',
      venue: 'Open Air Theatre (OAT)',
      date: '28 December 2026',
      badge: 'CULTURAL',
      color: 'border-[#FF2E93] text-[#FF2E93]',
      slug: 'battle-of-the-bands',
    },
    {
      title: 'Choreoday — Theme-Based Group Choreography Showdown',
      category: 'Choreoday (Theme Based)',
      venue: 'Open Air Theatre (OAT)',
      date: '29 December 2026',
      badge: 'CULTURAL',
      color: 'border-[#FF2E93] text-[#FF2E93]',
      slug: 'choreoday-group-dance',
    },
    {
      title: 'Vogue Glamour — Haute Couture & Ethnic Fusion Runway',
      category: 'Fashion Show',
      venue: 'Silver Jubilee Main Auditorium',
      date: '29 December 2026',
      badge: 'CULTURAL',
      color: 'border-[#FF2E93] text-[#FF2E93]',
      slug: 'vogue-glamour-fashion-show',
    },
  ];

  const sportsChallenges = [
    {
      title: 'Colorido Super League — Turf & Box Cricket Championship',
      category: 'Cricket',
      venue: 'Main Athletic Stadium & Turf Grounds',
      date: '28–29 December 2026',
      badge: 'SPORTS',
      color: 'border-[#FF5E3A] text-[#FF5E3A]',
      slug: 'colorido-super-league-cricket',
    },
    {
      title: 'Slam Dunk Basketball Championship — 5v5 Hardcourt',
      category: 'Boys: Basketball',
      venue: 'Indoor Sports Arena',
      date: '28–29 December 2026',
      badge: 'SPORTS',
      color: 'border-[#FF5E3A] text-[#FF5E3A]',
      slug: 'slam-dunk-basketball',
    },
    {
      title: 'Spike Storm — Boys Volleyball Championship',
      category: 'Boys: Volleyball',
      venue: 'Indoor Sports Arena',
      date: '28–29 December 2026',
      badge: 'SPORTS',
      color: 'border-[#FF5E3A] text-[#FF5E3A]',
      slug: 'spike-storm-volleyball',
    },
    {
      title: 'Aura Strike — Girls Throwball Championship',
      category: 'Girls: Throwball',
      venue: 'Main Athletic Stadium',
      date: '28–29 December 2026',
      badge: 'SPORTS',
      color: 'border-[#FF5E3A] text-[#FF5E3A]',
      slug: 'aura-strike-throwball',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="relative py-20 px-4 sm:px-6 lg:px-8 bg-[#090814] text-white overflow-hidden">
          <div className="absolute inset-0 z-0 opacity-20 pointer-events-none">
            <img
              src="/images/colorido-hero-master.jpg"
              alt="Campus Festival Background"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-[#090814]/80 to-[#090814]" />
          </div>

          <div className="relative z-10 max-w-5xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-white/10 border border-white/20 text-xs font-black uppercase tracking-[0.25em] text-[#FFC857] mb-4">
              <Trophy className="w-3.5 h-3.5" />
              <span>CHAMPIONSHIPS & ARENAS</span>
            </div>

            <h1 className="font-display font-black text-4xl sm:text-6xl tracking-tight leading-tight mb-4">
              FESTIVAL{' '}
              <span className="bg-gradient-to-r from-[#FF2E93] via-[#FF5E3A] to-[#00DCEB] bg-clip-text text-transparent">
                CHALLENGES
              </span>
            </h1>

            <p className="text-base sm:text-lg text-gray-300 max-w-3xl mx-auto leading-relaxed mb-8">
              Two intense days of national-level collegiate competition. Step into the arena, prove your mettle, and seize the grand festival championship trophy.
            </p>

            <div className="flex flex-wrap items-center justify-center gap-4">
              <Link
                href="/register"
                className="px-6 py-3 rounded-full bg-gradient-to-r from-[#FF2E93] to-[#FF5E3A] hover:opacity-95 text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-lg transition-transform hover:scale-105"
              >
                REGISTER FOR CHALLENGES
              </Link>
              <Link
                href="/events"
                className="px-6 py-3 rounded-full bg-white/15 hover:bg-white/25 text-white text-xs sm:text-sm font-bold uppercase tracking-wider border border-white/30 backdrop-blur-md transition-all hover:scale-105"
              >
                EXPLORE ALL 21 EVENTS
              </Link>
            </div>
          </div>
        </section>

        {/* Cultural Arena Challenges */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-white border-b border-gray-100">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FF2E93] block mb-1">
                  WORLD 01 • CULTURAL ARENA
                </span>
                <h2 className="font-display font-black text-3xl text-[#090814] tracking-tight">
                  Premier Stage Showdowns
                </h2>
              </div>
              <Link
                href="/cultural"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF2E93] hover:underline"
              >
                <span>View All Cultural Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {culturalChallenges.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200/90 shadow-sm hover:border-[#FF2E93]/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFEBF4] text-[#FF2E93] mb-3">
                      {item.category}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#090814] mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="space-y-1 text-xs text-[#525266] mb-4">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{item.venue}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{item.date}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/events/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#5227FF] hover:underline pt-3 border-t border-gray-100"
                  >
                    <span>Rules & Registration</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Sports Arena Challenges */}
        <section className="py-16 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-10">
              <div>
                <span className="text-xs font-black uppercase tracking-widest text-[#FF5E3A] block mb-1">
                  WORLD 02 • SPORTS ARENA
                </span>
                <h2 className="font-display font-black text-3xl text-[#090814] tracking-tight">
                  High-Octane Athletic Battles
                </h2>
              </div>
              <Link
                href="/sports"
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#FF5E3A] hover:underline"
              >
                <span>View All Sports Events</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {sportsChallenges.map((item) => (
                <div
                  key={item.title}
                  className="p-6 rounded-2xl bg-white border border-gray-200/90 shadow-sm hover:border-[#FF5E3A]/60 transition-all flex flex-col justify-between"
                >
                  <div>
                    <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-[#FFF0EB] text-[#FF5E3A] mb-3">
                      {item.category}
                    </span>
                    <h3 className="font-display font-bold text-base text-[#090814] mb-2 leading-snug">
                      {item.title}
                    </h3>
                    <div className="space-y-1 text-xs text-[#525266] mb-4">
                      <p className="flex items-center gap-1.5">
                        <MapPin className="w-3 h-3 text-gray-400" />
                        <span className="truncate">{item.venue}</span>
                      </p>
                      <p className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{item.date}</span>
                      </p>
                    </div>
                  </div>

                  <Link
                    href={`/events/${item.slug}`}
                    className="inline-flex items-center gap-1.5 text-xs font-extrabold text-[#FF5E3A] hover:underline pt-3 border-t border-gray-100"
                  >
                    <span>Tournament Rules</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
