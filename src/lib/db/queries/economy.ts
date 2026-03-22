import prisma from '../client';

export async function getBurnStats() {
  const burns = await prisma.burnEvent.aggregate({
    _sum: { amount: true },
    _count: true,
  });

  const dayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const dailyBurns = await prisma.burnEvent.aggregate({
    where: { createdAt: { gte: dayAgo } },
    _sum: { amount: true },
  });

  return {
    totalBurned: burns._sum.amount || 0,
    totalEvents: burns._count,
    dailyBurn: dailyBurns._sum.amount || 0,
  };
}

export async function recordBurn(amount: number, source: string, matchId?: string, txHash?: string) {
  return prisma.burnEvent.create({
    data: { amount, source, matchId, txHash },
  });
}
