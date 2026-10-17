import { NextResponse } from 'next/server';
import { getDatabaseAsync, getLiveStatusEngine, defaultHeroConfig } from '@/lib/db';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
  try {
    const db = await getDatabaseAsync();

    // Only published events for public site
    const publishedEvents = db.events.filter(
      (e) => e.status !== 'DRAFT' && e.status !== 'ARCHIVED'
    );

    // Read from publishedHomepageConfig
    const publishedConfig = db.publishedHomepageConfig || {
      hero: defaultHeroConfig,
      sections: db.homepageSections,
      publishedAt: new Date().toISOString(),
      version: 1,
    };

    const enabledSections = (publishedConfig.sections || db.homepageSections)
      .filter((s) => s.enabled)
      .sort((a, b) => a.order - b.order);

    const liveEngine = getLiveStatusEngine();

    // Real database derived metrics
    const totalPublishedEvents = publishedEvents.filter((e) => e.status !== 'POSTPONED').length;
    const confirmedRegistrations = db.registrations.filter((r) => r.status === 'CONFIRMED');
    const totalRegistrations = confirmedRegistrations.length;
    const uniqueColleges = Array.from(new Set(confirmedRegistrations.map((r) => r.collegeName))).filter(Boolean).length;
    const culturalCount = publishedEvents.filter((e) => e.category === 'cultural').length;
    const sportsCount = publishedEvents.filter((e) => e.category === 'sports').length;

    const payload = {
      success: true,
      settings: db.settings,
      homepageConfig: publishedConfig.hero || defaultHeroConfig,
      homepageSections: enabledSections,
      publishedVersion: publishedConfig.version || 1,
      publishedAt: publishedConfig.publishedAt,
      events: publishedEvents,
      venues: db.venues,
      coordinators: db.coordinators,
      announcements: db.announcements.filter((a) => a.published),
      faqs: db.faqs.filter((f) => f.published).sort((a, b) => a.order - b.order),
      speakersPerformers: db.speakersPerformers.filter((s) => s.published),
      sponsors: db.sponsors.filter((s) => s.published).sort((a, b) => a.order - b.order),
      liveStatus: liveEngine,
      snapshot: {
        activeWorlds: 2,
        festivalDays: 2,
        dates: publishedConfig.hero?.datesText || '28–29 DECEMBER 2026',
        totalEvents: totalPublishedEvents,
        culturalEvents: culturalCount,
        sportsEvents: sportsCount,
        totalRegistrations,
        collegesRepresented: uniqueColleges || (totalRegistrations > 0 ? 1 : 0),
      },
    };

    return new NextResponse(JSON.stringify(payload), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
        'Pragma': 'no-cache',
        'Expires': '0',
        'CDN-Cache-Control': 'no-store',
        'Surrogate-Control': 'no-store',
      },
    });
  } catch (error: any) {
    console.error('Error fetching public festival data:', error);
    return NextResponse.json(
      { success: false, message: 'Failed to load festival data' },
      { status: 500 }
    );
  }
}
