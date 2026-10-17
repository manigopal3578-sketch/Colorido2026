import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';
import { generateRegistrationId } from '@/lib/utils';
import { RegistrationItem, TicketItem, ParticipantItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      eventId,
      fullName,
      email,
      phone,
      collegeType,
      collegeName,
      department,
      year,
      studentId,
      teamName,
      teamMembers,
      consent,
      accommodationRequired,
      accommodationType,
      accommodationDays,
      accommodationNotes,
    } = body;

    // Strict validation
    if (!eventId || !fullName || !email || !phone || !collegeType || !department || !year || !studentId) {
      return NextResponse.json(
        { success: false, message: 'All required registration fields must be provided.' },
        { status: 400 }
      );
    }

    if (!consent) {
      return NextResponse.json(
        { success: false, message: 'You must accept the festival participation guidelines and code of conduct.' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid email address.' },
        { status: 400 }
      );
    }

    const phoneRegex = /^[+]?[\d\s-]{10,15}$/;
    if (!phoneRegex.test(phone.replace(/\s+/g, ''))) {
      return NextResponse.json(
        { success: false, message: 'Please provide a valid 10-digit phone number.' },
        { status: 400 }
      );
    }

    const db = await getDatabaseAsync();
    const event = db.events.find((e) => e.id === eventId);

    if (!event) {
      return NextResponse.json(
        { success: false, message: 'The specified event was not found.' },
        { status: 404 }
      );
    }

    if (event.status === 'POSTPONED') {
      return NextResponse.json(
        { success: false, message: 'This event has been postponed. Registrations are not currently open.' },
        { status: 400 }
      );
    }

    if (event.status === 'COMPLETED' || event.status === 'ARCHIVED') {
      return NextResponse.json(
        { success: false, message: 'Registration for this event is closed.' },
        { status: 400 }
      );
    }

    // Check duplicate registration
    const existingRegistration = db.registrations.find(
      (r) =>
        r.eventId === eventId &&
        (r.email.toLowerCase() === email.toLowerCase() ||
          (r.studentId && r.studentId.toLowerCase() === studentId.toLowerCase())) &&
        r.status !== 'CANCELLED'
    );

    if (existingRegistration) {
      return NextResponse.json(
        {
          success: false,
          message: `You are already registered for ${event.title} with Registration ID ${existingRegistration.id}.`,
          registrationId: existingRegistration.id,
          ticketId: existingRegistration.ticketId,
        },
        { status: 409 }
      );
    }

    // Check team constraints
    if (event.teamRequirement === 'TEAM') {
      if (!teamName || teamName.trim().length === 0) {
        return NextResponse.json(
          { success: false, message: 'Team Name is required for this team championship event.' },
          { status: 400 }
        );
      }
      const memberCount = (teamMembers?.length || 0) + 1; // including leader
      if (memberCount < event.minTeamSize) {
        return NextResponse.json(
          {
            success: false,
            message: `Minimum required squad size for ${event.title} is ${event.minTeamSize} members. You provided ${memberCount}.`,
          },
          { status: 400 }
        );
      }
      if (memberCount > event.maxTeamSize) {
        return NextResponse.json(
          {
            success: false,
            message: `Maximum allowed squad size is ${event.maxTeamSize} members. You provided ${memberCount}.`,
          },
          { status: 400 }
        );
      }
    }

    // Capacity checking & waitlist
    const activeCount = db.registrations.filter(
      (r) => r.eventId === eventId && r.status === 'CONFIRMED'
    ).length;

    let registrationStatus: 'CONFIRMED' | 'WAITLIST' = 'CONFIRMED';
    if (activeCount >= event.capacity) {
      if (db.settings.waitlistEnabled) {
        registrationStatus = 'WAITLIST';
      } else {
        return NextResponse.json(
          { success: false, message: 'Registration for this event has reached full capacity.' },
          { status: 400 }
        );
      }
    }

    // Generate unique registration ID and ticket ID
    const regId = generateRegistrationId(event.category, event.subcategory);
    const ticketId = `TKT-${regId}`;

    const effectiveCollegeName =
      collegeType === 'RVRJC' ? 'R.V.R. & J.C. College of Engineering' : collegeName || 'Other College';

    // Verifiable QR payload (Official Public Verification URL)
    // Scannable by phone camera/Google Lens and decoded by Admin check-in scanner
    const qrPayload = `https://colorido.vercel.app/verify/${regId}`;

    // Find or create participant record to guarantee consistent participantId
    let participant = db.participants.find((p) => p.email.toLowerCase() === email.toLowerCase());
    const participantId = participant ? participant.id : `part-${Date.now()}`;

    const newRegistration: RegistrationItem = {
      id: regId,
      eventId: event.id,
      eventTitle: event.title,
      category: event.category,
      participantId,
      participantName: fullName.trim(),
      email: email.trim().toLowerCase(),
      phone: phone.trim(),
      collegeType: collegeType === 'RVRJC' ? 'RVRJC' : 'OTHER',
      collegeName: effectiveCollegeName,
      department: department.trim(),
      year: year.trim(),
      studentId: studentId.trim().toUpperCase(),
      teamName: teamName?.trim() || undefined,
      teamMembers: teamMembers || [],
      status: registrationStatus,
      checkInStatus: 'PENDING',
      ticketId,
      createdAt: new Date().toISOString(),
      accommodationRequired: Boolean(accommodationRequired),
      accommodationType: accommodationRequired ? (accommodationType || 'BOYS_HOSTEL') : undefined,
      accommodationDays: accommodationRequired ? (accommodationDays || '28–29 December (2 Days)') : undefined,
      accommodationNotes: accommodationNotes?.trim() || undefined,
    };

    const newTicket: TicketItem = {
      id: ticketId,
      registrationId: regId,
      eventId: event.id,
      eventTitle: event.title,
      category: event.category,
      participantName: fullName.trim(),
      collegeName: effectiveCollegeName,
      collegeType: collegeType === 'RVRJC' ? 'RVRJC' : 'OTHER',
      date: event.date,
      time: event.startTime,
      venueName: event.venueName,
      teamName: teamName?.trim() || undefined,
      status: 'VALID',
      qrPayload,
      generatedAt: new Date().toISOString(),
    };

    // Update or create participant in database
    if (participant) {
      if (!participant.registeredEventIds.includes(event.id)) {
        participant.registeredEventIds.push(event.id);
      }
    } else {
      participant = {
        id: participantId,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        phone: phone.trim(),
        collegeType: collegeType === 'RVRJC' ? 'RVRJC' : 'OTHER',
        collegeName: effectiveCollegeName,
        department: department.trim(),
        year: year.trim(),
        studentId: studentId.trim().toUpperCase(),
        registeredEventIds: [event.id],
        createdAt: new Date().toISOString(),
      };
      db.participants.push(participant);
    }

    db.registrations.push(newRegistration);
    db.tickets.push(newTicket);

    // Update event counter
    if (registrationStatus === 'CONFIRMED') {
      event.registeredCount = (event.registeredCount || 0) + 1;
    } else {
      event.waitlistCount = (event.waitlistCount || 0) + 1;
    }

    await saveDatabaseAsync(db);
    await addAuditLogAsync(
      fullName.trim(),
      'PARTICIPANT',
      'REGISTRATION_CREATED',
      regId,
      `Registered for ${event.title} (${registrationStatus})`
    );

    return NextResponse.json({
      success: true,
      registration: newRegistration,
      ticket: newTicket,
      message:
        registrationStatus === 'CONFIRMED'
          ? 'Registration successfully confirmed! Your official digital pass is ready.'
          : 'Event is currently at capacity. You have been placed on the priority waitlist.',
    });
  } catch (error: any) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { success: false, message: 'Server registration failed. Please try again.' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const email = searchParams.get('email')?.trim();
    const regId = searchParams.get('regId')?.trim();
    const phone = searchParams.get('phone')?.trim();

    const db = await getDatabaseAsync();

    // 1. Lookup by Registration ID
    if (regId) {
      const registration = db.registrations.find((r) => r.id.toUpperCase() === regId.toUpperCase());
      const ticket = db.tickets.find((t) => t.registrationId === regId.toUpperCase());
      if (!registration) {
        return NextResponse.json({ success: false, message: 'Registration not found' }, { status: 404 });
      }

      // Group all registrations belonging ONLY to this verified participant
      const userRegistrations = db.registrations.filter(
        (r) =>
          r.email.toLowerCase() === registration.email.toLowerCase() ||
          (registration.participantId && r.participantId === registration.participantId)
      );
      const userTickets = db.tickets.filter((t) =>
        userRegistrations.some((r) => r.ticketId === t.id)
      );

      return NextResponse.json({
        success: true,
        registration,
        ticket,
        registrations: userRegistrations,
        tickets: userTickets,
      });
    }

    // 2. Lookup by Email
    if (email) {
      const userRegistrations = db.registrations.filter(
        (r) => r.email.toLowerCase() === email.toLowerCase()
      );
      const userTickets = db.tickets.filter((t) =>
        userRegistrations.some((r) => r.ticketId === t.id)
      );
      return NextResponse.json({
        success: true,
        registrations: userRegistrations,
        tickets: userTickets,
      });
    }

    // 3. Lookup by Phone
    if (phone) {
      const cleanPhone = phone.replace(/\D/g, '');
      const userRegistrations = db.registrations.filter(
        (r) => r.phone.replace(/\D/g, '') === cleanPhone
      );
      const userTickets = db.tickets.filter((t) =>
        userRegistrations.some((r) => r.ticketId === t.id)
      );
      return NextResponse.json({
        success: true,
        registrations: userRegistrations,
        tickets: userTickets,
      });
    }

    // Default: strictly return only public aggregate count; NEVER leak registration records
    return NextResponse.json({
      success: true,
      totalRegistrations: db.registrations.length,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
