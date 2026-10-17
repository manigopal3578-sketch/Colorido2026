import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const db = await getDatabaseAsync();

    // Calculate live operational metrics
    const totalEvents = db.events.length;
    const publishedEvents = db.events.filter((e) => e.status === 'PUBLISHED' || e.status === 'LIVE').length;
    const culturalEvents = db.events.filter((e) => e.category === 'cultural' && e.status !== 'ARCHIVED').length;
    const sportsEvents = db.events.filter((e) => e.category === 'sports' && e.status !== 'ARCHIVED').length;
    const confirmedRegistrations = db.registrations.filter((r) => r.status === 'CONFIRMED');
    const totalRegistrations = confirmedRegistrations.length;
    const rvrjcRegistrations = confirmedRegistrations.filter((r) => r.collegeType === 'RVRJC').length;
    const otherCollegeRegistrations = totalRegistrations - rvrjcRegistrations;
    const totalCheckIns = db.checkIns.length;
    const totalTeams = confirmedRegistrations.filter((r) => r.teamName).length;
    const uniqueParticipants = db.participants.length;

    return NextResponse.json({
      success: true,
      currentUser: session,
      metrics: {
        totalEvents,
        publishedEvents,
        culturalEvents,
        sportsEvents,
        totalRegistrations,
        rvrjcRegistrations,
        otherCollegeRegistrations,
        totalCheckIns,
        totalTeams,
        totalParticipants: uniqueParticipants,
        checkInRate: totalRegistrations > 0 ? Math.round((totalCheckIns / totalRegistrations) * 100) : 0,
      },
      settings: db.settings,
      homepageSections: db.homepageSections,
      draftHomepageConfig: db.draftHomepageConfig,
      publishedHomepageConfig: db.publishedHomepageConfig,
      events: db.events,
      venues: db.venues,
      coordinators: db.coordinators,
      organizers: db.organizers,
      participants: db.participants,
      registrations: db.registrations,
      tickets: db.tickets,
      checkIns: db.checkIns,
      announcements: db.announcements,
      faqs: db.faqs,
      speakersPerformers: db.speakersPerformers,
      sponsors: db.sponsors,
      auditLogs: db.auditLogs.slice(0, 100),
      versionHistory: db.versionHistory,
      systemHealth: db.systemHealth,
    });
  } catch (error: any) {
    console.error('State API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
