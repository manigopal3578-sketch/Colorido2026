import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync } from '@/lib/db';
import { ResultItem } from '@/lib/types';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const categoryFilter = url.searchParams.get('category');
    const eventIdFilter = url.searchParams.get('eventId');
    const db = await getDatabaseAsync();

    if (!db.results) db.results = [];

    // Ensure all active events exist in results table
    const existingResultMap = new Map<string, ResultItem>();
    db.results.forEach((r) => existingResultMap.set(r.eventId, r));

    let updatedDb = false;
    for (const evt of db.events) {
      if (evt.status !== 'POSTPONED' && !existingResultMap.has(evt.id)) {
        const newResult: ResultItem = {
          id: `res-${evt.id}`,
          eventId: evt.id,
          eventTitle: evt.title,
          category: evt.category,
          subcategory: evt.subcategory,
          published: false,
          status: 'PENDING',
          notes: 'PENDING JURY DELIBERATION',
          updatedAt: new Date().toISOString(),
        };
        db.results.push(newResult);
        existingResultMap.set(evt.id, newResult);
        updatedDb = true;
      }
    }

    if (updatedDb) {
      await saveDatabaseAsync(db);
    }

    // Map each result with enriched event information
    const eventMap = new Map(db.events.map((e) => [e.id, e]));

    let enrichedResults = db.results.map((r) => {
      const evt = eventMap.get(r.eventId);
      return {
        ...r,
        eventTitle: evt?.title || r.eventTitle,
        category: evt?.category || r.category,
        subcategory: evt?.subcategory || r.subcategory,
        venueName: evt?.venueName || 'Campus Venue',
        date: evt?.date || '2026-12-28',
        startTime: evt?.startTime || '09:00',
        endTime: evt?.endTime || '17:00',
        coverImage: evt?.coverImage || 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
        teamRequirement: evt?.teamRequirement || 'INDIVIDUAL',
        minTeamSize: evt?.minTeamSize || 1,
        maxTeamSize: evt?.maxTeamSize || 1,
        slug: evt?.slug || r.eventId,
      };
    });

    if (eventIdFilter) {
      enrichedResults = enrichedResults.filter((r) => r.eventId === eventIdFilter);
    }

    if (categoryFilter && categoryFilter !== 'ALL') {
      enrichedResults = enrichedResults.filter(
        (r) => r.category.toLowerCase() === categoryFilter.toLowerCase()
      );
    }

    const totalEvents = db.events.filter((e) => e.status !== 'POSTPONED').length;
    const resultsPublished = db.results.filter((r) => r.published && r.winner?.name).length;
    const resultsPending = Math.max(0, totalEvents - resultsPublished);

    return NextResponse.json({
      success: true,
      summary: {
        totalEvents,
        resultsPublished,
        resultsPending,
      },
      results: enrichedResults,
      lastUpdated: new Date().toISOString(),
    });
  } catch (error: any) {
    return NextResponse.json(
      { success: false, message: 'Failed to fetch public results' },
      { status: 500 }
    );
  }
}
