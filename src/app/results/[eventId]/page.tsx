'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  CheckCircle2,
  Calendar,
  MapPin,
  Users,
  ArrowLeft,
  Share2,
  Printer,
  Sparkles,
  ExternalLink,
  ShieldCheck,
} from 'lucide-react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { EventItem, ResultItem } from '@/lib/types';

export default function EventResultDetailPage() {
  const params = useParams();
  const router = useRouter();
  const eventId = params?.eventId as string;

  const [loading, setLoading] = useState(true);
  const [event, setEvent] = useState<EventItem | null>(null);
  const [result, setResult] = useState<ResultItem | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!eventId) return;

    fetch(`/api/results/${eventId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setEvent(data.event);
          setResult(data.result);
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  }, [eventId]);

  const isValidPrize = (prize?: string) => {
    if (!prize) return false;
    const clean = prize.trim().replace(/[₹,\s]/g, '');
    return clean !== '' && clean !== '0';
  };

  const handleShare = () => {
    if (navigator.share) {
      navigator
        .share({
          title: `${event?.title || 'Event'} Results — COLORIDO 2K26`,
          url: window.location.href,
        })
        .catch(() => {});
    } else {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-4">
          <div className="w-8 h-8 border-3 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs text-slate-400 font-medium">Retrieving official event laurels...</p>
        </main>
        <Footer />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans">
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center p-8 space-y-4 text-center">
          <h1 className="text-2xl font-bold text-white">Event Not Found</h1>
          <p className="text-sm text-slate-400">The requested event could not be found in the championship records.</p>
          <Link
            href="/results"
            className="px-4 py-2 rounded-xl bg-cyan-500 text-slate-950 font-bold text-xs inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Results</span>
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const isPublished = Boolean(result?.published && result?.winner?.name);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Navbar />

      <main className="flex-1 py-10 px-4 sm:px-6 lg:px-8 max-w-5xl mx-auto w-full space-y-8">
        {/* Navigation Breadcrumb */}
        <div className="flex items-center justify-between">
          <Link
            href="/results"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-400 hover:text-cyan-400 transition"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Back to All Results & Laurels</span>
          </Link>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition flex items-center gap-1.5"
            >
              <Share2 className="w-3.5 h-3.5" />
              <span>{copied ? 'Link Copied!' : 'Share'}</span>
            </button>
            <button
              onClick={() => window.print()}
              className="px-3 py-1.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-xs font-medium text-slate-300 transition flex items-center gap-1.5 hidden sm:inline-flex"
            >
              <Printer className="w-3.5 h-3.5" />
              <span>Print</span>
            </button>
          </div>
        </div>

        {/* Event Header Banner Card */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 relative z-10">
            <div className="space-y-3 max-w-2xl">
              <div className="flex flex-wrap items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-black uppercase tracking-wider ${
                    event.category === 'cultural'
                      ? 'bg-pink-500/20 text-pink-300 border border-pink-500/40'
                      : 'bg-orange-500/20 text-orange-300 border border-orange-500/40'
                  }`}
                >
                  {event.subcategory}
                </span>

                {isPublished ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Official Ratified Standings</span>
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-500/20 text-amber-300 border border-amber-500/40">
                    <Clock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pending Jury Deliberation</span>
                  </span>
                )}
              </div>

              <h1 className="text-2xl sm:text-4xl font-extrabold text-white tracking-tight leading-tight">
                {event.title}
              </h1>

              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                {event.description}
              </p>

              {/* Event Metadata */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2">
                <div className="flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-cyan-400" />
                  <span>{event.venueName}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-pink-400" />
                  <span>{event.date} ({event.startTime} - {event.endTime})</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Users className="w-4 h-4 text-amber-400" />
                  <span>
                    {event.teamRequirement === 'TEAM'
                      ? `Team Event (${event.minTeamSize}-${event.maxTeamSize} members)`
                      : 'Individual Competition'}
                  </span>
                </div>
              </div>
            </div>

            {/* Quick Cover Thumbnail */}
            {event.coverImage && (
              <div className="w-24 h-24 sm:w-32 sm:h-32 rounded-2xl overflow-hidden border border-slate-700/80 shadow-lg shrink-0">
                <img
                  src={event.coverImage}
                  alt={event.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
          </div>
        </div>

        {/* Podium Standings Section */}
        {!isPublished ? (
          <div className="p-8 sm:p-12 rounded-3xl bg-slate-900/60 border border-slate-800 text-center space-y-4 shadow-xl">
            <div className="w-16 h-16 rounded-full bg-slate-800/90 border border-slate-700 flex items-center justify-center text-amber-400 mx-auto shadow-inner">
              <Clock className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-amber-300 tracking-wide uppercase">
              RESULTS WILL BE ANNOUNCED
            </h2>
            <p className="text-xs sm:text-sm text-slate-400 max-w-md mx-auto leading-relaxed">
              Match fixtures and stage performances for this championship are currently in progress or awaiting final tabulation. The official jury committee will publish confirmed standings upon conclusion.
            </p>
            <div className="pt-2">
              <Link
                href="/results"
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs inline-flex items-center gap-2 transition"
              >
                <ArrowLeft className="w-4 h-4" />
                <span>Explore Other Championship Standings</span>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-6">
            <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
              <Trophy className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg sm:text-xl font-black text-white tracking-tight uppercase">
                Official Laurels & Podium Standings
              </h2>
            </div>

            {/* 1st Prize • Champion */}
            {result?.winner && (
              <div className="p-6 sm:p-8 rounded-3xl bg-gradient-to-r from-amber-500/20 via-slate-900 to-slate-900 border-2 border-amber-500/70 shadow-2xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-2xl bg-amber-500/30 border-2 border-amber-500/60 flex items-center justify-center text-2xl shadow-inner shrink-0">
                      🥇
                    </div>
                    <div>
                      <div className="text-xs font-black text-amber-400 uppercase tracking-widest flex items-center gap-1.5">
                        <span>1st Prize • Champion</span>
                      </div>
                      <h3 className="text-xl sm:text-2xl font-black text-white mt-1">
                        {result.winner.name}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-300 font-medium">
                        {result.winner.college}
                      </p>

                      {result.winner.teamName && (
                        <div className="mt-2 text-xs text-amber-300 font-bold flex items-center gap-1.5 bg-amber-950/40 border border-amber-900/60 px-3 py-1 rounded-lg inline-flex">
                          <Users className="w-3.5 h-3.5" />
                          <span>Team: {result.winner.teamName}</span>
                        </div>
                      )}

                      {result.winner.teamMembers && result.winner.teamMembers.length > 0 && (
                        <div className="mt-3 text-xs text-slate-400">
                          <span className="font-semibold text-slate-300">Team Roster: </span>
                          <span>{result.winner.teamMembers.join(', ')}</span>
                        </div>
                      )}

                      {result.winner.scoreOrTime && (
                        <div className="mt-2 text-xs text-cyan-400 font-mono">
                          Record / Score: {result.winner.scoreOrTime}
                        </div>
                      )}
                    </div>
                  </div>

                  {isValidPrize(result.prizes?.firstPrize) && (
                    <div className="px-4 py-2 rounded-2xl bg-amber-400/20 border border-amber-400/50 text-amber-300 font-black text-sm sm:text-base self-start sm:self-center shrink-0">
                      {result.prizes?.firstPrize}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 2nd Prize • Runner-Up */}
            {result?.runnerUp && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-slate-700/80 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-xl shrink-0">
                      🥈
                    </div>
                    <div>
                      <div className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                        2nd Prize • Runner-Up
                      </div>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {result.runnerUp.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {result.runnerUp.college}
                      </p>

                      {result.runnerUp.teamName && (
                        <div className="mt-1 text-xs text-slate-300 font-medium">
                          Team: {result.runnerUp.teamName}
                        </div>
                      )}
                    </div>
                  </div>

                  {isValidPrize(result.prizes?.secondPrize) && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs sm:text-sm self-start sm:self-center shrink-0">
                      {result.prizes?.secondPrize}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* 3rd Prize • Second Runner-Up */}
            {result?.secondRunnerUp && (
              <div className="p-6 rounded-2xl bg-slate-900 border border-amber-900/40 shadow-lg">
                <div className="flex flex-col sm:flex-row items-start justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-amber-950/40 border border-amber-900/60 flex items-center justify-center text-xl shrink-0">
                      🥉
                    </div>
                    <div>
                      <div className="text-xs font-bold text-amber-600 uppercase tracking-widest">
                        3rd Prize • Second Runner-Up
                      </div>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {result.secondRunnerUp.name}
                      </h4>
                      <p className="text-xs text-slate-400">
                        {result.secondRunnerUp.college}
                      </p>

                      {result.secondRunnerUp.teamName && (
                        <div className="mt-1 text-xs text-amber-500/80 font-medium">
                          Team: {result.secondRunnerUp.teamName}
                        </div>
                      )}
                    </div>
                  </div>

                  {isValidPrize(result.prizes?.thirdPrize) && (
                    <div className="px-3.5 py-1.5 rounded-xl bg-amber-950/60 border border-amber-900/60 text-amber-400 font-bold text-xs sm:text-sm self-start sm:self-center shrink-0">
                      {result.prizes?.thirdPrize}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Jury Notes & Ratification Seal */}
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs text-slate-400">
              <div className="flex items-center gap-3">
                <ShieldCheck className="w-6 h-6 text-emerald-400 shrink-0" />
                <div>
                  <div className="font-bold text-slate-200 uppercase tracking-wider text-[11px]">
                    Official Jury Ratification
                  </div>
                  <div>{result?.notes || 'Certified by the official Colorido 2K26 Academic & Sports Jury Council.'}</div>
                </div>
              </div>

              {result?.announcedAt && (
                <div className="text-[10px] text-slate-500 shrink-0">
                  Ratified: {new Date(result.announcedAt).toLocaleDateString()}
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
