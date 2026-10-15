'use client';

import React from 'react';
import Link from 'next/link';
import { ArrowRight, Zap, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';

export const AboutSection: React.FC = () => {
  return (
    <section id="about" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 sm:gap-12 items-center">
          {/* Left Text Narrative */}
          <motion.div
            initial={{ opacity: 0, x: -25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55 }}
            className="lg:col-span-7 space-y-4 sm:space-y-6"
          >
            <h2 className="font-display font-black text-3xl sm:text-6xl text-[#090814] tracking-tight leading-none">
              MORE THAN A<br />
              <span className="bg-gradient-to-r from-[#5227FF] via-[#7B42F6] to-[#00DCEB] bg-clip-text text-transparent">
                FESTIVAL.
              </span>
            </h2>

            {/* Accent Border Callout Box */}
            <div className="p-4 sm:p-5 rounded-2xl bg-[#5227FF]/5 border-l-4 border-[#5227FF] text-[#090814] font-bold text-base sm:text-lg leading-snug">
              A collision of <span className="text-[#5227FF]">technology</span>,{' '}
              <span className="text-[#FF2E93]">culture</span>,{' '}
              <span className="text-[#FF5E3A]">competition</span>,{' '}
              <span className="text-[#00DCEB]">creativity</span> and{' '}
              <span className="text-[#FF8A00]">people</span>.
            </div>

            <p className="text-sm sm:text-base text-[#525266] leading-relaxed">
              Founded at R.V.R. & J.C. College of Engineering in Guntur, Andhra Pradesh, <strong>COLORIDO 2K26</strong> was conceived not as another college festival, but as an autonomous creative universe. Over exactly 48 hours, departmental boundaries dissolve to unite thousands of delegates from across the nation.
            </p>

            <p className="text-sm sm:text-base text-[#525266] leading-relaxed">
              From high-throughput machine learning hackathons and autonomous robotics to electric rock band warfare, floodlit athletic arenas, and live canvas artistry—COLORIDO empowers the new generation of creators, competitors, and visionaries.
            </p>

            {/* Feature Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#FF5E3A] font-extrabold text-sm">
                  <Zap className="w-4 h-4 fill-[#FF5E3A]" />
                  <span>Uncompromising Quality</span>
                </div>
                <p className="text-xs text-[#525266] leading-relaxed">
                  National standard arenas, verified adjudicators & transparent scoring.
                </p>
              </div>

              <div className="p-4 rounded-2xl bg-white border border-gray-200/90 shadow-sm space-y-1.5">
                <div className="flex items-center gap-2 text-[#FFC857] font-extrabold text-sm">
                  <ShieldCheck className="w-4 h-4 text-[#FF8A00]" />
                  <span>Radical Inclusion</span>
                </div>
                <p className="text-xs text-[#525266] leading-relaxed">
                  Free outstation hospitality, equal opportunity brackets & inter-college team formats.
                </p>
              </div>
            </div>

            <div className="pt-2">
              <Link
                href="/register"
                className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[#090814] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
              >
                <span>Experience COLORIDO 2K26</span>
                <ArrowRight className="w-4 h-4 text-[#FF2E93]" />
              </Link>
            </div>
          </motion.div>

          {/* Right Visual Card with Campus Image */}
          <motion.div
            initial={{ opacity: 0, x: 25 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true, margin: '-40px' }}
            transition={{ duration: 0.55, delay: 0.1 }}
            className="lg:col-span-5 relative"
          >
            <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white aspect-[4/5] bg-gray-100 group">
              <img
                src="/images/colorido-hero-bg.jpg"
                alt="R.V.R. & J.C. College of Engineering — COLORIDO 2K26 Campus Atmosphere"
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/20 to-transparent pointer-events-none" />

              <div className="absolute bottom-6 left-6 right-6 text-white space-y-1">
                <span className="text-[10px] sm:text-xs font-black uppercase tracking-widest text-[#00DCEB] block">
                  41 YEARS OF EXCELLENCE
                </span>
                <h4 className="font-display font-black text-xl sm:text-2xl leading-tight text-white">
                  R.V.R. & J.C. College of Engineering
                </h4>
                <p className="text-xs text-gray-300">
                  Guntur, Andhra Pradesh • Autonomous Institution
                </p>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
};
