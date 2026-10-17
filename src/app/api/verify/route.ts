import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const rawId = url.searchParams.get('id') || url.searchParams.get('token') || '';

    if (!rawId.trim()) {
      return NextResponse.json(
        { success: false, code: 'INVALID_TICKET', message: 'Missing ticket verification token or ID.' },
        { status: 400 }
      );
    }

    const extractId = (input: string): string => {
      const trimmed = input.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return (parsed.regId || parsed.id || parsed.registrationId || parsed.tktId || '').trim().toUpperCase();
        } catch {}
      }
      if (trimmed.includes('/verify/')) {
        const parts = trimmed.split('/verify/');
        const after = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
        if (after) return after.toUpperCase();
      }
      if (trimmed.includes('/ticket/')) {
        const parts = trimmed.split('/ticket/');
        const after = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
        if (after) return after.toUpperCase();
      }
      return trimmed.toUpperCase();
    };

    let targetId = extractId(rawId);
    const db = await getDatabaseAsync();

    // Map TKT- ticket ID to registration ID
    if (targetId.startsWith('TKT-')) {
      const matchingTicket = db.tickets.find((t) => t.id.toUpperCase() === targetId);
      if (matchingTicket) {
        targetId = matchingTicket.registrationId.toUpperCase();
      }
    }

    const registration = db.registrations.find(
      (r) =>
        r.id.toUpperCase() === targetId ||
        r.ticketId?.toUpperCase() === targetId
    );

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_TICKET',
          message: 'No official COLORIDO registration found matching this ticket identifier.',
        },
        { status: 404 }
      );
    }

    const event = db.events.find((e) => e.id === registration.eventId);
    const ticket = db.tickets.find((t) => t.registrationId === registration.id);

    if (registration.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          code: 'CANCELLED_REGISTRATION',
          message: 'This registration has been officially cancelled. Entry pass is invalid.',
          ticket: {
            id: ticket?.id || registration.ticketId || `TKT-${registration.id}`,
            registrationId: registration.id,
            participantName: registration.participantName,
            collegeName: registration.collegeName,
            eventTitle: event?.title || registration.eventTitle,
            category: registration.category,
            status: 'CANCELLED',
          },
        },
        { status: 400 }
      );
    }

    const isCheckedIn = registration.checkInStatus === 'CHECKED_IN';
    const status = isCheckedIn ? 'ALREADY_CHECKED_IN' : 'VALID';

    // Return safe public fields only
    return NextResponse.json({
      success: true,
      code: status,
      message: isCheckedIn
        ? 'Ticket verified. Participant is already checked in at the festival arena.'
        : 'Official Verified COLORIDO 2K26 Festival Ticket. Entry pass is active and valid.',
      ticket: {
        id: ticket?.id || registration.ticketId || `TKT-${registration.id}`,
        registrationId: registration.id,
        participantName: registration.participantName,
        collegeName: registration.collegeName,
        eventTitle: event?.title || registration.eventTitle,
        category: registration.category,
        date: event?.date || '28–29 December 2026',
        time: event?.startTime || '10:00 AM',
        venueName: event?.venueName || 'R.V.R. & J.C. College Campus',
        teamName: registration.teamName || undefined,
        status,
        checkedInAt: registration.checkedInAt || undefined,
      },
    });
  } catch (error: any) {
    console.error('Verify API error:', error);
    return NextResponse.json(
      { success: false, code: 'SERVER_ERROR', message: 'Internal verification service error.' },
      { status: 500 }
    );
  }
}
