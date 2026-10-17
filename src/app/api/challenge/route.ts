import { NextResponse } from 'next/server';
import { getDatabaseAsync } from '@/lib/db';
import { initialWebsiteChallenge } from '@/lib/initialData';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    const db = await getDatabaseAsync();
    return NextResponse.json({
      success: true,
      challenge: db.websiteChallenge || initialWebsiteChallenge,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to load challenge details' }, { status: 500 });
  }
}
