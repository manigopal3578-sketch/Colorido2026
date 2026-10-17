import { NextResponse } from 'next/server';
import { verifyAdminCredentials } from '@/lib/auth';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { organizerId, password } = body;

    if (!organizerId || !password) {
      return NextResponse.json(
        { success: false, message: 'Organizer ID and Password are required' },
        { status: 400 }
      );
    }

    const authResult = await verifyAdminCredentials(organizerId, password);

    if (!authResult.success || !authResult.token) {
      return NextResponse.json(
        { success: false, message: authResult.message },
        { status: 401 }
      );
    }

    const response = NextResponse.json({
      success: true,
      user: authResult.user,
      message: 'Authentication successful',
    });

    // Set secure HTTP-only cookie
    response.cookies.set('colorido_admin_session', authResult.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: 60 * 60 * 12, // 12 hours
    });

    return response;
  } catch (error: any) {
    console.error('Login error:', error);
    return NextResponse.json(
      { success: false, message: 'Server authentication failure' },
      { status: 500 }
    );
  }
}
