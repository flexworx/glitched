import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const roster = await prisma.fantasyRoster.findFirst({
    where: { userId },
    orderBy: { createdAt: 'desc' },
  });

  if (!roster) return NextResponse.json({ roster: null });

  // agents is stored as JSON array of {id, name, points, status}
  const agentList = Array.isArray(roster.agents)
    ? (roster.agents as Array<{ id: string; name: string; points: number; status: string }>)
    : [];

  return NextResponse.json({
    roster: {
      id: roster.id,
      name: roster.name || 'My Roster',
      totalPoints: roster.totalScore || 0,
      weekPoints: 0,
      rank: roster.rank || 999,
      agents: agentList,
    },
  });
}
