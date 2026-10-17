import { NextResponse } from 'next/server';
import {
  getDatabaseAsync,
  saveDatabaseAsync,
  addAuditLogAsync,
  detectScheduleConflicts,
} from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { EventItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, eventData, eventId } = body;
    const db = await getDatabaseAsync();

    if (action === 'CREATE') {
      const {
        title,
        category,
        subcategory,
        description,
        rules,
        eligibility,
        date,
        startTime,
        endTime,
        venueId,
        capacity,
        teamRequirement,
        minTeamSize,
        maxTeamSize,
        coordinatorName,
        coordinatorPhone,
        coordinatorEmail,
        coverImage,
        featured,
        status = 'PUBLISHED',
      } = eventData;

      if (!title || !category || !date || !startTime || !endTime || !venueId) {
        return NextResponse.json(
          { success: false, message: 'Title, category, date, start time, end time, and venue are mandatory.' },
          { status: 400 }
        );
      }

      const venue = db.venues.find((v) => v.id === venueId);
      const venueName = venue ? venue.name : 'Campus Venue';

      // Check conflicts
      const conflicts = detectScheduleConflicts(
        'new-event',
        venueId,
        date,
        startTime,
        endTime,
        coordinatorName
      );

      const newId = `evt-${category.substring(0, 4)}-${Date.now().toString(36)}`;
      const slug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '');

      const newEvent: EventItem = {
        id: newId,
        slug: `${slug}-${newId.slice(-4)}`,
        title,
        category,
        subcategory: subcategory || 'General',
        description: description || '',
        rules: Array.isArray(rules) ? rules : ['Standard festival regulations apply.'],
        eligibility: eligibility || 'Open to all bonafide college students.',
        date,
        startTime,
        endTime,
        venueId,
        venueName,
        capacity: Number(capacity) || 50,
        registeredCount: 0,
        status,
        teamRequirement: teamRequirement || 'INDIVIDUAL',
        minTeamSize: Number(minTeamSize) || 1,
        maxTeamSize: Number(maxTeamSize) || 1,
        coordinatorName: coordinatorName || 'Faculty Coordinator',
        coordinatorPhone: coordinatorPhone || '+91 863 2288201',
        coordinatorEmail: coordinatorEmail || 'colorido@rvrjcce.ac.in',
        coverImage:
          coverImage ||
          (category === 'cultural'
            ? 'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop'
            : 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop'),
        galleryImages: [],
        featured: Boolean(featured),
        waitlistCount: 0,
        tags: [category.toUpperCase()],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.events.push(newEvent);
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EVENT_CREATED', newId, `Created event: ${title}`);

      return NextResponse.json({
        success: true,
        event: newEvent,
        conflicts: conflicts.length > 0 ? conflicts : undefined,
      });
    }

    if (action === 'DUPLICATE' && eventId) {
      const source = db.events.find((e) => e.id === eventId);
      if (!source) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

      const newId = `evt-${source.category.substring(0, 4)}-${Date.now().toString(36)}`;
      const duplicated: EventItem = {
        ...source,
        id: newId,
        slug: `${source.slug}-copy`,
        title: `${source.title} (Copy)`,
        registeredCount: 0,
        waitlistCount: 0,
        status: 'DRAFT',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      db.events.push(duplicated);
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EVENT_DUPLICATED', newId, `Duplicated event from ${source.id}`);
      return NextResponse.json({ success: true, event: duplicated });
    }

    if (action === 'ARCHIVE' && eventId) {
      const target = db.events.find((e) => e.id === eventId);
      if (!target) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

      target.status = 'ARCHIVED';
      target.updatedAt = new Date().toISOString();
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EVENT_ARCHIVED', eventId, `Archived event ${target.title}`);
      return NextResponse.json({ success: true, event: target });
    }

    if (action === 'DELETE' && eventId) {
      const index = db.events.findIndex((e) => e.id === eventId);
      if (index === -1) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

      const deletedTitle = db.events[index].title;
      db.events.splice(index, 1);
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EVENT_DELETED', eventId, `Deleted event ${deletedTitle}`);
      return NextResponse.json({ success: true, message: 'Event deleted' });
    }

    return NextResponse.json({ success: false, message: 'Action not supported' }, { status: 400 });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { id, updates } = body;

    const db = await getDatabaseAsync();
    const target = db.events.find((e) => e.id === id);

    if (!target) {
      return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });
    }

    // Check conflicts if schedule updated
    let conflicts: any[] = [];
    if (updates.venueId || updates.date || updates.startTime || updates.endTime) {
      const vId = updates.venueId || target.venueId;
      const dt = updates.date || target.date;
      const st = updates.startTime || target.startTime;
      const et = updates.endTime || target.endTime;
      const coord = updates.coordinatorName || target.coordinatorName;
      conflicts = detectScheduleConflicts(id, vId, dt, st, et, coord);
    }

    Object.assign(target, updates, { updatedAt: new Date().toISOString() });
    await saveDatabaseAsync(db);

    await addAuditLogAsync(session.name, session.role, 'EVENT_UPDATED', id, `Updated event: ${target.title}`);

    return NextResponse.json({
      success: true,
      event: target,
      conflicts: conflicts.length > 0 ? conflicts : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
