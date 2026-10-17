'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowRight, Sparkles, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import { HomepageHeroConfig, FestivalSettings } from '@/lib/types';

interface DualWorldHeroProps {
  heroConfig?: HomepageHeroConfig;
  settings?: FestivalSettings;
}

export const DualWorldHero: React.FC<DualWorldHeroProps> = ({ heroConfig, settings }) => {
  // Configured values with fallback to official defaults
  const institutionalLabel =
    heroConfig?.institutionalLabel ||
    settings?.college ||
    'R.V.R. & J.C. COLLEGE OF ENGINEERING • GUNTUR';
  const title = heroConfig?.title || settings?.shortName || 'COLORIDO';
  const edition = heroConfig?.edition || settings?.edition || '2K26';
  const datesText = heroConfig?.datesText || '28–29 DECEMBER 2026';
  const heroImage = heroConfig?.heroImage || '/images/colorido-hero-bg.jpg';
  const countdownVisible =
    heroConfig?.countdownVisible !== undefined
      ? heroConfig.countdownVisible
      : (settings?.countdownVisible ?? true);

  const ctaPrimaryText = heroConfig?.ctaPrimaryText || 'REGISTER NOW';
  const ctaPrimaryLink = heroConfig?.ctaPrimaryLink || '/register';
  const ctaSecondaryText = heroConfig?.ctaSecondaryText || 'EXPLORE EVENTS';
  const ctaSecondaryLink = heroConfig?.ctaSecondaryLink || '/events';

  // Target countdown timestamp
  const targetDateStr =
    heroConfig?.targetDate ||
    (settings?.startDate
      ? `${settings.startDate}T${settings.startTime || '09:00'}:00+05:30`
      : '2026-12-28T09:00:00+05:30');

  const [timeLeft, setTimeLeft] = useState({
    days: 89,
    hours: 14,
    minutes: 35,
    seconds: 21,
  });

  useEffect(() => {
    const targetTimestamp = new Date(targetDateStr).getTime();

    const updateCountdown = () => {
      const now = new Date().getTime();
      const diff = targetTimestamp - now;

      if (diff > 0) {
        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);
        setTimeLeft({ days, hours, minutes, seconds });
      } else {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0 });
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr]);

  return (
    <section className="relative w-full min-h-[92vh] sm:min-h-screen flex flex-col justify-between items-center overflow-hidden bg-[#0a0915] text-center select-none">
      {/* 
        ============================================================
        1. REAL RVRJC CAMPUS HERO IMAGE WITH COLORFUL SKY RIBBONS
        - Image is set slightly downwards so the campus entrance is
          grounded at bottom and the colorful sky occupies center/top.
        - Building and festive ribbons completely clear and recognizable.
        - NO opaque white box, NO blur, NO duplicate poster.
        ============================================================
      */}
      <div className="absolute inset-0 z-0 select-none overflow-hidden">
        <img
          src={heroImage}
          alt={`${title} ${edition} — ${institutionalLabel}`}
          className="w-full h-full object-cover object-[center_26%] sm:object-[center_30%] lg:object-[center_33%] brightness-[1.04] contrast-[1.02]"
          loading="eager"
          // @ts-ignore
          fetchPriority="high"
        />

        {/* Ultra-subtle atmospheric scrim preserving campus building clarity, facade banners, and festival brightness */}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-black/15 pointer-events-none" />
      </div>

      {/* 
        ============================================================
        2. EXACT CENTERED HERO MATTER (MATCHING REFERENCE MOCKUP)
        - Perfectly horizontally & vertically centered in the upper/mid sky
        - College name, bold 3D title, tagline, date, countdown, buttons
        - Localized soft shadow behind text ensures 100% legibility while
          keeping the RVR & JC facade and festival visuals bright and crisp.
        ============================================================
      */}
      <div className="relative z-10 max-w-4xl mx-auto w-full px-4 sm:px-6 lg:px-8 pt-7 sm:pt-12 pb-6 flex flex-col items-center justify-center text-center my-auto space-y-3 sm:space-y-4">
        {/* Localized soft readability treatment strictly behind text */}
        <div className="absolute inset-0 -z-10 bg-radial from-black/50 via-black/20 to-transparent rounded-full blur-2xl pointer-events-none opacity-80" />
        {/* Top Institution Pill Badge */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="inline-flex items-center gap-2 px-3.5 sm:px-4 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/25 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase shadow-lg">
            <Sparkles className="w-3.5 h-3.5 text-[#FFC857]" />
            <span>{institutionalLabel}</span>
          </div>
        </motion.div>

        {/* COLORIDO 2K26 Centered Title with 3D Drop Shadow */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="space-y-1 sm:space-y-2 drop-shadow-[0_8px_24px_rgba(0,0,0,0.85)]"
        >
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tight leading-[0.9] text-white">
            {title}
          </h1>
          <h1 className="font-display font-black text-5xl sm:text-7xl md:text-8xl lg:text-[96px] tracking-tight leading-[0.9] bg-gradient-to-r from-[#FFC857] via-[#FF2E93] to-[#00DCEB] bg-clip-text text-transparent">
            {edition}
          </h1>
        </motion.div>

        {/* Tagline Pill Badge: CREATE • COMPETE • EXPRESS • CONNECT */}
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className="inline-flex items-center gap-2 sm:gap-3 px-4 sm:px-6 py-1.5 rounded-full bg-black/60 backdrop-blur-md border border-white/20 text-white text-[10px] sm:text-xs font-black tracking-widest uppercase drop-shadow-md shadow-md">
            <span className="text-white">CREATE</span>
            <span className="text-white/40">•</span>
            <span className="text-[#FF2E93]">COMPETE</span>
            <span className="text-white/40">•</span>
            <span className="text-[#FFC857]">EXPRESS</span>
            <span className="text-white/40">•</span>
            <span className="text-[#00DCEB]">CONNECT</span>
          </div>
        </motion.div>

        {/* Festival Dates Text - High-Contrast Glass Pill */}
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className="inline-flex items-center gap-2 px-4 sm:px-5 py-1.5 rounded-full bg-black/75 backdrop-blur-md border border-white/30 text-white text-[11px] sm:text-xs md:text-sm font-black tracking-widest uppercase shadow-xl drop-shadow-md select-none"
        >
          <Calendar className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#FFC857] shrink-0" />
          <span className="text-white drop-shadow-[0_1px_3px_rgba(0,0,0,0.9)] tracking-wider sm:tracking-widest">
            {datesText}
          </span>
        </motion.div>

        {/* 
          ============================================================
          COUNTDOWN TIMER BAR (MATCHING REFERENCE MOCKUP)
          - Rounded dark glassy pill bar
          - 89 DAYS | 14 HRS | 35 MIN | 21 SEC
          ============================================================
        */}
        {countdownVisible && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="w-full max-w-sm sm:max-w-md pt-1"
          >
            <div className="w-full bg-black/65 backdrop-blur-md rounded-2xl sm:rounded-3xl border border-white/20 shadow-2xl px-4 sm:px-6 py-2.5 sm:py-3">
              <div className="grid grid-cols-4 divide-x divide-white/15 text-center">
                <div className="px-1 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-2xl sm:text-3xl text-white leading-none">
                    {String(timeLeft.days).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-gray-300 mt-1">
                    DAYS
                  </span>
                </div>

                <div className="px-1 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-2xl sm:text-3xl text-[#FF2E93] leading-none">
                    {String(timeLeft.hours).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#FF2E93] mt-1">
                    HRS
                  </span>
                </div>

                <div className="px-1 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-2xl sm:text-3xl text-[#FFC857] leading-none">
                    {String(timeLeft.minutes).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#FFC857] mt-1">
                    MIN
                  </span>
                </div>

                <div className="px-1 flex flex-col items-center justify-center">
                  <span className="font-display font-black text-2xl sm:text-3xl text-[#00DCEB] leading-none">
                    {String(timeLeft.seconds).padStart(2, '0')}
                  </span>
                  <span className="text-[9px] sm:text-[10px] font-black uppercase tracking-wider text-[#00DCEB] mt-1">
                    SEC
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* 
          ============================================================
          CENTERED ACTION BUTTONS (MATCHING REFERENCE MOCKUP)
          - Side-by-side pill buttons with arrows
          - EXPLORE EVENTS: Highlighted strong secondary CTA with smooth interactive hover
          - REGISTER NOW: Primary CTA with lighter, subtle interactive motion
          ============================================================
        */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.25 }}
          className="flex flex-row items-center justify-center gap-2.5 sm:gap-4 pt-1 sm:pt-2 w-full max-w-md sm:max-w-none"
        >
          <Link
            href={ctaSecondaryLink}
            className="group inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3 rounded-full bg-black/75 hover:bg-black/90 backdrop-blur-md border border-white/40 hover:border-[#00DCEB]/80 text-white text-[11px] sm:text-sm font-extrabold tracking-wider uppercase shadow-xl hover:shadow-[0_0_20px_rgba(0,220,235,0.25)] transition-all duration-200 hover:-translate-y-0.5 hover:scale-[1.02] active:scale-[0.98] shrink-0"
          >
            <span>{ctaSecondaryText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#00DCEB] group-hover:translate-x-1.5 transition-transform duration-200" />
          </Link>

          <Link
            href={ctaPrimaryLink}
            className="group inline-flex items-center justify-center gap-2 px-4 sm:px-7 py-2.5 sm:py-3 rounded-full bg-gradient-to-r from-[#FFC857] via-[#FF2E93] to-[#00DCEB] hover:brightness-105 text-[#090814] text-[11px] sm:text-sm font-black tracking-wider uppercase shadow-xl shadow-pink-500/25 transition-all duration-200 hover:scale-[1.01] active:scale-[0.99] shrink-0"
          >
            <span>{ctaPrimaryText}</span>
            <ArrowRight className="w-3.5 h-3.5 text-[#090814] group-hover:translate-x-0.5 transition-transform duration-200" />
          </Link>
        </motion.div>
      </div>

      {/* 
        ============================================================
        BREATHING SPACE AT BOTTOM
        - Keeps campus entrance, palms, and walkway visible
        ============================================================
      */}
      <div className="w-full h-16 sm:h-28 lg:h-36 pointer-events-none" />
    </section>
  );
};
