'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Navbar } from '@/components/public/Navbar';
import { CinematicIntro } from '@/components/public/CinematicIntro';
import { DualWorldHero } from '@/components/public/DualWorldHero';
import { Countdown } from '@/components/public/Countdown';
import { LiveStatusBanner } from '@/components/public/LiveStatusBanner';
import { FestivalSnapshot } from '@/components/public/FestivalSnapshot';
import { TwoWorldsSplit } from '@/components/public/TwoWorldsSplit';
import { WorksWheel } from '@/components/public/WorksWheel';
import { FeaturedEvents } from '@/components/public/FeaturedEvents';
import { EventExplorer } from '@/components/public/EventExplorer';
import { ScheduleSection } from '@/components/public/ScheduleSection';
import { CampusVenues } from '@/components/public/CampusVenues';
import { OrganizingTeam } from '@/components/public/OrganizingTeam';
import { SpeakersPerformers } from '@/components/public/SpeakersPerformers';
import { SponsorsSection } from '@/components/public/SponsorsSection';
import { AnnouncementsSection } from '@/components/public/AnnouncementsSection';
import { AboutSection } from '@/components/public/AboutSection';
import { FaqSection } from '@/components/public/FaqSection';
import { FinalCta } from '@/components/public/FinalCta';
import { Footer } from '@/components/public/Footer';

import {
  initialSettings,
  initialHomepageSections,
  initialEvents,
  initialVenues,
  initialCoordinators,
  initialAnnouncements,
  initialFaqs,
  initialSpeakersPerformers,
  initialSponsors,
  defaultHeroConfig,
} from '@/lib/initialData';

const defaultData = {
  settings: initialSettings,
  homepageConfig: defaultHeroConfig,
  homepageSections: initialHomepageSections,
  events: initialEvents,
  venues: initialVenues,
  coordinators: initialCoordinators,
  announcements: initialAnnouncements,
  faqs: initialFaqs,
  speakersPerformers: initialSpeakersPerformers,
  sponsors: initialSponsors,
};

export default function HomePage() {
  const [data, setData] = useState<any>(defaultData);
  const [replayIntroKey, setReplayIntroKey] = useState<number>(0);
  const [introForceShow, setIntroForceShow] = useState(false);

  const fetchPublicData = useCallback(async () => {
    try {
      const res = await fetch(`/api/data/public?_t=${Date.now()}`, {
        cache: 'no-store',
      });
      const json = await res.json();
      if (json.success) {
        setData(json);
      }
    } catch (err) {
      console.error('Failed to load public festival data:', err);
    }
  }, []);

  const handleReplayIntro = () => {
    setIntroForceShow(true);
    setReplayIntroKey((k) => k + 1);
  };

  useEffect(() => {
    fetchPublicData();

    // Check if user came from a replay link across pages
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      if (params.get('replay') === 'true') {
        handleReplayIntro();
        window.history.replaceState({}, '', window.location.pathname);
      }
    }

    // Auto-refresh when tab gains focus to reflect newly published admin changes immediately
    const onVisibilityChange = () => {
      if (typeof document !== 'undefined' && document.visibilityState === 'visible') {
        fetchPublicData();
      }
    };
    const onFocus = () => fetchPublicData();

    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisibilityChange);

    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisibilityChange);
    };
  }, [fetchPublicData]);

  const settings = data?.settings;
  const heroConfig = data?.homepageConfig || defaultHeroConfig;
  const sections = data?.homepageSections || [];
  const events = data?.events || [];
  const venues = data?.venues || [];
  const coordinators = data?.coordinators || [];
  const announcements = data?.announcements || [];
  const faqs = data?.faqs || [];
  const speakers = data?.speakersPerformers || [];
  const sponsors = data?.sponsors || [];
  const liveStatus = data?.liveStatus;
  const snapshot = data?.snapshot;

  const isIntroEnabled = () => {
    const introSec = sections.find((s: any) => s.id === 'intro');
    return introSec ? introSec.enabled : true;
  };

  // Dynamic Section Renderer based on published configuration order
  const renderSection = (sectionId: string) => {
    switch (sectionId) {
      case 'hero':
        return <DualWorldHero key="hero" heroConfig={heroConfig} settings={settings} />;
      case 'countdown':
        return settings?.countdownVisible ? (
          <Countdown
            key="countdown"
            startDate={settings.startDate}
            startTime={settings.startTime}
            endDate={settings.endDate}
            status={settings.status}
          />
        ) : null;
      case 'live-status':
        return <LiveStatusBanner key="live-status" liveData={liveStatus} />;
      case 'festival-snapshot':
        return <FestivalSnapshot key="festival-snapshot" snapshot={snapshot} />;
      case 'two-worlds':
        return <TwoWorldsSplit key="two-worlds" />;
      case 'workswheel':
        return <WorksWheel key="workswheel" events={events} />;
      case 'featured-events':
        return <FeaturedEvents key="featured-events" events={events} />;
      case 'event-explorer':
        return (
          <EventExplorer
            key="event-explorer"
            events={events}
            showPostponedTechnicalCard={settings?.technicalCardVisible}
          />
        );
      case 'schedule':
        return <ScheduleSection key="schedule" events={events} />;
      case 'venue-experience':
        return <CampusVenues key="venue-experience" venues={venues} events={events} />;
      case 'organizing-team':
        return <OrganizingTeam key="organizing-team" coordinators={coordinators} />;
      case 'speakers-performers':
        return <SpeakersPerformers key="speakers-performers" items={speakers} />;
      case 'sponsors':
        return <SponsorsSection key="sponsors" sponsors={sponsors} />;
      case 'announcements':
        return <AnnouncementsSection key="announcements" announcements={announcements} />;
      case 'about':
      case 'about-festival':
        return <AboutSection key="about" />;
      case 'faq':
        return <FaqSection key="faq" faqs={faqs} />;
      case 'final-cta':
        return <FinalCta key="final-cta" />;
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white">
      {/* 01: Cinematic Intro */}
      {isIntroEnabled() && (
        <CinematicIntro
          key={replayIntroKey}
          forceShow={introForceShow}
          onComplete={() => setIntroForceShow(false)}
        />
      )}

      {/* Navbar with 3-dot drawer & Live indicator */}
      <Navbar
        onReplayIntro={handleReplayIntro}
        festivalStatus={settings?.status}
      />

      <main className="flex-1">
        {/* Render all enabled sections in the exact order published by Homepage Manager */}
        {sections.map((sec: any) => {
          if (!sec.enabled) return null;
          return renderSection(sec.id);
        })}
      </main>

      {/* Official Footer */}
      <Footer />
    </div>
  );
}
