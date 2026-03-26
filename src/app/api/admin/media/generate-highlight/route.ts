import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session || session.role !== 'admin')
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  const { matchId } = await req.json();
  console.log(`[Media] Queuing highlight generation for match ${matchId}`);
  return NextResponse.json({ success: true, message: 'Highlight generation queued' });
}
