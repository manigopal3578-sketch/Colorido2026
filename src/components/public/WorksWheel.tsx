'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { EventItem } from '@/lib/types';
import { ArrowLeft, ArrowRight, Calendar, MapPin, Users, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface WorksWheelProps {
  events: EventItem[];
}

export const WorksWheel: React.FC<WorksWheelProps> = ({ events }) => {
  const activeEvents = events.filter((e) => e.status !== 'ARCHIVED' && e.status !== 'POSTPONED');
  const [currentIndex, setCurrentIndex] = useState(0);

  if (activeEvents.length === 0) return null;

  const handleNext = () => {
    setCurrentIndex((prev) => (prev + 1) % activeEvents.length);
  };

  const handlePrev = () => {
    setCurrentIndex((prev) => (prev - 1 + activeEvents.length) % activeEvents.length);
  };

  const currentEvent = activeEvents[currentIndex];

  return (
    <section className="py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border overflow-hidden">
      <div className="max-w-7xl mx-auto">
        {/* Section Header */}
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-6 mb-12">
          <div>
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-extrabold uppercase tracking-widest text-[#5227FF] mb-3">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Signature Experiences</span>
            </div>
            <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight">
              COLORIDO EXPERIENCES
            </h2>
            <p className="text-sm sm:text-base text-[#525266] font-medium mt-1">
              Interactive 3D carousel of flagship cultural stages and sports championships.
            </p>
          </div>

          {/* Navigation Arrows */}
          <div className="flex items-center gap-2">
            <button
              onClick={handlePrev}
              aria-label="Previous Event"
              className="p-3 rounded-full border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              aria-label="Next Event"
              className="p-3 rounded-full border border-gray-200 hover:border-black hover:bg-black hover:text-white transition-all shadow-sm"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* 3D Wheel Showcase */}
        <div className="relative">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
            {/* Visual Cover Stage with Depth */}
            <div className="lg:col-span-7 relative h-[380px] sm:h-[460px] w-full rounded-3xl overflow-hidden shadow-2xl border border-gray-200 group">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent.id}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 1.05 }}
                  transition={{ duration: 0.5, ease: 'easeInOut' }}
                  className="relative w-full h-full"
                >
                  <img
                    src={currentEvent.coverImage}
                    alt={currentEvent.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Category Pill on Image */}
                  <div className="absolute top-6 left-6 z-10">
                    <span
                      className={`px-3.5 py-1.5 rounded-full text-xs font-extrabold uppercase tracking-widest text-white shadow-md ${
                        currentEvent.category === 'cultural' ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                      }`}
                    >
                      {currentEvent.category.toUpperCase()} • {currentEvent.subcategory}
                    </span>
                  </div>

                  <div className="absolute bottom-6 left-6 right-6 z-10 text-white">
                    <h3 className="font-display font-black text-2xl sm:text-3xl leading-tight mb-2">
                      {currentEvent.title}
                    </h3>
                    <div className="flex flex-wrap items-center gap-4 text-xs font-semibold text-gray-200">
                      <span className="flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-[#00DCEB]" />
                        {currentEvent.date}
                      </span>
                      <span className="flex items-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-[#FFC857]" />
                        {currentEvent.venueName}
                      </span>
                    </div>
                  </div>
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Details Panel */}
            <div className="lg:col-span-5 flex flex-col justify-between h-full space-y-6">
              <AnimatePresence mode="wait">
                <motion.div
                  key={currentEvent.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: -20 }}
                  transition={{ duration: 0.4 }}
                  className="space-y-4"
                >
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-extrabold text-[#5227FF] uppercase tracking-wider">
                      Event {currentIndex + 1} of {activeEvents.length}
                    </span>
                    <span className="text-gray-300">•</span>
                    <span className="text-xs font-semibold text-[#525266]">
                      {currentEvent.teamRequirement === 'TEAM'
                        ? `Squad (${currentEvent.minTeamSize}-${currentEvent.maxTeamSize} members)`
                        : 'Individual Participation'}
                    </span>
                  </div>

                  <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#090814] leading-snug">
                    {currentEvent.title}
                  </h3>

                  <p className="text-sm text-[#525266] leading-relaxed line-clamp-4">
                    {currentEvent.description}
                  </p>

                  <div className="p-4 rounded-2xl bg-[#FBFBFD] border border-gray-200 space-y-2">
                    <div className="flex items-center justify-between text-xs font-semibold text-[#090814]">
                      <span>Venue</span>
                      <span className="font-bold text-[#5227FF]">{currentEvent.venueName}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#090814]">
                      <span>Date & Time</span>
                      <span className="font-bold">{currentEvent.date} • {currentEvent.startTime}</span>
                    </div>
                    <div className="flex items-center justify-between text-xs font-semibold text-[#090814]">
                      <span>Capacity Status</span>
                      <span className="font-bold text-green-700">
                        {currentEvent.registeredCount} / {currentEvent.capacity} Filled
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 pt-2">
                    <Link
                      href={`/events/${currentEvent.slug}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 py-3 px-6 rounded-xl bg-[#090814] hover:bg-black text-white text-xs sm:text-sm font-bold shadow-md hover:shadow-lg transition-all"
                    >
                      <span>Event Details</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </Link>

                    <Link
                      href={`/register?eventId=${currentEvent.id}`}
                      className={`py-3 px-6 rounded-xl text-white text-xs sm:text-sm font-bold shadow-md hover:opacity-90 transition-all ${
                        currentEvent.category === 'cultural' ? 'bg-[#FF2E93]' : 'bg-[#FF5E3A]'
                      }`}
                    >
                      Register Now
                    </Link>
                  </div>
                </motion.div>
              </AnimatePresence>

              {/* Thumbnail Strip */}
              <div className="flex items-center gap-2 overflow-x-auto pb-2 pt-4">
                {activeEvents.map((evt, idx) => (
                  <button
                    key={evt.id}
                    onClick={() => setCurrentIndex(idx)}
                    className={`relative w-16 h-12 rounded-lg overflow-hidden shrink-0 border-2 transition-all ${
                      idx === currentIndex
                        ? 'border-[#5227FF] scale-105 shadow-md'
                        : 'border-transparent opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img
                      src={evt.coverImage}
                      alt={evt.title}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
