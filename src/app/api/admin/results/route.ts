import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { ResultItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabaseAsync();
    // Ensure all active events have a matching result row
    const existingResultEventIds = new Set((db.results || []).map((r) => r.eventId));
    let needsSave = false;
    if (!db.results) db.results = [];

    for (const evt of db.events) {
      if (evt.status !== 'POSTPONED' && !existingResultEventIds.has(evt.id)) {
        db.results.push({
          id: `res-${evt.id}`,
          eventId: evt.id,
          eventTitle: evt.title,
          category: evt.category,
          subcategory: evt.subcategory,
          published: false,
          status: 'PENDING',
          notes: 'PENDING JURY DELIBERATION',
          updatedAt: new Date().toISOString(),
        });
        needsSave = true;
      }
    }

    if (needsSave) {
      await saveDatabaseAsync(db);
    }

    return NextResponse.json({
      success: true,
      results: db.results,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to fetch results' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session || session.role === 'CHECK_IN_STAFF') {
      return NextResponse.json({ success: false, message: 'Access denied: Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const {
      eventId,
      winner,
      runnerUp,
      secondRunnerUp,
      specialMentions,
      notes,
      published,
      status,
      prizes,
    } = body;

    const db = await getDatabaseAsync();
    if (!db.results) db.results = [];

    const existingIndex = db.results.findIndex((r) => r.eventId === eventId);
    const event = db.events.find((e) => e.id === eventId);

    const isPublished = Boolean(published && status !== 'DRAFT');

    const resultRecord: ResultItem = {
      id: existingIndex !== -1 ? db.results[existingIndex].id : `res-${eventId}`,
      eventId,
      eventTitle: event?.title || 'Festival Event',
      category: event?.category || 'cultural',
      subcategory: event?.subcategory || 'General',
      published: isPublished,
      status: status || (isPublished ? 'PUBLISHED' : 'PENDING'),
      announcedAt: isPublished ? new Date().toISOString() : undefined,
      winner: winner || undefined,
      runnerUp: runnerUp || undefined,
      secondRunnerUp: secondRunnerUp || undefined,
      specialMentions: specialMentions || [],
      prizes: prizes || undefined,
      notes: notes || (isPublished ? 'Official results ratified by festival jury.' : 'PENDING JURY DELIBERATION'),
      updatedAt: new Date().toISOString(),
    };

    if (existingIndex !== -1) {
      db.results[existingIndex] = resultRecord;
    } else {
      db.results.push(resultRecord);
    }

    await saveDatabaseAsync(db);

    const action = isPublished ? 'RESULTS_PUBLISHED' : 'RESULTS_UPDATED';
    await addAuditLogAsync(
      session.name,
      session.role,
      action,
      eventId,
      `Updated results for "${resultRecord.eventTitle}". Published: ${resultRecord.published}, Status: ${resultRecord.status}`
    );

    return NextResponse.json({ success: true, result: resultRecord, results: db.results });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update results' }, { status: 500 });
  }
}
