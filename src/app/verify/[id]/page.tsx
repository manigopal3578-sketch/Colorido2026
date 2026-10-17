'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import {
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Calendar,
  Clock,
  MapPin,
  ShieldCheck,
  ArrowLeft,
  Sparkles,
  Ticket,
} from 'lucide-react';

export default function PublicTicketVerifyPage() {
  const params = useParams();
  const rawId = (params?.id as string) || '';

  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!rawId) return;

    fetch(`/api/verify?id=${encodeURIComponent(rawId)}`)
      .then((res) => res.json())
      .then((json) => {
        setData(json);
      })
      .catch(() => {
        setError('Network error contacting festival verification service.');
      })
      .finally(() => setLoading(false));
  }, [rawId]);

  return (
    <div className="min-h-screen flex flex-col bg-slate-950 text-slate-100 font-sans selection:bg-cyan-500 selection:text-slate-950">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-2xl mx-auto w-full flex flex-col justify-center">
        {/* Navigation Link */}
        <div className="mb-6">
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-white transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to COLORIDO 2K26</span>
          </Link>
        </div>

        {/* Card Container */}
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Top Brand Banner */}
          <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-cyan-500 via-indigo-600 to-pink-500 p-[2px] shrink-0">
                <div className="w-full h-full bg-slate-900 rounded-[10px] flex items-center justify-center">
                  <Ticket className="w-5 h-5 text-cyan-400" />
                </div>
              </div>
              <div>
                <h1 className="font-bold text-white text-base sm:text-lg tracking-tight">
                  COLORIDO 2K26
                </h1>
                <p className="text-[11px] text-slate-400">
                  Official Public Ticket Verification Service
                </p>
              </div>
            </div>

            <div className="text-right hidden sm:block">
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest block">
                R.V.R. &amp; J.C. CE
              </span>
              <span className="text-[11px] text-slate-400">Guntur, AP</span>
            </div>
          </div>

          {/* Loading State */}
          {loading && (
            <div className="py-16 text-center space-y-4">
              <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto" />
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Verifying authentic ticket pass with central database...
              </p>
            </div>
          )}

          {/* Error State */}
          {!loading && error && (
            <div className="py-10 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-red-950/60 border border-red-800 text-red-400 flex items-center justify-center mx-auto">
                <XCircle className="w-6 h-6" />
              </div>
              <h2 className="font-bold text-base text-white">Verification Error</h2>
              <p className="text-xs text-slate-400 max-w-sm mx-auto">{error}</p>
            </div>
          )}

          {/* Result: INVALID TICKET */}
          {!loading && !error && (!data || !data.success) && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-red-950/60 border-2 border-red-500 text-red-100 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-red-500 text-slate-950 shrink-0">
                    <XCircle className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg text-red-300 leading-tight">
                      INVALID TICKET / NOT FOUND
                    </h2>
                    <p className="text-xs text-red-200 mt-1">
                      {data?.message || 'The scanned QR pass could not be authenticated against the official festival registry.'}
                    </p>
                  </div>
                </div>
              </div>

              <div className="bg-slate-950 rounded-2xl p-4 border border-slate-800 text-xs text-slate-400 space-y-2">
                <p className="font-semibold text-slate-200">Notice to attendee:</p>
                <p>
                  If you registered for COLORIDO 2K26, please log into{' '}
                  <Link href="/my-colorido" className="text-cyan-400 underline">
                    My COLORIDO
                  </Link>{' '}
                  to access your active digital ticket, or visit the registration help desk at the campus main entrance.
                </p>
              </div>
            </div>
          )}

          {/* Result: ALREADY CHECKED IN */}
          {!loading && !error && data?.success && data.code === 'ALREADY_CHECKED_IN' && data.ticket && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-amber-950/70 border-2 border-amber-500 text-amber-100 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-amber-500 text-slate-950 shrink-0">
                    <AlertTriangle className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg text-amber-300 leading-tight">
                      ALREADY CHECKED IN
                    </h2>
                    <p className="text-xs text-amber-200 mt-1">
                      {data.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Participant Credentials */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Participant:</span>
                  <span className="font-bold text-white text-sm">{data.ticket.participantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">College:</span>
                  <span className="font-medium text-slate-200 text-right max-w-[220px] truncate">{data.ticket.collegeName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Registered Event:</span>
                  <span className="font-bold text-cyan-300 text-right">{data.ticket.eventTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-pink-300">{data.ticket.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Ticket ID:</span>
                  <span className="font-mono text-purple-300">{data.ticket.id}</span>
                </div>
                {data.ticket.checkedInAt && (
                  <div className="flex justify-between pt-1">
                    <span className="text-slate-400">Checked In At:</span>
                    <span className="font-mono text-amber-300">
                      {new Date(data.ticket.checkedInAt).toLocaleTimeString('en-US', {
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Result: VALID TICKET */}
          {!loading && !error && data?.success && data.code === 'VALID' && data.ticket && (
            <div className="space-y-6">
              <div className="p-4 rounded-2xl bg-emerald-950/70 border-2 border-emerald-500 text-emerald-100 shadow-xl">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-xl bg-emerald-500 text-slate-950 shrink-0">
                    <ShieldCheck className="w-7 h-7" />
                  </div>
                  <div>
                    <h2 className="font-extrabold text-base sm:text-lg text-emerald-300 leading-tight">
                      OFFICIAL VERIFIED TICKET
                    </h2>
                    <p className="text-xs text-emerald-200 mt-1">
                      {data.message}
                    </p>
                  </div>
                </div>
              </div>

              {/* Safe Participant Credentials */}
              <div className="bg-slate-950 rounded-2xl p-5 border border-slate-800 space-y-3 text-xs">
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Participant Name:</span>
                  <span className="font-bold text-white text-sm">{data.ticket.participantName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">College / Institution:</span>
                  <span className="font-medium text-slate-200 text-right max-w-[220px] truncate">{data.ticket.collegeName}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Registered Event:</span>
                  <span className="font-bold text-cyan-300 text-right">{data.ticket.eventTitle}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Category:</span>
                  <span className="font-semibold uppercase tracking-wider text-[11px] text-pink-300">{data.ticket.category}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Pass / Ticket ID:</span>
                  <span className="font-mono text-purple-300">{data.ticket.id}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Scheduled Date:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{data.ticket.date}</span>
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2.5">
                  <span className="text-slate-400">Venue Location:</span>
                  <span className="font-medium text-slate-200 flex items-center gap-1">
                    <MapPin className="w-3.5 h-3.5 text-pink-400" />
                    <span>{data.ticket.venueName}</span>
                  </span>
                </div>
                <div className="flex justify-between pt-1">
                  <span className="text-slate-400">Entry Pass Status:</span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    ACTIVE &amp; VALID
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* Bottom Card Actions */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
            <span className="text-slate-500 text-[11px]">
              COLORIDO 2K26 • 28–29 December 2026
            </span>
            <Link
              href="/my-colorido"
              className="text-cyan-400 hover:text-cyan-300 font-semibold transition"
            >
              Access My Passes &rarr;
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
