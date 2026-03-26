import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const rosters = await prisma.fantasyRoster.findMany({
    orderBy: { totalScore: 'desc' },
    include: { user: { select: { username: true } } },
    take: 50,
  });

  const entries = rosters.map((r: typeof rosters[0], i: number) => ({
    rank: i + 1,
    username: r.user.username || 'Anonymous',
    rosterName: r.name || 'My Roster',
    points: r.totalScore || 0,
    weekPoints: 0,
    change: 0,
  }));

  return NextResponse.json({ entries });
}
