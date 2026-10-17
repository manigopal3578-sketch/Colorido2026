import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { CheckInRecord } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const eventIdFilter = url.searchParams.get('eventId');
    const gateIdFilter = url.searchParams.get('gateId');

    const db = await getDatabaseAsync();

    let relevantRegistrations = db.registrations;
    if (eventIdFilter && eventIdFilter !== 'ALL') {
      relevantRegistrations = relevantRegistrations.filter((r) => r.eventId === eventIdFilter);
    }

    const totalRegistered = relevantRegistrations.length;
    const checkedInToday = relevantRegistrations.filter((r) => r.checkInStatus === 'CHECKED_IN').length;
    const pendingEntry = Math.max(0, totalRegistered - checkedInToday);
    const checkInRate = totalRegistered > 0 ? Math.round((checkedInToday / totalRegistered) * 100) : 0;

    let relevantCheckIns = db.checkIns;
    if (gateIdFilter && gateIdFilter !== 'ALL') {
      relevantCheckIns = relevantCheckIns.filter((c) => c.gateId === gateIdFilter);
    }
    if (eventIdFilter && eventIdFilter !== 'ALL') {
      relevantCheckIns = relevantCheckIns.filter((c) => c.eventId === eventIdFilter);
    }

    // Gate distribution
    const gateDistribution: Record<string, number> = {};
    for (const g of db.gates || []) {
      gateDistribution[g.id] = db.checkIns.filter((c) => c.gateId === g.id).length;
    }

    return NextResponse.json({
      success: true,
      metrics: {
        totalRegistered,
        checkedInToday,
        pendingEntry,
        checkInRate,
        gateDistribution,
      },
      recentCheckIns: relevantCheckIns.slice(0, 40),
      gates: db.gates || [],
      events: db.events.map((e) => ({
        id: e.id,
        title: e.title,
        category: e.category,
        subcategory: e.subcategory,
        venueName: e.venueName,
        status: e.status,
      })),
    });
  } catch (error: any) {
    console.error('Checkin GET error:', error);
    return NextResponse.json({ success: false, message: 'Failed to fetch check-in data' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    // Allow check-in if staff session exists or fallback to authorized desk identifier
    const staffId = session ? session.organizerId : 'STAFF-DESK-01';
    const staffName = session ? session.name : 'Check-In Desk Staff';

    const body = await request.json();
    const {
      registrationId,
      qrPayload,
      mode = 'CAMERA_SCAN',
      eventIdFilter,
      gateId = 'gate-main',
      gateName = 'Main Gate',
    } = body;

    const db = await getDatabaseAsync();

    // Safely extract registration ID or ticket ID from string, JSON QR payload, or ticket URL
    const extractId = (input: string | undefined): string => {
      if (!input) return '';
      const trimmed = input.trim();
      if (trimmed.startsWith('{') && trimmed.endsWith('}')) {
        try {
          const parsed = JSON.parse(trimmed);
          return (parsed.regId || parsed.id || parsed.registrationId || parsed.tktId || '').trim().toUpperCase();
        } catch {}
      }
      if (trimmed.includes('/verify/')) {
        const parts = trimmed.split('/verify/');
        const afterVerify = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
        if (afterVerify) return afterVerify.toUpperCase();
      }
      if (trimmed.includes('/ticket/')) {
        const parts = trimmed.split('/ticket/');
        const afterTicket = parts[parts.length - 1].split('?')[0].split('#')[0].trim();
        if (afterTicket) return afterTicket.toUpperCase();
      }
      return trimmed.toUpperCase();
    };

    let targetRegId = extractId(registrationId) || extractId(qrPayload);

    // If targetRegId is a ticket ID (TKT-...), resolve to the associated registration ID
    if (targetRegId.startsWith('TKT-')) {
      const matchingTicket = db.tickets.find((t) => t.id.toUpperCase() === targetRegId);
      if (matchingTicket) {
        targetRegId = matchingTicket.registrationId.toUpperCase();
      }
    }

    if (!targetRegId) {
      return NextResponse.json(
        {
          success: false,
          code: 'INVALID_QR',
          message: 'Invalid QR payload or missing registration code. Please reposition the ticket or enter ID manually.',
        },
        { status: 400 }
      );
    }

    // Lookup registration by ID or ticket ID or Phone or Student ID
    const registration = db.registrations.find(
      (r) =>
        r.id.toUpperCase() === targetRegId ||
        r.ticketId?.toUpperCase() === targetRegId ||
        r.phone?.replace(/\D/g, '') === targetRegId.replace(/\D/g, '') ||
        r.studentId?.toUpperCase() === targetRegId
    );

    if (!registration) {
      return NextResponse.json(
        {
          success: false,
          code: 'REGISTRATION_NOT_FOUND',
          message: `No registration found matching: "${targetRegId}". Please verify the badge or search by phone/name.`,
        },
        { status: 404 }
      );
    }

    const event = db.events.find((e) => e.id === registration.eventId);

    if (registration.status === 'CANCELLED') {
      return NextResponse.json(
        {
          success: false,
          code: 'CANCELLED_REGISTRATION',
          message: `This registration was cancelled on ${registration.createdAt}. Access denied.`,
          participant: registration,
          event,
        },
        { status: 400 }
      );
    }

    if (eventIdFilter && eventIdFilter !== 'ALL' && registration.eventId !== eventIdFilter) {
      return NextResponse.json(
        {
          success: false,
          code: 'WRONG_EVENT',
          message: `Ticket is registered for "${event?.title || registration.eventId}", not the selected checkpoint event desk.`,
          participant: registration,
          event,
        },
        { status: 400 }
      );
    }

    if (registration.checkInStatus === 'CHECKED_IN') {
      const existingCheckIn = db.checkIns.find((c) => c.registrationId === registration.id);
      const ticket = db.tickets.find((t) => t.registrationId === registration.id);
      return NextResponse.json(
        {
          success: false,
          code: 'ALREADY_CHECKED_IN',
          message: `Participant was ALREADY checked in at ${new Date(
            registration.checkedInAt || ''
          ).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit', hour12: true })} by ${
            registration.checkedInBy || 'Staff'
          }${existingCheckIn?.gateName ? ` at ${existingCheckIn.gateName}` : ''}. No duplicate check-in created.`,
          participant: registration,
          event,
          ticket: ticket || null,
          checkIn: existingCheckIn,
        },
        { status: 409 }
      );
    }

    // Check if event is postponed
    if (event?.status === 'POSTPONED') {
      return NextResponse.json(
        {
          success: false,
          code: 'EVENT_POSTPONED',
          message: `This event has been officially postponed to ${event.date}. Entry pass is not active today.`,
          participant: registration,
          event,
        },
        { status: 400 }
      );
    }

    // Record verified check-in
    const checkInTime = new Date().toISOString();
    registration.checkInStatus = 'CHECKED_IN';
    registration.checkedInAt = checkInTime;
    registration.checkedInBy = staffName;

    // Update ticket
    const ticket = db.tickets.find((t) => t.registrationId === registration.id);
    if (ticket) {
      ticket.status = 'USED';
    }

    const assignedGate = (db.gates || []).find((g) => g.id === gateId);
    const resolvedGateName = assignedGate ? assignedGate.name : gateName;

    const checkInRecord: CheckInRecord = {
      id: `chk-${Date.now()}`,
      registrationId: registration.id,
      ticketId: registration.ticketId,
      eventId: registration.eventId,
      eventTitle: registration.eventTitle,
      participantName: registration.participantName,
      collegeName: registration.collegeName,
      collegeType: registration.collegeType,
      timestamp: checkInTime,
      staffId,
      staffName,
      gateId,
      gateName: resolvedGateName,
      mode: mode as any,
    };

    db.checkIns.unshift(checkInRecord);
    await saveDatabaseAsync(db);

    await addAuditLogAsync(
      staffName,
      'CHECK_IN_STAFF',
      'CHECK_IN_PROCESSED',
      registration.id,
      `Check-in verified for ${registration.participantName} (${registration.eventTitle}) via ${mode} at ${resolvedGateName}`
    );

    return NextResponse.json({
      success: true,
      code: 'VALID',
      message: 'Participant successfully checked in and entry authorized!',
      participant: registration,
      event,
      ticket: ticket || null,
      checkIn: checkInRecord,
    });
  } catch (error: any) {
    console.error('Checkin POST error:', error);
    return NextResponse.json(
      { success: false, message: 'Server check-in processing failed' },
      { status: 500 }
    );
  }
}
