import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';

export const dynamic = 'force-dynamic';

// Curated high-resolution editorial assets matching exact prompt atmospheres
const CULTURAL_PRESETS = [
  'https://images.unsplash.com/photo-1508700115892-45ecd05ae2ad?q=80&w=1200&auto=format&fit=crop', // Dance Bharatanatyam stage
  'https://images.unsplash.com/photo-1535525153412-5a42439a210d?q=80&w=1200&auto=format&fit=crop', // Street crew hiphop
  'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop', // Rock band fusion
  'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop', // Vocal concert
  'https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=1200&auto=format&fit=crop', // Live canvas art
  'https://images.unsplash.com/photo-1547153760-18fc86324498?q=80&w=1200&auto=format&fit=crop', // Dramatic stage lights
];

const SPORTS_PRESETS = [
  'https://images.unsplash.com/photo-1531415074968-036ba1b575da?q=80&w=1200&auto=format&fit=crop', // Cricket stadium turf
  'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop', // Football match
  'https://images.unsplash.com/photo-1546519638-68e109498ffc?q=80&w=1200&auto=format&fit=crop', // Basketball indoor hardcourt
  'https://images.unsplash.com/photo-1529699211952-734e80c4d42b?q=80&w=1200&auto=format&fit=crop', // Chess tournament focus
  'https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?q=80&w=1200&auto=format&fit=crop', // Badminton doubles smash
  'https://images.unsplash.com/photo-1517649763962-0c623266ddc0?q=80&w=1200&auto=format&fit=crop', // Track & sprint athletics
];

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { action, eventId, category, style, mood, prompt } = body;

    const db = await getDatabaseAsync();

    if (action === 'APPROVE_COVER' && eventId && body.imageUrl) {
      const event = db.events.find((e) => e.id === eventId);
      if (!event) return NextResponse.json({ success: false, message: 'Event not found' }, { status: 404 });

      event.coverImage = body.imageUrl;
      event.updatedAt = new Date().toISOString();
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EVENT_COVER_APPROVED', event.id, `Set new official visual for ${event.title}`);

      return NextResponse.json({
        success: true,
        message: 'Cover image approved and published to event!',
        event,
      });
    }

    // Generate Candidate Visual
    const pool = category === 'cultural' ? CULTURAL_PRESETS : SPORTS_PRESETS;
    const randomPick = pool[Math.floor(Math.random() * pool.length)];

    const candidate = {
      id: `gen-${Date.now()}`,
      imageUrl: randomPick,
      prompt: prompt || `${category} festival competition with ${mood || 'high energy'} and ${style || 'cinematic editorial'} style`,
      category: category || 'cultural',
      style: style || 'Cinematic Editorial',
      mood: mood || 'Dynamic Festival',
      status: 'DRAFT', // strictly requires approval
      generatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      candidate,
      message: 'Visual candidate generated. Review and approve to set as official cover.',
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
