import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  // TODO: Get from session/JWT
  return NextResponse.json({
    id: 'user-demo',
    username: 'arena_watcher',
    level: 12,
    xp: 11200,
    xpForNextLevel: 12000,
    faction: 'echo',
    streak: { current: 5, longest: 14, lastCheckin: new Date(Date.now() - 25*60*60*1000).toISOString() },
    achievements: [],
    murphBalance: 5000,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  if (body.action === 'checkin') {
    return NextResponse.json({ success: true, xpEarned: 100, newStreak: 6 });
  }
  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
