import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    festival: 'COLORIDO 2K26',
    college: 'R.V.R. & J.C. College of Engineering',
    edition: '2K26',
    dates: '28–29 December 2026',
    timestamp: new Date().toISOString(),
  });
}
