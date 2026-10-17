'use client';

import React from 'react';
import { SpeakerPerformerItem } from '@/lib/types';
import { Mic, Calendar, MapPin, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

interface SpeakersPerformersProps {
  items: SpeakerPerformerItem[];
}

export const SpeakersPerformers: React.FC<SpeakersPerformersProps> = ({ items }) => {
  return (
    <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border overflow-hidden">
      <div className="max-w-6xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-2xl mx-auto mb-8 sm:mb-12"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3 shadow-sm">
            <Mic className="w-3.5 h-3.5" />
            <span>Special Guests</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            PERFORMERS & SPEAKERS
          </h2>
          <p className="text-xs sm:text-sm text-[#525266] font-medium">
            Renowned artists and dignitaries gracing the COLORIDO 2K26 grand stage.
          </p>
        </motion.div>

        {items && items.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {items.map((spk, idx) => (
              <motion.div
                key={spk.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-30px' }}
                transition={{ duration: 0.45, delay: idx * 0.1 }}
                className="rounded-3xl bg-white border border-gray-200 shadow-sm overflow-hidden flex flex-col justify-between hover:shadow-lg transition-all"
              >
                <div className="relative h-48 sm:h-64 w-full">
                  <img src={spk.photo} alt={spk.name} className="w-full h-full object-cover" />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-[10px] font-black uppercase tracking-wider">
                    {spk.type}
                  </div>
                </div>

                <div className="p-4 sm:p-6">
                  <span className="text-xs font-extrabold uppercase tracking-wider text-[#FF2E93] block mb-1">
                    {spk.sessionTitle}
                  </span>
                  <h3 className="font-display font-bold text-xl text-[#090814] mb-1">
                    {spk.name}
                  </h3>
                  <p className="text-xs font-semibold text-[#717188] mb-3">{spk.role}</p>
                  <p className="text-xs text-[#525266] leading-relaxed mb-4">{spk.bio}</p>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs text-[#525266]">
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5 text-[#5227FF]" />
                      {spk.date}
                    </span>
                    <span className="flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
                      {spk.venue}
                    </span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12 bg-white rounded-2xl border border-gray-200 max-w-lg mx-auto">
            <Sparkles className="w-8 h-8 text-gray-400 mx-auto mb-2" />
            <h4 className="font-display font-bold text-base text-[#090814]">
              GUEST ARTISTS TO BE ANNOUNCED
            </h4>
            <p className="text-xs text-[#717188] mt-1">
              Celebrity performers and distinguished keynote speakers will be revealed in upcoming bulletins.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};
