'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { ScheduleSection } from '@/components/public/ScheduleSection';
import { EventItem } from '@/lib/types';

export default function SchedulePage() {
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setEvents(json.events || []);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-8">
        <ScheduleSection events={events} />
      </main>
      <Footer />
    </div>
  );
}
