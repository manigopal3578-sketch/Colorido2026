import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { generateCsvContent } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'master-registrations';
    const eventId = searchParams.get('eventId');

    const db = await getDatabaseAsync();

    let filename = `COLORIDO_2K26_MASTER_REGISTRATIONS_${Date.now()}.csv`;
    let headers: string[] = [];
    let rows: (string | number)[][] = [];

    if (type === 'event-registrations' && eventId) {
      const event = db.events.find((e) => e.id === eventId);
      const filtered = db.registrations.filter((r) => r.eventId === eventId);
      const cleanTitle = event
        ? event.title.replace(/[\/\\?%*:|"<>]/g, '').trim()
        : eventId;
      filename = `${cleanTitle}.csv`;

      headers = [
        'Registration ID',
        'Participant Name',
        'Email',
        'Phone',
        'College Type',
        'College Name',
        'Department',
        'Year',
        'Student ID',
        'Team Name',
        'Accommodation Required',
        'Hostel Type',
        'Stay Duration',
        'Accommodation Notes',
        'Status',
        'Check-In Status',
        'Registered At',
      ];

      rows = filtered.map((r) => [
        r.id,
        r.participantName,
        r.email,
        r.phone,
        r.collegeType,
        r.collegeName,
        r.department,
        r.year,
        r.studentId,
        r.teamName || 'N/A',
        r.accommodationRequired ? 'YES' : 'NO',
        r.accommodationType === 'GIRLS_HOSTEL' ? 'Girls Hostel' : r.accommodationRequired ? 'Boys Hostel' : 'N/A',
        r.accommodationDays || 'N/A',
        r.accommodationNotes || '',
        r.status,
        r.checkInStatus,
        r.createdAt,
      ]);
    } else if (type === 'check-ins') {
      filename = `COLORIDO_2K26_CHECK_INS_${Date.now()}.csv`;
      headers = [
        'Check-In ID',
        'Registration ID',
        'Ticket ID',
        'Participant Name',
        'College Name',
        'College Type',
        'Event Title',
        'Check-In Time',
        'Staff Name',
        'Mode',
      ];
      rows = db.checkIns.map((c) => [
        c.id,
        c.registrationId,
        c.ticketId,
        c.participantName,
        c.collegeName,
        c.collegeType,
        c.eventTitle,
        c.timestamp,
        c.staffName,
        c.mode,
      ]);
    } else if (type === 'teams') {
      filename = `COLORIDO_2K26_TEAMS_${Date.now()}.csv`;
      headers = [
        'Registration ID',
        'Event Title',
        'Team Name',
        'Captain Name',
        'Captain Email',
        'Captain Phone',
        'College Name',
        'Members Count',
        'Status',
      ];
      const teamRegs = db.registrations.filter((r) => r.teamName);
      rows = teamRegs.map((r) => [
        r.id,
        r.eventTitle,
        r.teamName || '',
        r.participantName,
        r.email,
        r.phone,
        r.collegeName,
        (r.teamMembers?.length || 0) + 1,
        r.status,
      ]);
    } else if (type === 'accommodation') {
      filename = `COLORIDO_2K26_ACCOMMODATION_ROSTER_${Date.now()}.csv`;
      headers = [
        'Registration ID',
        'Participant Name',
        'Gender / Hostel Type',
        'Stay Duration',
        'Phone',
        'Email',
        'College Name',
        'College Type',
        'Event Title',
        'Special Requests / Notes',
        'Registration Date',
      ];
      const withAcc = db.registrations.filter((r) => r.accommodationRequired);
      rows = withAcc.map((r) => [
        r.id,
        r.participantName,
        r.accommodationType === 'GIRLS_HOSTEL' ? 'Girls Hostel (Block G)' : 'Boys Hostel (Block B)',
        r.accommodationDays || '28–29 December (2 Days)',
        r.phone,
        r.email,
        r.collegeName,
        r.collegeType,
        r.eventTitle,
        r.accommodationNotes || 'None',
        r.createdAt,
      ]);
    } else if (type === 'participants') {
      filename = `COLORIDO_2K26_PARTICIPANTS_${Date.now()}.csv`;
      headers = [
        'Participant ID',
        'Full Name',
        'Email',
        'Phone',
        'College Type',
        'College Name',
        'Department',
        'Year',
        'Student ID',
        'Registered Events Count',
        'Registered Event IDs',
        'Joined At',
      ];
      rows = db.participants.map((p) => [
        p.id,
        p.name,
        p.email,
        p.phone,
        p.collegeType,
        p.collegeName,
        p.department,
        p.year,
        p.studentId,
        p.registeredEventIds?.length || 0,
        (p.registeredEventIds || []).join('; '),
        p.createdAt,
      ]);
    } else if (type === 'attendance') {
      filename = `COLORIDO_2K26_ATTENDANCE_${Date.now()}.csv`;
      headers = [
        'Attendance ID',
        'Registration ID',
        'Ticket ID',
        'Participant Name',
        'College Name',
        'College Type',
        'Event Title',
        'Attendance Timestamp',
        'Verified By (Staff)',
        'Check-In Mode',
      ];
      rows = db.checkIns.map((c) => [
        c.id,
        c.registrationId,
        c.ticketId,
        c.participantName,
        c.collegeName,
        c.collegeType,
        c.eventTitle,
        c.timestamp,
        c.staffName,
        c.mode,
      ]);
    } else {
      // Master registrations
      headers = [
        'Registration ID',
        'Event ID',
        'Event Title',
        'Category',
        'Participant Name',
        'Email',
        'Phone',
        'College Type',
        'College Name',
        'Department',
        'Year',
        'Student ID',
        'Team Name',
        'Accommodation Required',
        'Hostel Type',
        'Stay Duration',
        'Accommodation Notes',
        'Status',
        'Check-In Status',
        'Checked In At',
        'Registered At',
      ];

      rows = db.registrations.map((r) => [
        r.id,
        r.eventId,
        r.eventTitle,
        r.category,
        r.participantName,
        r.email,
        r.phone,
        r.collegeType,
        r.collegeName,
        r.department,
        r.year,
        r.studentId,
        r.teamName || 'N/A',
        r.accommodationRequired ? 'YES' : 'NO',
        r.accommodationType === 'GIRLS_HOSTEL' ? 'Girls Hostel' : r.accommodationRequired ? 'Boys Hostel' : 'N/A',
        r.accommodationDays || 'N/A',
        r.accommodationNotes || '',
        r.status,
        r.checkInStatus,
        r.checkedInAt || 'Pending',
        r.createdAt,
      ]);
    }

    const csvContent = generateCsvContent(headers, rows);

    return new Response(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${filename}"`,
      },
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
