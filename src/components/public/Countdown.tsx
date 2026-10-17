'use client';

import React, { useState, useEffect } from 'react';
import { Calendar, Clock, MapPin } from 'lucide-react';

interface CountdownProps {
  startDate?: string; // '2026-12-28'
  startTime?: string; // '09:00'
  endDate?: string;   // '2026-12-29'
  status?: string;
}

export const Countdown: React.FC<CountdownProps> = ({
  startDate = '2026-12-28',
  startTime = '09:00',
  endDate = '2026-12-29',
  status = 'UPCOMING',
}) => {
  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isLive: boolean;
    isPast: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isLive: false,
    isPast: false,
  });

  useEffect(() => {
    const calculateTime = () => {
      const now = new Date().getTime();
      // Target: Dec 28, 2026 at specified start time
      const targetStart = new Date(`${startDate}T${startTime}:00+05:30`).getTime();
      const targetEnd = new Date(`${endDate}T23:59:59+05:30`).getTime();

      if (now > targetEnd) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: false, isPast: true });
        return;
      }

      if (now >= targetStart && now <= targetEnd) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isPast: false });
        return;
      }

      const difference = targetStart - now;
      if (difference <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, isLive: true, isPast: false });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((difference % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((difference % (1000 * 60)) / 1000);

      setTimeLeft({ days, hours, minutes, seconds, isLive: false, isPast: false });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [startDate, startTime, endDate]);

  const units = [
    { label: 'DAYS', value: String(timeLeft.days).padStart(2, '0') },
    { label: 'HOURS', value: String(timeLeft.hours).padStart(2, '0') },
    { label: 'MINUTES', value: String(timeLeft.minutes).padStart(2, '0') },
    { label: 'SECONDS', value: String(timeLeft.seconds).padStart(2, '0') },
  ];

  return (
    <section id="countdown" className="py-12 px-4 sm:px-6 lg:px-8 bg-white border-y border-border">
      <div className="max-w-5xl mx-auto text-center">
        {/* State Banner */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-extrabold uppercase tracking-widest text-[#090814] mb-4">
          <Calendar className="w-3.5 h-3.5 text-[#5227FF]" />
          <span>
            {timeLeft.isPast
              ? 'COLORIDO 2K26 HAS CONCLUDED'
              : timeLeft.isLive || status === 'LIVE'
              ? 'COLORIDO 2K26 IS CURRENTLY LIVE!'
              : 'COUNTDOWN TO DAY 01 • 28 DECEMBER 2026'}
          </span>
        </div>

        <h3 className="font-display font-extrabold text-2xl sm:text-3xl text-[#090814] mb-2 tracking-tight">
          28–29 DECEMBER 2026
        </h3>

        <div className="flex items-center justify-center gap-2 text-xs sm:text-sm font-semibold text-[#525266] mb-8">
          <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
          <span>R.V.R. & J.C. College of Engineering, Guntur, AP</span>
        </div>

        {/* Live Numbers Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 sm:gap-6 max-w-3xl mx-auto">
          {units.map((unit) => (
            <div
              key={unit.label}
              className="p-5 sm:p-6 rounded-2xl bg-[#FBFBFD] border border-gray-200/90 shadow-sm flex flex-col items-center justify-center hover:border-gray-300 transition-colors"
            >
              <span className="font-display font-black text-4xl sm:text-6xl text-[#090814] tracking-tight">
                {unit.value}
              </span>
              <span className="text-[10px] sm:text-xs font-extrabold uppercase tracking-widest text-[#717188] mt-1">
                {unit.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
