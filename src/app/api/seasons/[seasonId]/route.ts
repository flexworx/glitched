import { NextRequest, NextResponse } from 'next/server';

export async function GET(req: NextRequest, { params }: { params: { seasonId: string } }) {
  return NextResponse.json({
    id: params.seasonId,
    name: `Season ${params.seasonId}`,
    status: params.seasonId === '2' ? 'active' : 'ended',
    episodes: 12,
    completedEpisodes: 7,
    totalMatches: 28,
    murphBurned: 1200000,
  });
}
