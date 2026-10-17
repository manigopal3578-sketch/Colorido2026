'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { OrganizingTeam } from '@/components/public/OrganizingTeam';
import { CoordinatorItem } from '@/lib/types';

export default function TeamPage() {
  const [coordinators, setCoordinators] = useState<CoordinatorItem[]>([]);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setCoordinators(json.coordinators || []);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-8">
        <OrganizingTeam coordinators={coordinators} />
      </main>
      <Footer />
    </div>
  );
}
