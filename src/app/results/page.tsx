'use client';

import React, { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import {
  Trophy,
  Award,
  Medal,
  Clock,
  Search,
  Filter,
  CheckCircle2,
  AlertCircle,
  Building,
  Users,
  Sparkles,
  ArrowRight,
  ChevronRight,
  ExternalLink,
  Calendar,
  MapPin,
} from 'lucide-react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ResultItem } from '@/lib/types';

interface SummaryData {
  totalEvents: number;
  resultsPublished: number;
  resultsPending: number;
}

interface EnrichedResultItem extends ResultItem {
  venueName?: string;
  date?: string;
  startTime?: string;
  endTime?: string;
  coverImage?: string;
  teamRequirement?: string;
}

export default function FestivalResultsPage() {
  const [results, setResults] = useState<EnrichedResultItem[]>([]);
  const [summary, setSummary] = useState<SummaryData>({
    totalEvents: 0,
    resultsPublished: 0,
    resultsPending: 0,
  });
  const [loading, setLoading] = useState(true);
  const [categoryFilter, setCategoryFilter] = useState<'ALL' | 'cultural' | 'sports'>('ALL');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchResults = () => {
    fetch('/api/results')
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setResults(data.results || []);
          if (data.summary) {
            setSummary(data.summary);
          }
        }
      })
      .catch((e) => console.error(e))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    fetchResults();
  }, []);

  const filteredResults = useMemo(() => {
    return results.filter((res) => {
      const matchCat =
        categoryFilter === 'ALL' || res.category?.toLowerCase() === categoryFilter.toLowerCase();
      const query = searchQuery.toLowerCase().trim();
      if (!query) return matchCat;

      const matchSearch =
        res.eventTitle.toLowerCase().includes(query) ||
        res.subcategory?.toLowerCase().includes(query) ||
        res.winner?.name.toLowerCase().includes(query) ||
        res.winner?.college.toLowerCase().includes(query) ||
        res.winner?.teamName?.toLowerCase().includes(query) ||
        res.runnerUp?.name.toLowerCase().includes(query) ||
        res.runnerUp?.college.toLowerCase().includes(query) ||
        res.secondRunnerUp?.name.toLowerCase().includes(query) ||
        res.secondRunnerUp?.college.toLowerCase().includes(query);

      return matchCat && matchSearch;
    });
  }, [results, categoryFilter, searchQuery]);

  // Clean helper to check if a prize string is genuine (no ₹0 / 0)
  const isValidPrize = (prize?: string) => {
    if (!prize) return false;
    const clean = prize.trim().replace(/[₹,\s]/g, '');
    return clean !== '' && clean !== '0';
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-cyan-500 selection:text-slate-950 font-sans">
      <Navbar />

      <main className="flex-1 py-12 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto w-full space-y-8">
        {/* Hero Section */}
        <section className="text-center pt-6 pb-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-950/80 border border-amber-800 text-amber-400 text-xs font-bold uppercase tracking-wider mb-4 shadow-sm">
            <Trophy className="w-3.5 h-3.5" />
            <span>Official Ratified Standings</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight text-white max-w-3xl mx-auto">
            COLORIDO 2K26 <br />
            <span className="bg-gradient-to-r from-amber-400 via-pink-400 to-cyan-400 bg-clip-text text-transparent">
              Festival Results & Laurels
            </span>
          </h1>

          <p className="mt-3 text-sm sm:text-base text-slate-400 max-w-2xl mx-auto">
            Official winners and podium standings across Cultural and Sports championships of R.V.R. & J.C. College of Engineering.
          </p>
        </section>

        {/* Dynamic Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 shrink-0">
              <Trophy className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Total Championships
              </div>
              <div className="text-2xl font-black text-white">
                {summary.totalEvents || results.length}
              </div>
              <div className="text-[11px] text-slate-500">Cultural & Sports Arena events</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
              <CheckCircle2 className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Ratified & Published
              </div>
              <div className="text-2xl font-black text-emerald-400">
                {summary.resultsPublished}
              </div>
              <div className="text-[11px] text-slate-500">Official jury verified laurels</div>
            </div>
          </div>

          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex items-center gap-4 shadow-md">
            <div className="w-12 h-12 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Deliberations in Progress
              </div>
              <div className="text-2xl font-black text-amber-400">
                {summary.resultsPending}
              </div>
              <div className="text-[11px] text-slate-500">Fixtures and jury evaluations ongoing</div>
            </div>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 rounded-2xl p-4 shadow-xl">
          {/* Dual World Category Tabs */}
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <button
              onClick={() => setCategoryFilter('ALL')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                categoryFilter === 'ALL'
                  ? 'bg-slate-100 text-slate-950 shadow-md'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              ALL ARENAS
            </button>
            <button
              onClick={() => setCategoryFilter('cultural')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                categoryFilter === 'cultural'
                  ? 'bg-pink-600 text-white shadow-md shadow-pink-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              CULTURAL
            </button>
            <button
              onClick={() => setCategoryFilter('sports')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition ${
                categoryFilter === 'sports'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-600/30'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              SPORTS
            </button>
          </div>

          {/* Search Box */}
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search by event, artist, or college..."
              className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition"
            />
          </div>
        </div>

        {/* Results Cards Grid */}
        {loading ? (
          <div className="py-20 text-center text-slate-500 text-sm flex flex-col items-center justify-center gap-3">
            <div className="w-6 h-6 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
            <span>Retrieving official festival results database...</span>
          </div>
        ) : filteredResults.length === 0 ? (
          <div className="py-20 text-center text-slate-500 text-sm bg-slate-900/50 border border-slate-800/80 rounded-2xl">
            No events found matching your filter criteria.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {filteredResults.map((item) => {
              const isPublished = Boolean(item.published && item.winner?.name);

              return (
                <div
                  key={item.id || item.eventId}
                  className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between hover:border-slate-700 transition"
                >
                  <div>
                    {/* Header: Subcategory & Status Badge */}
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          item.category === 'cultural'
                            ? 'bg-pink-500/20 text-pink-300 border border-pink-500/30'
                            : 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
                        }`}
                      >
                        {item.subcategory}
                      </span>

                      {isPublished ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-emerald-400">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Official Ratified</span>
                        </span>
                      ) : (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-amber-400">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Pending Jury Deliberation</span>
                        </span>
                      )}
                    </div>

                    <h2 className="text-lg font-bold text-white tracking-tight leading-snug">
                      {item.eventTitle}
                    </h2>

                    {/* Meta info */}
                    <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 mt-1 mb-4">
                      {item.venueName && (
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-cyan-400" />
                          <span>{item.venueName}</span>
                        </span>
                      )}
                      {item.date && (
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-pink-400" />
                          <span>{item.date}</span>
                        </span>
                      )}
                    </div>

                    {/* Unannounced Status Display */}
                    {!isPublished ? (
                      <div className="mt-4 mb-4 p-5 rounded-xl bg-slate-950/70 border border-slate-800/80 text-center space-y-2">
                        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-slate-800/80 text-amber-400 mx-auto">
                          <Clock className="w-5 h-5" />
                        </div>
                        <div className="font-extrabold text-sm tracking-wider text-amber-300 uppercase">
                          RESULTS WILL BE ANNOUNCED
                        </div>
                        <p className="text-xs text-slate-400 max-w-sm mx-auto">
                          Performances and match fixtures are actively in progress. The official jury panel will publish results upon final verification.
                        </p>
                      </div>
                    ) : (
                      /* Published Podium Cards */
                      <div className="mt-4 space-y-3">
                        {/* 1st Prize Winner • Champion */}
                        {item.winner && (
                          <div className="p-3.5 rounded-xl bg-gradient-to-r from-amber-500/15 via-slate-950 to-slate-950 border border-amber-500/50 flex items-start justify-between gap-3 shadow-sm">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 font-black text-lg shadow-inner">
                                🥇
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1">
                                  <span>1st Prize • Champion</span>
                                </div>
                                <div className="font-bold text-white text-sm truncate">
                                  {item.winner.name}
                                </div>
                                <div className="text-xs text-slate-300 truncate">
                                  {item.winner.college}
                                </div>
                                {item.winner.teamName && (
                                  <div className="text-[11px] text-amber-300 font-semibold mt-0.5 flex items-center gap-1">
                                    <Users className="w-3 h-3" />
                                    <span>Team: {item.winner.teamName}</span>
                                  </div>
                                )}
                                {item.winner.teamMembers && item.winner.teamMembers.length > 0 && (
                                  <div className="text-[10px] text-slate-400 mt-1 line-clamp-1">
                                    Members: {item.winner.teamMembers.join(', ')}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Prize Badge (if genuine, no ₹0) */}
                            {isValidPrize(item.prizes?.firstPrize) && (
                              <div className="px-2.5 py-1 rounded-lg bg-amber-400/20 border border-amber-400/40 text-amber-300 font-black text-xs shrink-0 self-center">
                                {item.prizes?.firstPrize}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 2nd Prize Runner-Up */}
                        {item.runnerUp && (
                          <div className="p-3 rounded-xl bg-slate-950 border border-slate-700/60 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-200 shrink-0 font-black text-sm">
                                🥈
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                                  2nd Prize • Runner-Up
                                </div>
                                <div className="font-bold text-white text-xs truncate">
                                  {item.runnerUp.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {item.runnerUp.college}
                                </div>
                                {item.runnerUp.teamName && (
                                  <div className="text-[10px] text-slate-300 font-medium mt-0.5">
                                    Team: {item.runnerUp.teamName}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isValidPrize(item.prizes?.secondPrize) && (
                              <div className="px-2 py-0.5 rounded-md bg-slate-800 border border-slate-700 text-slate-300 font-bold text-xs shrink-0 self-center">
                                {item.prizes?.secondPrize}
                              </div>
                            )}
                          </div>
                        )}

                        {/* 3rd Prize Second Runner-Up */}
                        {item.secondRunnerUp && (
                          <div className="p-3 rounded-xl bg-slate-950 border border-amber-900/40 flex items-start justify-between gap-3">
                            <div className="flex items-start gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-amber-950/40 border border-amber-900/60 flex items-center justify-center text-amber-600 shrink-0 font-black text-sm">
                                🥉
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="text-[10px] font-bold text-amber-600 uppercase tracking-wider">
                                  3rd Prize • Second Runner-Up
                                </div>
                                <div className="font-bold text-white text-xs truncate">
                                  {item.secondRunnerUp.name}
                                </div>
                                <div className="text-[11px] text-slate-400 truncate">
                                  {item.secondRunnerUp.college}
                                </div>
                                {item.secondRunnerUp.teamName && (
                                  <div className="text-[10px] text-amber-500/80 font-medium mt-0.5">
                                    Team: {item.secondRunnerUp.teamName}
                                  </div>
                                )}
                              </div>
                            </div>

                            {isValidPrize(item.prizes?.thirdPrize) && (
                              <div className="px-2 py-0.5 rounded-md bg-amber-950/60 border border-amber-900/60 text-amber-400 font-bold text-xs shrink-0 self-center">
                                {item.prizes?.thirdPrize}
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Footer & Detail Route Link */}
                  <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                    {item.notes && isPublished ? (
                      <span className="text-[11px] text-slate-400 italic line-clamp-1 flex-1 mr-2">
                        Jury: {item.notes}
                      </span>
                    ) : (
                      <span className="text-[11px] text-slate-500 font-mono">
                        {item.eventId}
                      </span>
                    )}

                    <Link
                      href={`/results/${item.eventId}`}
                      className="inline-flex items-center gap-1 font-bold text-cyan-400 hover:text-cyan-300 transition shrink-0 ml-auto"
                    >
                      <span>View Detailed Laurels</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
