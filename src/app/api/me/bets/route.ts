import { NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET() {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const predictions = await prisma.userPrediction.findMany({
    where: { userId },
    include: { pool: { select: { matchId: true, status: true } } },
    orderBy: { createdAt: 'desc' },
    take: 50,
  });

  const bets = predictions.map((p: (typeof predictions)[number]) => ({
    id: p.id,
    marketId: p.poolId,
    question: `Match ${p.pool.matchId?.slice(-6)} prediction`,
    optionLabel: String((p.predictionData as Record<string, unknown>)?.label || p.predictionType),
    amount: p.amount,
    odds: (p.predictionData as Record<string, unknown>)?.odds
      ? Number((p.predictionData as Record<string, unknown>).odds)
      : 2.0,
    status: p.resolvedAt ? (p.payout && p.payout > 0 ? 'WON' : 'LOST') : 'PENDING',
    payout: p.payout || undefined,
    placedAt: p.createdAt,
  }));

  return NextResponse.json({ bets });
}
