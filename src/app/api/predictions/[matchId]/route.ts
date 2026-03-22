import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { matchId: string } }) {
  return NextResponse.json({
    matchId: params.matchId,
    markets: [],
    total: 0,
  });
}
