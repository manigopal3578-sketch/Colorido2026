'use client';

import React from 'react';
import Link from 'next/link';
import { Radio, Clock, MapPin, AlertTriangle, ArrowRight } from 'lucide-react';

interface LiveStatusProps {
  liveData?: {
    festivalStatus: string;
    emergencyNotice: string | null;
    now: {
      id: string;
      title: string;
      category: string;
      venue: string;
      startTime: string;
      endTime: string;
      date: string;
      status: string;
    } | null;
    next: {
      id: string;
      title: string;
      category: string;
      venue: string;
      startTime: string;
      endTime: string;
      date: string;
    } | null;
    later: {
      id: string;
      title: string;
      category: string;
      venue: string;
      time: string;
    }[];
  };
}

export const LiveStatusBanner: React.FC<LiveStatusProps> = ({ liveData }) => {
  if (!liveData) return null;

  return (
    <section id="live-status" className="py-12 px-4 sm:px-6 lg:px-8 bg-[#FBFBFD] border-b border-border">
      <div className="max-w-6xl mx-auto">
        {/* Emergency Notice if activated by Admin */}
        {liveData.emergencyNotice && (
          <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 flex items-start gap-3 text-red-900">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-xs uppercase tracking-wider text-red-700">Official Notice:</span>
              <p className="text-sm font-semibold">{liveData.emergencyNotice}</p>
            </div>
          </div>
        )}

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-ping" />
            <h3 className="font-display font-black text-xl sm:text-2xl text-[#090814] tracking-tight">
              COLORIDO LIVE PULSE
            </h3>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-gray-200 text-gray-800">
              {liveData.festivalStatus}
            </span>
          </div>

          <Link
            href="/schedule"
            className="text-xs font-bold text-[#5227FF] hover:underline inline-flex items-center gap-1"
          >
            <span>Full 2-Day Schedule</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {/* NOW / NEXT / LATER Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* NOW */}
          <div className="p-5 rounded-2xl bg-white border-2 border-red-200 shadow-sm flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 px-3 py-1 bg-red-500 text-white text-[10px] font-black uppercase tracking-widest rounded-bl-xl">
              NOW LIVE
            </div>
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-red-600 mb-2 block">
                Current Arena Activity
              </span>
              <h4 className="font-display font-bold text-lg text-[#090814] mb-2 leading-snug">
                {liveData.now ? liveData.now.title : 'NO EVENT LIVE RIGHT NOW'}
              </h4>
            </div>

            {liveData.now && (
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-[#525266]">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#5227FF]" />
                  <span>{liveData.now.venue}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#5227FF]" />
                  <span>{liveData.now.startTime} – {liveData.now.endTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* NEXT UP */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#5227FF] mb-2 block">
                NEXT UP
              </span>
              <h4 className="font-display font-bold text-lg text-[#090814] mb-2 leading-snug">
                {liveData.next ? liveData.next.title : 'TO BE ANNOUNCED'}
              </h4>
            </div>

            {liveData.next && (
              <div className="pt-3 border-t border-gray-100 space-y-1.5 text-xs text-[#525266]">
                <div className="flex items-center gap-1.5 font-medium">
                  <MapPin className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>{liveData.next.venue}</span>
                </div>
                <div className="flex items-center gap-1.5 font-medium">
                  <Clock className="w-3.5 h-3.5 text-[#FF2E93]" />
                  <span>{liveData.next.startTime} – {liveData.next.endTime}</span>
                </div>
              </div>
            )}
          </div>

          {/* LATER */}
          <div className="p-5 rounded-2xl bg-white border border-gray-200 shadow-sm flex flex-col justify-between">
            <div>
              <span className="text-[11px] font-extrabold uppercase tracking-wider text-[#525266] mb-2 block">
                LATER TODAY
              </span>
              <div className="space-y-2">
                {liveData.later && liveData.later.length > 0 ? (
                  liveData.later.slice(0, 3).map((item) => (
                    <div key={item.id} className="text-xs">
                      <p className="font-bold text-[#090814] truncate">{item.title}</p>
                      <p className="text-[11px] text-[#717188]">{item.venue} • {item.time}</p>
                    </div>
                  ))
                ) : (
                  <p className="text-xs text-[#717188]">Schedule lineup confirmed in official roster.</p>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};
