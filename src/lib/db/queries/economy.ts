import { prisma } from '../client';

export async function getRecentBurns(limit = 10) {
  return prisma.murphBurn.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function getTotalBurned() {
  const result = await prisma.murphBurn.aggregate({ _sum: { amount: true } });
  return result._sum.amount || 0;
}

export async function createBurnRecord(data: {
  amount: number;
  burnReason: string;
  matchId?: string;
  txSignature?: string;
}) {
  return prisma.murphBurn.create({
    data: {
      amount: data.amount,
      burnReason: (data.burnReason as any) || 'MATCH_FEE',
      matchId: data.matchId,
      txSignature: data.txSignature || `burn_${Date.now()}`,
    },
  });
}

export async function getTransactionHistory(walletId: string, limit = 20) {
  return prisma.murphTransaction.findMany({
    where: { OR: [{ fromWalletId: walletId }, { toWalletId: walletId }] },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}
