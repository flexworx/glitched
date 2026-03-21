import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const status = searchParams.get('status') || 'all';
  const limit = parseInt(searchParams.get('limit') || '10');
  
  // Mock response - replace with actual DB query
  const matches = Array.from({ length: Math.min(limit, 10) }, (_, i) => ({
    id: `match-${7 - i}`,
    seasonId: 1,
    episodeNumber: 7 - i,
    status: i === 0 ? 'live' : 'completed',
    currentTurn: i === 0 ? 34 : 100,
    maxTurns: 100,
    agentsAlive: i === 0 ? 6 : 1,
    dramaScore: i === 0 ? 72 : Math.floor(Math.random() * 40) + 60,
    startedAt: new Date(Date.now() - i * 2 * 60 * 60 * 1000).toISOString(),
    endedAt: i === 0 ? null : new Date(Date.now() - i * 2 * 60 * 60 * 1000 + 90 * 60 * 1000).toISOString(),
    winner: i === 0 ? null : 'PRIMUS',
  }));
  
  const filtered = status === 'all' ? matches : matches.filter(m => m.status === status);
  return NextResponse.json(filtered);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  // TODO: Validate admin auth, create match in DB, trigger game engine
  return NextResponse.json({ id: `match-${Date.now()}`, status: 'queued', ...body }, { status: 201 });
}
