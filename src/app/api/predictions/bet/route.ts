import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const { marketId, optionId, amount } = await req.json();
  if (!marketId || !amount || amount <= 0)
    return NextResponse.json({ error: 'Invalid bet parameters' }, { status: 400 });

  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (!wallet || wallet.murphBalance < amount)
    return NextResponse.json({ error: 'Insufficient balance' }, { status: 400 });

  const pool = await prisma.predictionPool.findUnique({ where: { id: marketId } });
  if (!pool || pool.status !== 'OPEN')
    return NextResponse.json({ error: 'Market not open' }, { status: 400 });

  const odds = (pool.outcomeOdds as Record<string, number>) || {};
  const selectedOdds = optionId ? (odds[optionId] || 2.0) : 2.0;

  const bet = await prisma.userPrediction.create({
    data: {
      userId,
      poolId: marketId,
      predictionType: 'WIN',
      predictionData: { label: optionId, odds: selectedOdds },
      amount,
    },
  });

  await prisma.userWallet.update({
    where: { id: wallet.id },
    data: { murphBalance: { decrement: amount } },
  });

  await prisma.predictionPool.update({
    where: { id: marketId },
    data: { totalPool: { increment: amount } },
  });

  return NextResponse.json({ bet });
}
