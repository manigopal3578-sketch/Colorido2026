import { NextResponse } from 'next/server';
import { getDatabaseAsync, saveDatabaseAsync, addAuditLogAsync } from '@/lib/db';
import { getAuthenticatedAdmin } from '@/lib/auth';
import { WebsiteChallengeConfig } from '@/lib/types';
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
    return NextResponse.json({ success: false, message: 'Failed to load challenge configuration' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session || session.role === 'CHECK_IN_STAFF') {
      return NextResponse.json({ success: false, message: 'Access denied: Admin required' }, { status: 403 });
    }

    const body = await request.json();
    const db = await getDatabaseAsync();

    const updatedConfig: WebsiteChallengeConfig = {
      ...(db.websiteChallenge || initialWebsiteChallenge),
      ...body,
      lastUpdated: new Date().toISOString(),
    };

    db.websiteChallenge = updatedConfig;
    await saveDatabaseAsync(db);

    await addAuditLogAsync(
      session.name,
      session.role,
      'CHALLENGE_UPDATED',
      'WEBSITE_CHALLENGE',
      `Updated Website Challenge config (Status: ${updatedConfig.status}, Deadline: ${updatedConfig.deadline})`
    );

    return NextResponse.json({ success: true, challenge: updatedConfig });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: 'Failed to update challenge configuration' }, { status: 500 });
  }
}
