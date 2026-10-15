'use client';

import React from 'react';
import { AnnouncementItem } from '@/lib/types';
import { Bell, AlertTriangle, Info, Clock, Pin } from 'lucide-react';

interface AnnouncementsSectionProps {
  announcements: AnnouncementItem[];
}

export const AnnouncementsSection: React.FC<AnnouncementsSectionProps> = ({ announcements }) => {
  if (!announcements || announcements.length === 0) return null;

  return (
    <section id="announcements" className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 bg-white border-b border-border">
      <div className="max-w-5xl mx-auto">
        <div className="text-center max-w-2xl mx-auto mb-8 sm:mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#F5F5FA] border border-gray-200 text-xs font-bold uppercase tracking-widest text-[#5227FF] mb-3">
            <Bell className="w-3.5 h-3.5" />
            <span>Official Dispatches</span>
          </div>
          <h2 className="font-display font-black text-3xl sm:text-5xl text-[#090814] tracking-tight mb-2">
            LIVE BULLETIN
          </h2>
          <p className="text-xs sm:text-sm text-[#525266] font-medium">
            Real-time administrative announcements, schedule revisions, and tournament notices.
          </p>
        </div>

        <div className="space-y-3 sm:space-y-4">
          {announcements.map((item) => {
            const isAlert = item.type === 'ALERT';
            const isImportant = item.type === 'IMPORTANT';
            const isDeadline = item.type === 'DEADLINE';

            return (
              <div
                key={item.id}
                className={`p-4 sm:p-6 rounded-2xl border transition-all ${
                  isAlert
                    ? 'bg-red-50/50 border-red-200'
                    : isImportant
                    ? 'bg-amber-50/50 border-amber-200'
                    : 'bg-[#FBFBFD] border-gray-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
                  <div className="flex items-center gap-2">
                    {item.pinned && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-red-600 bg-red-100 px-2 py-0.5 rounded">
                        <Pin className="w-3 h-3" /> PINNED
                      </span>
                    )}
                    <span
                      className={`px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${
                        isAlert
                          ? 'bg-red-600 text-white'
                          : isImportant
                          ? 'bg-amber-600 text-white'
                          : isDeadline
                          ? 'bg-purple-600 text-white'
                          : 'bg-[#5227FF] text-white'
                      }`}
                    >
                      {item.type}
                    </span>
                    <span className="text-xs text-[#717188] font-semibold">{item.date}</span>
                  </div>
                </div>

                <h3 className="font-display font-bold text-lg text-[#090814] mb-2 leading-snug">
                  {item.title}
                </h3>
                <p className="text-sm text-[#525266] leading-relaxed font-medium">
                  {item.content}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
