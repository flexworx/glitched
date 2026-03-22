import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    activeMatches: 1,
    totalAgents: 8,
    onlineUsers: 342,
    murphCirculatingSupply: 987550000,
    totalBurned: 12450000,
    pendingFlags: 2,
    systemHealth: 'healthy',
    cpuUsage: 34,
    memoryUsage: 58,
    wsConnections: 342,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();

  if (body.action === 'start_match') {
    const matchId = 'match-' + Date.now();
    return NextResponse.json({ success: true, matchId, message: 'Match started' });
  }

  if (body.action === 'stop_match') {
    return NextResponse.json({ success: true, message: 'Match stopped' });
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
