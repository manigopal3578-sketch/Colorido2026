import { NextResponse } from 'next/server';
import {
  getDatabaseAsync,
  saveDatabaseAsync,
  addAuditLogAsync,
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
    const { updates, action } = body;
    const db = await getDatabaseAsync();

    if (action === 'TOGGLE_EMERGENCY') {
      db.settings.emergencyNoticeActive = Boolean(updates?.emergencyNoticeActive);
      if (updates?.emergencyNotice !== undefined) {
        db.settings.emergencyNotice = updates.emergencyNotice;
      }
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'EMERGENCY_NOTICE_TOGGLE', 'SETTINGS', `Notice status: ${db.settings.emergencyNoticeActive}`);
      return NextResponse.json({ success: true, settings: db.settings });
    }

    if (action === 'SET_FESTIVAL_STATUS') {
      const oldStatus = db.settings.status;
      db.settings.status = updates.status;
      await saveDatabaseAsync(db);
      await addAuditLogAsync(session.name, session.role, 'FESTIVAL_STATUS_OVERRIDE', 'SETTINGS', `Changed from ${oldStatus} to ${updates.status}`);
      return NextResponse.json({ success: true, settings: db.settings });
    }

    // General settings update
    await createVersionSnapshotAsync('FESTIVAL_SETTINGS', session.name, 'Updated festival operational settings', db.settings);
    Object.assign(db.settings, updates);
    await saveDatabaseAsync(db);

    await addAuditLogAsync(session.name, session.role, 'SETTINGS_UPDATED', 'SETTINGS', 'Updated festival configuration');

    return NextResponse.json({
      success: true,
      message: 'Festival settings updated successfully',
      settings: db.settings,
    });
  } catch (error: any) {
    return NextResponse.json({ success: false, message: error.message }, { status: 500 });
  }
}
