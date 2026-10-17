import { NextResponse } from 'next/server';
import { getAuthenticatedAdmin, rotateAdminPassword, invalidateAllSessions } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const session = await getAuthenticatedAdmin();
    if (!session) {
      return NextResponse.json({ success: false, message: 'Unauthorized session' }, { status: 401 });
    }

    const body = await request.json();
    const { currentPassword, newPassword, confirmPassword, action } = body;

    if (action === 'REVOKE_ALL') {
      await invalidateAllSessions(session.userId);
      const res = NextResponse.json({ success: true, message: 'All active sessions invalidated.' });
      res.cookies.delete('colorido_admin_session');
      return res;
    }

    if (!currentPassword || !newPassword) {
      return NextResponse.json(
        { success: false, message: 'Current password and new password are required.' },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: 'New password and confirmation do not match.' },
        { status: 400 }
      );
    }

    const result = await rotateAdminPassword(session.userId, currentPassword, newPassword);
    if (!result.success) {
      return NextResponse.json({ success: false, message: result.message }, { status: 400 });
    }

    const response = NextResponse.json({
      success: true,
      message: result.message,
    });

    // Clear old session so user logs in with new rotated password
    response.cookies.delete('colorido_admin_session');
    return response;
  } catch (err: any) {
    return NextResponse.json({ success: false, message: err.message }, { status: 500 });
  }
}
