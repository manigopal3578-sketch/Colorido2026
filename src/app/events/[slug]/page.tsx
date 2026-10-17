'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { EventItem } from '@/lib/types';
import {
  Calendar,
  Clock,
  MapPin,
  Users,
  Award,
  Shield,
  Phone,
  Mail,
  ArrowLeft,
  CheckCircle2,
  AlertCircle,
  Share2,
} from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params?.slug as string;

  const [event, setEvent] = useState<EventItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          const match = json.events.find(
            (e: EventItem) => e.slug === slug || e.id === slug
          );
          setEvent(match || null);
        }
      })
      .finally(() => setLoading(false));
  }, [slug]);

  const handleShare = () => {
    if (typeof window !== 'undefined') {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <p className="text-xs font-bold uppercase tracking-widest text-[#525266] animate-pulse">
          Loading event details...
        </p>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen flex flex-col bg-white">
        <Navbar />
        <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
          <AlertCircle className="w-12 h-12 text-red-500 mb-3" />
          <h1 className="font-display font-black text-2xl text-[#090814] mb-2">
            EVENT NOT FOUND
          </h1>
          <p className="text-xs text-[#525266] mb-6">
            The event you are looking for may have been archived or rescheduled.
          </p>
          <Link
            href="/events"
            className="px-6 py-2.5 rounded-xl bg-[#090814] text-white text-xs font-bold"
          >
            Back to Event Explorer
          </Link>
        </div>
        <Footer />
      </div>
    );
  }

  const isCultural = event.category === 'cultural';
  const isPostponed = event.status === 'POSTPONED';
  const isFull = (event.registeredCount || 0) >= event.capacity;
  const utilization = Math.min(100, Math.round(((event.registeredCount || 0) / (event.capacity || 1)) * 100));

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-6xl mx-auto">
        {/* Back Link */}
        <div className="mb-6 flex items-center justify-between">
          <Link
            href="/events"
            className="inline-flex items-center gap-2 text-xs font-bold text-[#525266] hover:text-[#090814] transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to Explorer</span>
          </Link>

          <button
            onClick={handleShare}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-gray-200 text-xs font-semibold text-[#525266] hover:bg-gray-50"
          >
            <Share2 className="w-3.5 h-3.5" />
            <span>{copied ? 'Link Copied!' : 'Share Event'}</span>
          </button>
        </div>

        {/* Hero Banner Image */}
        <div className="relative h-72 sm:h-96 w-full rounded-3xl overflow-hidden shadow-xl mb-10 border border-gray-200">
          <img
            src={event.coverImage}
            alt={event.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

          <div className="absolute top-6 left-6 z-10">
            <span
              className={`px-3 py-1.5 rounded-full text-xs font-black uppercase tracking-wider text-white shadow-md ${
                isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
              }`}
            >
              {event.category.toUpperCase()} • {event.subcategory}
            </span>
          </div>

          <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
            <span className="text-[11px] font-bold text-gray-300 uppercase tracking-widest block mb-1">
              Event Code: {event.id}
            </span>
            <h1 className="font-display font-black text-3xl sm:text-5xl leading-tight mb-2">
              {event.title}
            </h1>
          </div>
        </div>

        {/* Content Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
          {/* Main Details */}
          <div className="lg:col-span-8 space-y-8">
            {/* Overview */}
            <div>
              <h2 className="font-display font-bold text-xl text-[#090814] mb-3">
                Overview & Description
              </h2>
              <p className="text-sm sm:text-base text-[#525266] leading-relaxed">
                {event.description}
              </p>
            </div>

            {/* Official Rules */}
            <div className="p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200">
              <h2 className="font-display font-bold text-lg text-[#090814] mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-[#5227FF]" />
                <span>Tournament & Performance Rules</span>
              </h2>
              <ul className="space-y-3">
                {event.rules.map((rule, idx) => (
                  <li key={idx} className="flex items-start gap-3 text-xs sm:text-sm text-[#525266]">
                    <CheckCircle2 className="w-4 h-4 text-green-600 shrink-0 mt-0.5" />
                    <span>{rule}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Eligibility */}
            <div>
              <h3 className="font-display font-bold text-base text-[#090814] mb-2">
                Eligibility Criteria
              </h3>
              <p className="text-xs sm:text-sm text-[#525266] bg-white p-4 rounded-xl border border-gray-200">
                {event.eligibility}
              </p>
            </div>

            {/* Faculty & Student Coordinators */}
            <div className="p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200">
              <h3 className="font-display font-bold text-base text-[#090814] mb-3">
                Event Coordination Desk
              </h3>
              <div className="space-y-2 text-xs sm:text-sm text-[#525266]">
                <p className="font-bold text-[#090814]">{event.coordinatorName}</p>
                <div className="flex flex-wrap items-center gap-4 text-xs">
                  <a href={`tel:${event.coordinatorPhone}`} className="flex items-center gap-1.5 text-[#5227FF] hover:underline">
                    <Phone className="w-3.5 h-3.5" />
                    <span>{event.coordinatorPhone}</span>
                  </a>
                  <a href={`mailto:${event.coordinatorEmail}`} className="flex items-center gap-1.5 text-[#5227FF] hover:underline">
                    <Mail className="w-3.5 h-3.5" />
                    <span>{event.coordinatorEmail}</span>
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Registration Sidebar */}
          <div className="lg:col-span-4">
            <div className="sticky top-24 p-6 rounded-3xl bg-[#FBFBFD] border-2 border-gray-200 shadow-xl space-y-6">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#717188] block mb-1">
                  Registration Desk
                </span>
                <div className="flex items-center justify-between">
                  <span className="font-display font-black text-2xl text-[#090814]">
                    FREE ENTRY
                  </span>
                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                      isPostponed
                        ? 'bg-amber-100 text-amber-800'
                        : isFull
                        ? 'bg-red-100 text-red-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {isPostponed ? 'POSTPONED' : isFull ? 'FULL / WAITLIST' : 'OPEN'}
                  </span>
                </div>
              </div>

              {/* Event Logistics Summary */}
              <div className="space-y-3 pt-4 border-t border-gray-200 text-xs text-[#525266]">
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5 text-[#5227FF]" /> Date
                  </span>
                  <span className="font-bold text-[#090814]">{event.date}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-[#5227FF]" /> Time
                  </span>
                  <span className="font-bold text-[#090814]">{event.startTime} – {event.endTime}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" /> Venue
                  </span>
                  <span className="font-bold text-[#090814] text-right truncate max-w-[160px]">{event.venueName}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-[#FF5E3A]" /> Participation
                  </span>
                  <span className="font-bold text-[#090814]">
                    {event.teamRequirement === 'TEAM'
                      ? `Squad (${event.minTeamSize}-${event.maxTeamSize})`
                      : 'Individual Entry'}
                  </span>
                </div>
              </div>

              {/* Capacity Progress Bar */}
              <div className="pt-2">
                <div className="flex items-center justify-between text-xs font-semibold text-[#090814] mb-1.5">
                  <span>Capacity</span>
                  <span>{event.registeredCount} / {event.capacity} Slots</span>
                </div>
                <div className="w-full h-2 rounded-full bg-gray-200 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all ${
                      isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                    }`}
                    style={{ width: `${utilization}%` }}
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="pt-4 space-y-3">
                {isPostponed ? (
                  <div className="p-3 rounded-xl bg-amber-50 border border-amber-200 text-xs font-semibold text-amber-900 text-center">
                    Rescheduled to 9 October 2026. Registrations open closer to date.
                  </div>
                ) : (
                  <Link
                    href={`/register?eventId=${event.id}`}
                    className={`w-full py-3.5 px-6 rounded-2xl text-white font-bold text-center block text-sm shadow-lg transition-all ${
                      isFull
                        ? 'bg-amber-600 hover:bg-amber-700'
                        : isCultural
                        ? 'bg-[#FF2E93] hover:bg-[#E01C7B]'
                        : 'bg-[#FF5E3A] hover:bg-[#E84925]'
                    }`}
                  >
                    {isFull ? 'JOIN WAITLIST' : 'REGISTER NOW'}
                  </Link>
                )}

                <Link
                  href="/my-colorido"
                  className="w-full py-2.5 px-4 rounded-xl bg-white border border-gray-200 hover:bg-gray-100 text-[#090814] font-bold text-xs text-center block transition-colors"
                >
                  ADD TO MY COLORIDO
                </Link>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
