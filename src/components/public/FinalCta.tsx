'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles } from 'lucide-react';

export const FinalCta: React.FC = () => {
  return (
    <section className="py-14 sm:py-24 px-4 sm:px-6 lg:px-8 bg-[#090814] text-white relative overflow-hidden">
      {/* Subtle converging background glows */}
      <div className="absolute top-1/2 -left-40 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FF2E93]/20 blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 -right-40 -translate-y-1/2 w-96 h-96 rounded-full bg-[#FF5E3A]/20 blur-[120px] pointer-events-none" />

      <div className="relative z-10 max-w-4xl mx-auto text-center">
        <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/20 text-xs font-bold uppercase tracking-widest text-[#00DCEB] mb-4 sm:mb-6">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Two Worlds • One Experience</span>
        </div>

        <h2 className="font-display font-black text-4xl sm:text-7xl md:text-8xl tracking-tight leading-[0.95] mb-4 sm:mb-6">
          COLORIDO <span className="text-[#5227FF]">2K26</span>
        </h2>

        <p className="font-display font-extrabold text-sm sm:text-2xl tracking-widest text-gray-200 mb-6 sm:mb-8 max-w-2xl mx-auto">
          CREATE. COMPETE. EXPRESS. CONNECT.
        </p>

        <p className="text-[11px] sm:text-sm text-gray-400 uppercase tracking-[0.2em] sm:tracking-[0.25em] mb-8 sm:mb-10">
          28–29 DECEMBER 2026 • R.V.R. & J.C. COLLEGE OF ENGINEERING, GUNTUR
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href="/register"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-3 px-8 py-4 rounded-2xl bg-gradient-to-r from-[#FF2E93] to-[#FF5E3A] hover:opacity-95 text-white font-bold text-base shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>ENTER THE EXPERIENCE</span>
            <ArrowRight className="w-4 h-4" />
          </Link>

          <Link
            href="/events"
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-4 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold text-base border border-white/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
          >
            <span>EXPLORE EVENTS</span>
          </Link>
        </div>
      </div>
    </section>
  );
};
