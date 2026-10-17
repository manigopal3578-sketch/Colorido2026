import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ eventId: string }> }
) {
  try {
    const { eventId } = await params;
    const db = await getDatabaseAsync();

    const event = db.events.find((e) => e.id === eventId || e.slug === eventId);
    if (!event) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    const result = db.results?.find((r) => r.eventId === event.id) || {
      id: `res-${event.id}`,
      eventId: event.id,
      eventTitle: event.title,
      category: event.category,
      subcategory: event.subcategory,
      published: false,
      status: 'PENDING',
      notes: 'PENDING JURY DELIBERATION',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      event,
      result: {
        ...result,
        venueName: event.venueName,
        date: event.date,
        startTime: event.startTime,
        endTime: event.endTime,
        coverImage: event.coverImage,
        teamRequirement: event.teamRequirement,
        minTeamSize: event.minTeamSize,
        maxTeamSize: event.maxTeamSize,
      },
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch event result' },
      { status: 500 }
    );
  }
}
