import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    matches: [
      { id:'match-142', status:'active', turn:45, maxTurns:100, dramaScore:78, agentCount:8, startedAt:'2025-03-21T18:00:00Z' },
    ],
    total: 1,
    active: 1,
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  return NextResponse.json({ success: true, matchId: 'match-' + Date.now() });
}
