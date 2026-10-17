import { NextResponse } from 'next/server';
import {
  getDatabaseAsync,
  saveDatabaseAsync,
  addAuditLogAsync,
  restoreVersionSnapshotAsync,
  createVersionSnapshotAsync,
} from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, collection, item, id, items, versionId, target, summary } = body;
    const db = await getDatabaseAsync();

    // 1. Snapshot creation
    if (action === 'CREATE_SNAPSHOT') {
      const snap = await createVersionSnapshotAsync(
        target || 'HOMEPAGE',
        session.name,
        summary || 'Manual snapshot created by administrator',
        target === 'FESTIVAL_SETTINGS' ? db.settings : db.homepageSections
      );
      return NextResponse.json({ success: true, snapshot: snap });
    }

    // 2. Restore version snapshot
    if (action === 'RESTORE_VERSION' && versionId) {
      const success = await restoreVersionSnapshotAsync(versionId, session.name);
      if (!success) {
        return NextResponse.json({ success: false, message: 'Snapshot not found' }, { status: 404 });
      }
      return NextResponse.json({ success: true, message: `Version ${versionId} restored successfully.` });
    }

    // 3. Collection updates
    const validCollections = [
      'venues',
      'coordinators',
      'organizers',
      'announcements',
      'faqs',
      'speakersPerformers',
      'sponsors',
      'events',
      'registrations',
      'participants',
      'tickets',
      'adminUsers',
    ] as const;

    if (!collection || !validCollections.includes(collection as any)) {
      return NextResponse.json({ success: false, message: 'Invalid or missing collection' }, { status: 400 });
    }

    const targetList = (db as any)[collection] as any[];

    if (action === 'ADD') {
      const newItem = {
        id: item.id || `${collection.slice(0, 4)}-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        ...item,
        createdAt: item.createdAt || new Date().toISOString(),
      };
      targetList.unshift(newItem);
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, `${collection.toUpperCase()}_ADDED`, newItem.id, `Added to ${collection}`);
      return NextResponse.json({ success: true, item: newItem });
    }

    if (action === 'UPDATE') {
      const idx = targetList.findIndex((x) => x.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
      }
      targetList[idx] = { ...targetList[idx], ...item, updatedAt: new Date().toISOString() };
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, `${collection.toUpperCase()}_UPDATED`, id, `Updated in ${collection}`);
      return NextResponse.json({ success: true, item: targetList[idx] });
    }

    if (action === 'DELETE') {
      if (collection === 'registrations') {
        const regIdx = db.registrations.findIndex((r) => r.id === id);
        if (regIdx === -1) {
          return NextResponse.json({ success: false, message: 'Registration record not found' }, { status: 404 });
        }
        const reg = db.registrations[regIdx];

        // 1. Remove registration
        db.registrations.splice(regIdx, 1);

        // 2. Cascade delete ticket
        db.tickets = db.tickets.filter((t) => t.id !== reg.ticketId && t.registrationId !== reg.id);

        // 3. Cascade delete check-in record
        db.checkIns = db.checkIns.filter((c) => c.registrationId !== reg.id && c.ticketId !== reg.ticketId);

        // 4. Decrement event counter
        const event = db.events.find((e) => e.id === reg.eventId);
        if (event) {
          if (reg.status === 'CONFIRMED') {
            event.registeredCount = Math.max(0, (event.registeredCount || 0) - 1);
          } else if (reg.status === 'WAITLIST') {
            event.waitlistCount = Math.max(0, (event.waitlistCount || 0) - 1);
          }
        }

        // 5. Clean up participant's registeredEventIds if no other registration exists for that event
        const participant = db.participants.find(
          (p) => p.id === reg.participantId || p.email.toLowerCase() === reg.email.toLowerCase()
        );
        if (participant) {
          const hasOtherRegForEvent = db.registrations.some(
            (r) =>
              r.id !== reg.id &&
              r.eventId === reg.eventId &&
              (r.participantId === participant.id || r.email.toLowerCase() === participant.email.toLowerCase())
          );
          if (!hasOtherRegForEvent) {
            participant.registeredEventIds = participant.registeredEventIds.filter((eId) => eId !== reg.eventId);
          }
        }

        await saveDatabaseAsync(db);
        await addAuditLogAsync(
          session.name,
          session.role,
          'REGISTRATION_DELETED',
          reg.id,
          `Permanently deleted registration ${reg.id} for ${reg.participantName} (${reg.eventTitle}). Ticket revoked and capacity restored.`
        );

        return NextResponse.json({ success: true, item: reg });
      }

      if (collection === 'participants') {
        const partIdx = db.participants.findIndex((p) => p.id === id);
        if (partIdx === -1) {
          return NextResponse.json({ success: false, message: 'Participant record not found' }, { status: 404 });
        }
        const participant = db.participants[partIdx];

        // Find all registrations belonging to this participant
        const associatedRegs = db.registrations.filter(
          (r) => r.participantId === participant.id || r.email.toLowerCase() === participant.email.toLowerCase()
        );
        const associatedRegIds = new Set(associatedRegs.map((r) => r.id));
        const associatedTicketIds = new Set(associatedRegs.map((r) => r.ticketId).filter(Boolean));

        // Decrement event counts for each registration
        for (const reg of associatedRegs) {
          const evt = db.events.find((e) => e.id === reg.eventId);
          if (evt) {
            if (reg.status === 'CONFIRMED') {
              evt.registeredCount = Math.max(0, (evt.registeredCount || 0) - 1);
            } else if (reg.status === 'WAITLIST') {
              evt.waitlistCount = Math.max(0, (evt.waitlistCount || 0) - 1);
            }
          }
        }

        // Delete all associated tickets
        db.tickets = db.tickets.filter((t) => !associatedTicketIds.has(t.id) && !associatedRegIds.has(t.registrationId));

        // Delete all associated check-ins
        db.checkIns = db.checkIns.filter((c) => !associatedRegIds.has(c.registrationId) && !associatedTicketIds.has(c.ticketId));

        // Delete all registrations
        db.registrations = db.registrations.filter((r) => !associatedRegIds.has(r.id));

        // Remove participant
        db.participants.splice(partIdx, 1);

        await saveDatabaseAsync(db);
        await addAuditLogAsync(
          session.name,
          session.role,
          'PARTICIPANT_DELETED',
          participant.id,
          `Permanently deleted delegate ${participant.name} (${participant.email}) and ${associatedRegs.length} associated event registrations.`
        );

        return NextResponse.json({ success: true, item: participant, deletedRegistrationsCount: associatedRegs.length });
      }

      const idx = targetList.findIndex((x) => x.id === id);
      if (idx === -1) {
        return NextResponse.json({ success: false, message: 'Item not found' }, { status: 404 });
      }
      const removed = targetList.splice(idx, 1)[0];
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, `${collection.toUpperCase()}_DELETED`, id, `Deleted from ${collection}`);
      return NextResponse.json({ success: true, item: removed });
    }

    if (action === 'BULK_UPDATE' && Array.isArray(items)) {
      (db as any)[collection] = items;
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, `${collection.toUpperCase()}_BULK_UPDATED`, collection, `Bulk updated ${items.length} records in ${collection}`);
      return NextResponse.json({ success: true, count: items.length });
    }

    return NextResponse.json({ success: false, message: 'Unsupported action' }, { status: 400 });
  } catch (error: any) {
    console.error('Mutation API error:', error);
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
