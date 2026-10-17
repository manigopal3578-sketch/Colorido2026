'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { RegistrationItem, TicketItem, AnnouncementItem } from '@/lib/types';
import {
  User,
  Search,
  Calendar,
  Clock,
  MapPin,
  QrCode,
  CheckCircle2,
  AlertCircle,
  Bell,
  ArrowRight,
  Printer,
  Sparkles,
  ShieldCheck,
  RotateCcw,
  Hotel,
  Ticket,
} from 'lucide-react';

export default function MyColoridoPage() {
  const [query, setQuery] = useState('');
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [registrations, setRegistrations] = useState<RegistrationItem[]>([]);
  const [tickets, setTickets] = useState<TicketItem[]>([]);
  const [announcements, setAnnouncements] = useState<AnnouncementItem[]>([]);

  useEffect(() => {
    // Fetch live announcements
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setAnnouncements(json.announcements || []);
        }
      });

    // Check URL parameters first (e.g. ?regId=CLR26-... or ?email=...)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const urlRegId = params.get('regId') || params.get('id');
      const urlEmail = params.get('email');
      const savedEmail = localStorage.getItem('colorido_participant_email');

      const initialQ = urlRegId || urlEmail || savedEmail;
      if (initialQ) {
        setQuery(initialQ);
        executeSearch(initialQ);
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const executeSearch = async (targetQuery: string) => {
    const q = targetQuery.trim();
    if (!q) return;

    setLoading(true);
    setSearched(true);

    try {
      const isEmail = q.includes('@');
      const isPhone = !isEmail && /^\+?[\d\s-]{10,}$/.test(q);

      let url = `/api/registrations?regId=${encodeURIComponent(q)}`;
      if (isEmail) {
        url = `/api/registrations?email=${encodeURIComponent(q.toLowerCase())}`;
      } else if (isPhone) {
        url = `/api/registrations?phone=${encodeURIComponent(q.replace(/\s+/g, ''))}`;
      }

      const res = await fetch(url);
      const json = await res.json();

      if (json.success) {
        if (json.registrations && json.registrations.length > 0) {
          setRegistrations(json.registrations);
          setTickets(json.tickets || []);
          if (json.registrations[0]?.email) {
            localStorage.setItem('colorido_participant_email', json.registrations[0].email);
          }
        } else if (json.registration) {
          setRegistrations([json.registration]);
          setTickets(json.ticket ? [json.ticket] : []);
          if (json.registration?.email) {
            localStorage.setItem('colorido_participant_email', json.registration.email);
          }
        } else {
          setRegistrations([]);
          setTickets([]);
        }
      } else {
        setRegistrations([]);
        setTickets([]);
      }
    } catch (e) {
      console.error('Passport search error:', e);
      setRegistrations([]);
      setTickets([]);
    } finally {
      setLoading(false);
    }
  };

  const handleClear = () => {
    setQuery('');
    setSearched(false);
    setRegistrations([]);
    setTickets([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem('colorido_participant_email');
      window.history.replaceState({}, '', window.location.pathname);
    }
  };

  // Primary participant metadata if registrations exist
  const primaryParticipant = registrations[0];

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full">
        {/* Header & Search */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-black uppercase tracking-widest text-[#5227FF] mb-3 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>OFFICIAL PARTICIPANT PORTAL</span>
          </div>
          <h1 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            MY COLORIDO PASSPORT
          </h1>
          <p className="text-xs sm:text-sm text-[#525266] font-medium leading-relaxed">
            Direct, open access to your verified entry passes, digital QR credentials, and arena schedules. No third-party login required.
          </p>

          {/* Secure Lookup Input */}
          <div className="mt-8 flex flex-col sm:flex-row items-center gap-2 max-w-lg mx-auto">
            <div className="relative w-full">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Enter Email, Phone, or Pass ID (CLR26-...)"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && executeSearch(query)}
                className="w-full pl-10 pr-4 py-3.5 rounded-xl border border-gray-300 text-xs sm:text-sm font-semibold text-[#090814] focus:border-[#5227FF] focus:ring-1 focus:ring-[#5227FF] bg-white shadow-sm"
              />
            </div>
            <button
              onClick={() => executeSearch(query)}
              disabled={loading}
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-[#090814] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md transition-all shrink-0 flex items-center justify-center gap-2"
            >
              <Ticket className="w-4 h-4 text-[#00DCEB]" />
              <span>{loading ? 'Verifying...' : 'Find Passes'}</span>
            </button>
          </div>
        </div>

        {/* Dashboard Content */}
        {searched && (
          <div className="space-y-8 animate-fadeIn">
            {registrations.length > 0 ? (
              <>
                {/* 1. VERIFIED PARTICIPANT IDENTITY CARD */}
                <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-[#090814] via-[#161226] to-[#090814] text-white shadow-2xl relative overflow-hidden border border-gray-800">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <span className="px-3 py-0.5 rounded-full bg-[#5227FF]/40 border border-[#5227FF] text-[#00DCEB] text-[10px] font-black uppercase tracking-widest">
                          VERIFIED PARTICIPANT PASSPORT
                        </span>
                        <span className="text-xs text-gray-400 font-mono">
                          ID: {primaryParticipant.participantId}
                        </span>
                      </div>

                      <h2 className="font-display font-black text-2xl sm:text-4xl tracking-tight">
                        {primaryParticipant.participantName}
                      </h2>

                      <p className="text-xs sm:text-sm text-gray-300 font-medium">
                        {primaryParticipant.collegeName} • {primaryParticipant.department} ({primaryParticipant.year})
                      </p>

                      <div className="flex flex-wrap items-center gap-4 text-xs text-gray-400 pt-1">
                        <span>Roll: <strong className="text-white">{primaryParticipant.studentId}</strong></span>
                        <span>•</span>
                        <span>Email: <strong className="text-white">{primaryParticipant.email}</strong></span>
                        <span>•</span>
                        <span>Phone: <strong className="text-white">{primaryParticipant.phone}</strong></span>
                      </div>
                    </div>

                    <div className="flex flex-col sm:flex-row md:flex-col items-start md:items-end gap-3 shrink-0 pt-4 md:pt-0 border-t md:border-t-0 border-gray-800">
                      <div className="px-4 py-2 rounded-xl bg-white/10 backdrop-blur-md border border-white/10 text-center">
                        <span className="text-[10px] text-gray-300 uppercase tracking-widest block font-bold">
                          ACTIVE EVENTS
                        </span>
                        <span className="font-display font-black text-2xl text-[#00DCEB]">
                          {registrations.length}
                        </span>
                      </div>

                      <button
                        onClick={handleClear}
                        className="inline-flex items-center gap-1.5 text-xs text-gray-400 hover:text-white transition-colors"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Switch Participant</span>
                      </button>
                    </div>
                  </div>
                </div>

                {/* 2. GROUPED TICKETS & REGISTRATIONS */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="font-display font-black text-2xl text-[#090814]">
                        MY REGISTERED CHAMPIONSHIPS
                      </h3>
                      <p className="text-xs text-[#525266]">
                        Individual verified passes for each collegiate competition.
                      </p>
                    </div>
                    <span className="text-xs font-bold text-[#5227FF] bg-primary-light px-3 py-1 rounded-full">
                      {registrations.length} {registrations.length === 1 ? 'Championship' : 'Championships'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {registrations.map((reg, idx) => {
                      const isCheckedIn = reg.checkInStatus === 'CHECKED_IN';
                      const isCultural = reg.category === 'cultural';
                      const ticket = tickets.find((t) => t.registrationId === reg.id) || tickets[idx];

                      return (
                        <div
                          key={reg.id}
                          className="p-6 rounded-3xl bg-[#FBFBFD] border-2 border-gray-200/80 shadow-md hover:shadow-xl transition-all flex flex-col justify-between space-y-5 relative overflow-hidden"
                        >
                          <div>
                            {/* Card Top Pill Bar */}
                            <div className="flex items-center justify-between mb-3">
                              <span
                                className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider text-white ${
                                  isCultural ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                                }`}
                              >
                                Event {idx + 1} • {reg.category.toUpperCase()}
                              </span>

                              <span
                                className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                                  isCheckedIn
                                    ? 'bg-green-100 text-green-800 border border-green-300'
                                    : 'bg-amber-100 text-amber-800 border border-amber-300'
                                }`}
                              >
                                {isCheckedIn ? '✓ CHECKED IN' : 'CHECK-IN PENDING'}
                              </span>
                            </div>

                            {/* Event Title */}
                            <h4 className="font-display font-black text-xl sm:text-2xl text-[#090814] leading-snug">
                              {reg.eventTitle}
                            </h4>
                            <p className="text-xs font-mono text-[#525266] mt-1">
                              Pass ID: <strong className="text-[#090814]">{reg.id}</strong>
                            </p>

                            {/* Schedule & Logistics */}
                            <div className="grid grid-cols-2 gap-2 mt-4 p-3 rounded-xl bg-white border border-gray-200 text-xs text-[#525266]">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5 text-[#5227FF] shrink-0" />
                                <span className="truncate">{ticket?.date || '28–29 Dec 2026'}</span>
                              </div>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5 text-[#FF2E93] shrink-0" />
                                <span className="truncate">{ticket?.time || 'Festival Session'}</span>
                              </div>
                              <div className="col-span-2 flex items-center gap-1.5 pt-1 border-t border-gray-100">
                                <MapPin className="w-3.5 h-3.5 text-[#FF5E3A] shrink-0" />
                                <span className="truncate">{ticket?.venueName || 'Campus Venue'}</span>
                              </div>
                            </div>

                            {/* Team Badge */}
                            {reg.teamName && (
                              <div className="mt-3 p-2.5 rounded-xl bg-[#F5F5FA] border border-gray-200 text-xs">
                                <span className="font-bold text-[#090814]">Squad / Team: </span>
                                <span className="text-[#5227FF] font-black">{reg.teamName}</span>
                                {reg.teamMembers && reg.teamMembers.length > 0 && (
                                  <span className="text-gray-500 text-[11px] block mt-0.5">
                                    Members: {reg.teamMembers.map((m) => m.name).join(', ')}
                                  </span>
                                )}
                              </div>
                            )}

                            {/* Accommodation Badge */}
                            {reg.accommodationRequired && (
                              <div className="mt-2 p-2.5 rounded-xl bg-[#F5F3FF] border border-[#DDD6FE] text-xs flex items-center gap-2">
                                <Hotel className="w-4 h-4 text-[#5227FF] shrink-0" />
                                <div>
                                  <span className="font-bold text-[#5227FF]">Campus Stay Allotment: </span>
                                  <span className="text-gray-700">
                                    {reg.accommodationType === 'GIRLS_HOSTEL' ? 'Girls Hostel (Block G)' : 'Boys Hostel (Block B)'}
                                  </span>
                                </div>
                              </div>
                            )}
                          </div>

                          {/* Action Links */}
                          <div className="pt-4 border-t border-gray-200 flex items-center justify-between gap-2">
                            <Link
                              href={`/ticket/${reg.id}`}
                              className="px-4 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-sm transition-all flex items-center gap-1.5"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>View Digital Ticket</span>
                            </Link>

                            <Link
                              href={`/events/${reg.eventId}`}
                              className="px-3.5 py-2.5 rounded-xl bg-white border border-gray-300 hover:bg-gray-100 text-xs font-semibold text-[#090814] transition-all"
                            >
                              Arena Rules
                            </Link>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </>
            ) : (
              /* No Passes Found */
              <div className="p-12 text-center bg-[#FBFBFD] rounded-3xl border-2 border-dashed border-gray-300">
                <User className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="font-display font-black text-xl text-[#090814]">
                  NO REGISTRATIONS FOUND
                </h3>
                <p className="text-xs sm:text-sm text-[#525266] max-w-md mx-auto mt-1 mb-6">
                  We could not find any active pass for &quot;{query}&quot;. Please verify your registered email, mobile number, or Registration ID.
                </p>
                <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
                  <button
                    onClick={handleClear}
                    className="px-5 py-2.5 rounded-xl bg-white border border-gray-300 text-xs font-bold text-[#090814] hover:bg-gray-50"
                  >
                    Try Another Lookup
                  </button>
                  <Link
                    href="/register"
                    className="px-6 py-2.5 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs font-bold shadow-md"
                  >
                    Register for an Event Now
                  </Link>
                </div>
              </div>
            )}

            {/* Official Festival Announcements */}
            <div className="pt-6">
              <h3 className="font-display font-bold text-xl text-[#090814] mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5 text-[#5227FF]" />
                <span>Live Festival Notices</span>
              </h3>

              <div className="space-y-3">
                {announcements.slice(0, 3).map((a) => (
                  <div key={a.id} className="p-4 rounded-xl bg-white border border-gray-200 text-xs shadow-sm">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-[#090814]">{a.title}</span>
                      <span className="text-[10px] text-gray-400">{a.date}</span>
                    </div>
                    <p className="text-[#525266]">{a.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Initial Prompt when nothing searched */}
        {!searched && (
          <div className="p-10 sm:p-14 text-center bg-[#FBFBFD] rounded-3xl border border-gray-200 shadow-sm">
            <QrCode className="w-16 h-16 text-[#5227FF] mx-auto mb-4" />
            <h3 className="font-display font-black text-2xl text-[#090814] mb-2">
              RETRIEVE YOUR DIGITAL ENTRY PASSES
            </h3>
            <p className="text-xs sm:text-sm text-[#525266] max-w-lg mx-auto mb-8 leading-relaxed">
              All festival participants can instantly access their confirmed registration passes, room allocations, and QR verification codes using their registered student email, phone, or Pass ID.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                href="/register"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-[#5227FF] hover:bg-primary-hover text-white text-xs sm:text-sm font-bold shadow-md transition-all"
              >
                Register for Championships
              </Link>
              <Link
                href="/events"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-white border border-gray-200 hover:bg-gray-50 text-xs sm:text-sm font-bold text-[#090814] transition-all"
              >
                Browse Championship Rules
              </Link>
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
