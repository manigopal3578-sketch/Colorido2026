'use client';

import React from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { AboutSection } from '@/components/public/AboutSection';

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-8">
        <AboutSection />
      </main>
      <Footer />
    </div>
  );
}
