import { NextRequest, NextResponse } from 'next/server';
import { getSession } from '@/lib/auth/session';
import { prisma } from '@/lib/db/client';

export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const session = await getSession();
  if (!session) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  const userId = (session as { userId: string }).userId;

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '50');

  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (!wallet) return NextResponse.json({ transactions: [] });

  const txs = await prisma.murphTransaction.findMany({
    where: { userWalletId: wallet.id },
    orderBy: { timestamp: 'desc' },
    take: Math.min(limit, 100),
  });

  const POSITIVE_TYPES = ['MATCH_REWARD', 'PREDICTION_WIN', 'STAKE_REWARD', 'REFERRAL_BONUS', 'UNSTAKE'];

  return NextResponse.json({
    transactions: txs.map((t: (typeof txs)[number]) => ({
      id: t.id,
      type: t.txType,
      amount: POSITIVE_TYPES.includes(t.txType) ? t.amount : -t.amount,
      description: t.description || t.txType.replace(/_/g, ' '),
      txHash: t.solanaSignature,
      status: 'confirmed',
      createdAt: t.timestamp,
    })),
  });
}
