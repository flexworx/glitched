import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { matchId: string } }) {
  return NextResponse.json({
    matchId: params.matchId,
    turns: [],
    totalTurns: 100,
    message: 'Replay data — full turn history',
  });
}
