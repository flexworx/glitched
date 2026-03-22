import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const matchId = searchParams.get('matchId');

  if (!matchId) return NextResponse.json({ error: 'matchId required' }, { status: 400 });

  return NextResponse.json({
    matchId,
    status: 'active',
    turn: 45,
    phase: 'mid_game',
    timestamp: new Date().toISOString(),
  });
}
