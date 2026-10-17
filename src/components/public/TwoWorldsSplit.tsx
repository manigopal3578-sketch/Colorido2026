'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Music, Trophy, ArrowRight, Sparkles, Flame, Heart } from 'lucide-react';
import { motion } from 'framer-motion';

export const TwoWorldsSplit: React.FC = () => {
  const [activeWorld, setActiveWorld] = useState<'CULTURAL' | 'SPORTS'>('CULTURAL');

  return (
    <section id="two-worlds" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-gray-200 text-xs font-extrabold uppercase tracking-widest text-[#5227FF] mb-3 sm:mb-4 shadow-sm">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Signature Experience</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-6xl text-[#090814] tracking-tight mb-3 sm:mb-4">
            TWO WORLDS. ONE EXPERIENCE.
          </h2>
          <p className="text-sm sm:text-lg text-[#525266] font-medium leading-relaxed">
            COLORIDO 2K26 bridges pure artistic expression and raw athletic competition. Choose your realm or conquer both.
          </p>

          {/* Interactive World Switcher Buttons */}
          <div className="inline-flex p-1.5 mt-6 sm:mt-8 bg-white border border-gray-200/90 rounded-2xl shadow-sm">
            <button
              onClick={() => setActiveWorld('CULTURAL')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeWorld === 'CULTURAL'
                  ? 'bg-[#FF2E93] text-white shadow-md'
                  : 'text-[#525266] hover:text-[#090814]'
              }`}
            >
              <Music className="w-4 h-4" />
              <span>CULTURAL WORLD</span>
            </button>

            <button
              onClick={() => setActiveWorld('SPORTS')}
              className={`flex items-center gap-1.5 sm:gap-2 px-4 sm:px-6 py-2.5 sm:py-3 rounded-xl text-xs sm:text-sm font-black transition-all ${
                activeWorld === 'SPORTS'
                  ? 'bg-[#FF5E3A] text-white shadow-md'
                  : 'text-[#525266] hover:text-[#090814]'
              }`}
            >
              <Trophy className="w-4 h-4" />
              <span>SPORTS ARENA</span>
            </button>
          </div>
        </motion.div>

        {/* The Visual Split Cards */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 sm:gap-8 items-stretch">
          {/* Cultural World Card */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            onClick={() => setActiveWorld('CULTURAL')}
            className={`group relative rounded-3xl p-5 sm:p-10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between border-2 ${
              activeWorld === 'CULTURAL'
                ? 'bg-gradient-to-br from-[#FFEBF4]/60 via-white to-white border-[#FF2E93] shadow-2xl scale-[1.01]'
                : 'bg-white border-gray-200/80 hover:border-[#FF2E93]/50 opacity-90'
            }`}
          >
            {/* Ambient Accent Light */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FF2E93]/10 blur-[80px] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#FFEBF4] text-[#FF2E93] font-bold text-xs uppercase tracking-widest">
                  World 01 • Cultural
                </span>
                <span className="text-xs font-extrabold text-[#717188]">DEC 28–29</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-5xl text-[#090814] mb-4 leading-tight">
                RHYTHM, DANCE & SOUL
              </h3>

              <p className="text-sm sm:text-base text-[#525266] font-medium leading-relaxed mb-6">
                From ancient classical Bharatanatyam and Kuchipudi to high-octane western hip-hop battles, live rock fusion, and thematic fine arts exhibitions.
              </p>

              {/* Tag Highlights */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['Classical Dance', 'Street Dance Battles', 'Light Vocal Solo', 'Battle of Bands', 'Live Canvas Painting', 'Stage Plays'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#090814]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/cultural"
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#FF2E93] to-[#E01C7B] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all text-center flex items-center justify-center"
              >
                ENTER CULTURAL EXPERIENCE
              </Link>

              <Link
                href="/register?category=cultural"
                className="py-3 px-4 rounded-xl bg-white border-2 border-[#FF2E93]/30 text-[#FF2E93] hover:bg-[#FFEBF4] text-xs font-black uppercase tracking-wider shadow-2xs hover:border-[#FF2E93] active:scale-95 transition-all text-center flex items-center justify-center shrink-0"
              >
                REGISTER CULTURAL
              </Link>
            </div>
          </motion.div>

          {/* Sports World Card */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            onClick={() => setActiveWorld('SPORTS')}
            className={`group relative rounded-3xl p-5 sm:p-10 transition-all duration-500 cursor-pointer overflow-hidden flex flex-col justify-between border-2 ${
              activeWorld === 'SPORTS'
                ? 'bg-gradient-to-br from-[#FFF0EB]/60 via-white to-white border-[#FF5E3A] shadow-2xl scale-[1.01]'
                : 'bg-white border-gray-200/80 hover:border-[#FF5E3A]/50 opacity-90'
            }`}
          >
            {/* Ambient Accent Light */}
            <div className="absolute top-0 right-0 w-80 h-80 rounded-full bg-[#FF5E3A]/10 blur-[80px] pointer-events-none" />

            <div>
              <div className="flex items-center justify-between mb-6">
                <span className="px-3 py-1 rounded-full bg-[#FFF0EB] text-[#FF5E3A] font-bold text-xs uppercase tracking-widest">
                  World 02 • Sports
                </span>
                <span className="text-xs font-extrabold text-[#717188]">DEC 28–29</span>
              </div>

              <h3 className="font-display font-black text-3xl sm:text-5xl text-[#090814] mb-4 leading-tight">
                POWER, SPEED & VICTORY
              </h3>

              <p className="text-sm sm:text-base text-[#525266] font-medium leading-relaxed mb-6">
                Full-throttle collegiate athleticism. Box & Turf Cricket, 7-A-Side Football, Hardcourt Basketball, Rapid Chess, Volleyball, and Shuttle Doubles.
              </p>

              {/* Tag Highlights */}
              <div className="flex flex-wrap gap-2 mb-8">
                {['Colorido Super League', '7v7 Football Cup', 'Slam Dunk Basketball', 'Badminton Doubles', 'Rapid Chess Open', 'Volleyball Cup'].map(
                  (tag) => (
                    <span
                      key={tag}
                      className="px-3 py-1 rounded-lg bg-white border border-gray-200 text-xs font-semibold text-[#090814]"
                    >
                      {tag}
                    </span>
                  )
                )}
              </div>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
              <Link
                href="/sports"
                className="flex-1 py-3 px-5 rounded-xl bg-gradient-to-r from-[#FF5E3A] to-[#E84925] text-white text-xs sm:text-sm font-black uppercase tracking-wider shadow-md hover:shadow-lg hover:brightness-105 active:scale-95 transition-all text-center flex items-center justify-center"
              >
                ENTER SPORTS ARENA
              </Link>

              <Link
                href="/register?category=sports"
                className="py-3 px-4 rounded-xl bg-white border-2 border-[#FF5E3A]/30 text-[#FF5E3A] hover:bg-[#FFF0EB] text-xs font-black uppercase tracking-wider shadow-2xs hover:border-[#FF5E3A] active:scale-95 transition-all text-center flex items-center justify-center shrink-0"
              >
                REGISTER SPORTS
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
