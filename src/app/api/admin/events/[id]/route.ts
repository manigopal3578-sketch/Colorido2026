import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { calculateEventStats } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { id } = params;
    const db = await getDatabaseAsync();
    const event = db.events.find((e) => e.id === id || e.slug === id);

    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const stats = calculateEventStats(event.id, db);
    const registrations = db.registrations.filter((r) => r.eventId === event.id);
    const checkIns = db.checkIns.filter((c) => c.eventId === event.id);
    const venue = db.venues.find((v) => v.id === event.venueId);

    return NextResponse.json({
      success: true,
      event,
      venue,
      stats,
      registrations,
      checkIns,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
