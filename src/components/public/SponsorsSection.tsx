'use client';

import React from 'react';
import { SponsorItem } from '@/lib/types';
import { ShieldCheck, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';

interface SponsorsSectionProps {
  sponsors: SponsorItem[];
}

export const SponsorsSection: React.FC<SponsorsSectionProps> = ({ sponsors }) => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Official Patronage</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            FESTIVAL PARTNERS
          </h2>
          <p className="text-xs sm:text-sm text-[#525266] font-medium">
            Organizations fostering collegiate excellence and youth empowerment.
          </p>
        </motion.div>

        {sponsors && sponsors.length > 0 ? (
          <div className="flex flex-wrap items-center justify-center gap-3 sm:gap-6">
            {sponsors.map((spn, idx) => (
              <motion.a
                key={spn.id}
                href={spn.url}
                target="_blank"
                rel="noreferrer"
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-20px' }}
                transition={{ duration: 0.4, delay: idx * 0.08 }}
                className="p-3.5 sm:p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200 hover:border-black transition-all flex flex-col items-center justify-center min-w-[130px] sm:min-w-[200px] group shadow-sm hover:shadow-md"
              >
                <div className="h-16 w-32 flex items-center justify-center mb-3">
                  <img
                    src={spn.logo}
                    alt={spn.name}
                    className="max-h-full max-w-full object-contain grayscale group-hover:grayscale-0 transition-all"
                  />
                </div>
                <span className="text-xs font-bold text-[#090814] group-hover:text-[#5227FF] flex items-center gap-1">
                  <span>{spn.name}</span>
                  <ExternalLink className="w-3 h-3 opacity-0 group-hover:opacity-100 transition-opacity" />
                </span>
                <span className="text-[10px] font-black uppercase tracking-wider text-[#717188] mt-0.5">
                  {spn.tier} PARTNER
                </span>
              </motion.a>
            ))}
          </div>
        ) : (
          <div className="text-center py-10 bg-[#FBFBFD] rounded-2xl border border-gray-200 text-xs text-[#717188] max-w-md mx-auto">
            PARTNERS TO BE ANNOUNCED
          </div>
        )}
      </div>
    </section>
  );
};
