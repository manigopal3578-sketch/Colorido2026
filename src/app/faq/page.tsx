'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { Footer } from '@/components/public/Footer';
import { FaqSection } from '@/components/public/FaqSection';
import { FaqItem } from '@/lib/types';

export default function FaqPage() {
  const [faqs, setFaqs] = useState<FaqItem[]>([]);

  useEffect(() => {
    fetch('/api/data/public')
      .then((res) => res.json())
      .then((json) => {
        if (json.success) setFaqs(json.faqs || []);
      });
  }, []);

  return (
    <div className="min-h-screen flex flex-col bg-white">
      <Navbar />
      <main className="flex-1 py-8">
        <FaqSection faqs={faqs} />
      </main>
      <Footer />
    </div>
  );
}
