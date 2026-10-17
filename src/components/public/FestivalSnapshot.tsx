'use client';

import React, { useEffect, useState, useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Layers, Calendar, Award, Building, Sparkles } from 'lucide-react';

interface FestivalSnapshotProps {
  snapshot?: {
    activeWorlds: number;
    festivalDays: number;
    dates: string;
    totalEvents: number;
    culturalEvents: number;
    sportsEvents: number;
    totalRegistrations: number;
    collegesRepresented: number;
  };
}

function CountUpNumber({ target, pad = 2 }: { target: number; pad?: number }) {
  const [current, setCurrent] = useState(0);
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true, margin: '-40px' });

  useEffect(() => {
    if (!isInView) return;
    let start = 0;
    const duration = 1200; // ms
    const steps = 30;
    const stepTime = duration / steps;
    const increment = Math.max(1, target / steps);

    const timer = setInterval(() => {
      start += increment;
      if (start >= target) {
        setCurrent(target);
        clearInterval(timer);
      } else {
        setCurrent(Math.floor(start));
      }
    }, stepTime);

    return () => clearInterval(timer);
  }, [isInView, target]);

  return <span ref={ref}>{String(current).padStart(pad, '0')}</span>;
}

export const FestivalSnapshot: React.FC<FestivalSnapshotProps> = ({ snapshot }) => {
  const data = snapshot || {
    activeWorlds: 2,
    festivalDays: 2,
    dates: '28–29 DECEMBER 2026',
    totalEvents: 10,
    culturalEvents: 5,
    sportsEvents: 5,
    totalRegistrations: 2,
    collegesRepresented: 2,
  };

  const cards = [
    {
      label: 'ACTIVE WORLDS',
      num: 2,
      detail: 'Cultural + Sports',
      icon: Layers,
      accent: 'text-[#FF2E93]',
      bg: 'bg-[#FFEBF4]',
    },
    {
      label: 'FESTIVAL DAYS',
      num: 2,
      detail: '28–29 December 2026',
      icon: Calendar,
      accent: 'text-[#5227FF]',
      bg: 'bg-primary-light',
    },
    {
      label: 'CHAMPIONSHIPS',
      num: data.totalEvents || 10,
      detail: `${data.culturalEvents || 5} Cultural • ${data.sportsEvents || 5} Sports`,
      icon: Award,
      accent: 'text-[#FF5E3A]',
      bg: 'bg-[#FFF0EB]',
    },
    {
      label: 'COLLEGES JOINING',
      num: data.collegesRepresented || 2,
      detail: 'RVRJC & Other Colleges',
      icon: Building,
      accent: 'text-[#00DCEB]',
      bg: 'bg-cyanAccent-light',
    },
  ];

  return (
    <section className="py-10 sm:py-16 px-4 sm:px-6 lg:px-8 bg-white overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center mb-6 sm:mb-10"
        >
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#F5F5FA] text-xs font-bold uppercase tracking-widest text-[#525266] mb-3">
            <Sparkles className="w-3.5 h-3.5 text-[#5227FF]" />
            <span>Festival Scope</span>
          </div>
          <h3 className="font-display font-black text-2xl sm:text-4xl text-[#090814] tracking-tight">
            FESTIVAL SNAPSHOT
          </h3>
          <p className="text-xs sm:text-sm text-[#525266] font-medium mt-1">
            Verified operational statistics from the COLORIDO 2K26 central database.
          </p>
        </motion.div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-6">
          {cards.map((c, i) => {
            const Icon = c.icon;
            return (
              <motion.div
                key={c.label}
                initial={{ opacity: 0, y: 22 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: i * 0.1 }}
                className="p-3.5 sm:p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200/90 shadow-sm hover:border-gray-300 transition-all flex flex-col justify-between"
              >
                <div className="flex items-center justify-between mb-3 sm:mb-4">
                  <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#717188]">
                    {c.label}
                  </span>
                  <div className={`p-1.5 sm:p-2 rounded-xl ${c.bg}`}>
                    <Icon className={`w-3.5 h-3.5 sm:w-4 sm:h-4 ${c.accent}`} />
                  </div>
                </div>

                <div>
                  <span className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight block mb-0.5 sm:mb-1">
                    <CountUpNumber target={c.num} />
                  </span>
                  <span className="text-[11px] sm:text-xs font-semibold text-[#525266] block">
                    {c.detail}
                  </span>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
