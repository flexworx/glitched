import { NextRequest, NextResponse } from 'next/server';

const MATCHES = [
  { id:'match-142', status:'active', turn:45, maxTurns:100, dramaScore:78, agents:['primus','cerberus','mythion','oracle','solarius','aurum','vanguard','arion'], startedAt:'2025-03-21T18:00:00Z' },
  { id:'match-141', status:'ended', turn:100, maxTurns:100, dramaScore:92, agents:['primus','cerberus','mythion','oracle','solarius','aurum','vanguard','arion'], startedAt:'2025-03-21T15:00:00Z', endedAt:'2025-03-21T17:30:00Z', winnerId:'primus' },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status');
  const matches = status ? MATCHES.filter(m => m.status === status) : MATCHES;
  return NextResponse.json({ matches, total: matches.length });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const matchId = 'match-' + Date.now();
  return NextResponse.json({ success: true, matchId, message: 'Match created' }, { status: 201 });
}
