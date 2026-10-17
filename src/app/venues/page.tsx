'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { CampusVenues } from '@/components/public/CampusVenues';
import { VenueItem, EventItem } from '@/lib/types';

export default function VenuesPage() {
  const [venues, setVenues] = useState<VenueItem[]>([]);
  const [events, setEvents] = useState<EventItem[]>([]);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) {
          setVenues(json.venues || []);
          setEvents(json.events || []);
        }
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-8">
        <CampusVenues venues={venues} events={events} />
      </main>
      <Footer />
    </div>
  );
}
