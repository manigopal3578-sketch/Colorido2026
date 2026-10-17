'use client';

import React, { useState } from 'react';
import { VenueItem, EventItem } from '@/lib/types';
import { MapPin, Users, Compass, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface CampusVenuesProps {
  venues: VenueItem[];
  events: EventItem[];
}

export const CampusVenues: React.FC<CampusVenuesProps> = ({ venues, events }) => {
  const [selectedVenue, setSelectedVenue] = useState<VenueItem>(venues[0] || null);

  if (!venues || venues.length === 0) return null;

  const venueEvents = selectedVenue
    ? events.filter((e) => e.venueId === selectedVenue.id && e.status !== 'ARCHIVED' && e.status !== 'POSTPONED')
    : [];

  return (
    <section id="venues" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-40px' }}
          transition={{ duration: 0.5 }}
          className="text-center max-w-3xl mx-auto mb-8 sm:mb-14"
        >
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>RVRJC 37-Acre Campus Arena</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            CAMPUS VENUES
          </h2>
          <p className="text-xs sm:text-base text-[#525266] font-medium">
            Explore the arenas hosting COLORIDO 2K26 cultural spectacles and athletic tournaments.
          </p>
        </motion.div>

        {/* Venues Selector & Preview */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 sm:gap-8 items-start">
          {/* Venue List */}
          <div className="lg:col-span-5 space-y-2.5 sm:space-y-3">
            {venues.map((v, idx) => {
              const isSelected = selectedVenue?.id === v.id;
              return (
                <motion.button
                  key={v.id}
                  initial={{ opacity: 0, x: -15 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.35, delay: idx * 0.06 }}
                  onClick={() => setSelectedVenue(v)}
                  className={`w-full text-left p-3.5 sm:p-5 rounded-2xl border transition-all flex items-center justify-between ${
                    isSelected
                      ? 'bg-[#090814] text-white border-black shadow-lg scale-[1.01]'
                      : 'bg-[#FBFBFD] text-[#090814] border-gray-200 hover:border-gray-400'
                  }`}
                >
                  <div>
                    <span className={`text-[10px] font-black uppercase tracking-wider block mb-1 ${
                      isSelected ? 'text-[#FF2E93]' : 'text-[#5227FF]'
                    }`}>
                      {v.type} • {v.code}
                    </span>
                    <h4 className="font-display font-bold text-base sm:text-lg leading-snug">
                      {v.name}
                    </h4>
                    <span className={`text-xs block mt-1 ${isSelected ? 'text-gray-300' : 'text-[#525266]'}`}>
                      Capacity: {v.capacity.toLocaleString()} Attendees
                    </span>
                  </div>

                  <MapPin className={`w-5 h-5 shrink-0 ${isSelected ? 'text-[#00DCEB]' : 'text-gray-400'}`} />
                </motion.button>
              );
            })}
          </div>

          {/* Selected Venue Showcase */}
          {selectedVenue && (
            <AnimatePresence mode="wait">
              <motion.div
                key={selectedVenue.id}
                initial={{ opacity: 0, y: 15, scale: 0.98 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35 }}
                className="lg:col-span-7 bg-[#FBFBFD] rounded-3xl border border-gray-200 overflow-hidden shadow-xl p-4 sm:p-8 space-y-4 sm:space-y-6"
              >
                <div className="relative h-44 sm:h-64 w-full rounded-2xl overflow-hidden shadow-md group">
                  <motion.img
                    initial={{ scale: 1.05, opacity: 0.8 }}
                    animate={{ scale: 1, opacity: 1 }}
                    transition={{ duration: 0.5 }}
                    src={selectedVenue.image}
                    alt={selectedVenue.name}
                    loading="lazy"
                    onError={(e) => {
                      (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop';
                    }}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute top-4 left-4 px-3 py-1 rounded-full bg-black/60 backdrop-blur-md text-white text-xs font-bold">
                    {selectedVenue.type} ARENA
                  </div>
                </div>

                <div>
                  <h3 className="font-display font-black text-2xl sm:text-3xl text-[#090814] mb-2">
                    {selectedVenue.name}
                  </h3>
                  <p className="text-sm text-[#525266] leading-relaxed mb-4">
                    {selectedVenue.description}
                  </p>

                  <div className="flex items-center gap-2 text-xs font-semibold text-[#090814] bg-white p-3 rounded-xl border border-gray-200">
                    <Compass className="w-4 h-4 text-[#5227FF] shrink-0" />
                    <span>Directions: {selectedVenue.directions}</span>
                  </div>
                </div>

                {/* Events hosted here */}
                <div>
                  <h4 className="text-xs font-extrabold uppercase tracking-wider text-[#717188] mb-3">
                    Events Hosted at this Venue ({venueEvents.length})
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {venueEvents.map((evt) => (
                      <div
                        key={evt.id}
                        className="p-3 rounded-xl bg-white border border-gray-200 text-xs font-semibold text-[#090814] flex items-center justify-between"
                      >
                        <span className="truncate pr-2">{evt.title}</span>
                        <span className="text-[10px] font-bold text-[#5227FF] shrink-0">{evt.startTime}</span>
                      </div>
                    ))}
                    {venueEvents.length === 0 && (
                      <p className="text-xs text-[#717188]">No events scheduled currently.</p>
                    )}
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>
          )}
        </div>
      </div>
    </section>
  );
};
