import prisma from '../client';

export async function getOpenMarkets(matchId?: string) {
  return prisma.predictionMarket.findMany({
    where: { status: 'open', matchId: matchId || undefined },
    include: { options: true },
    orderBy: { closesAt: 'asc' },
  });
}

export async function placeBet(userId: string, marketId: string, optionId: string, amount: number) {
  return prisma.$transaction([
    prisma.predictionBet.create({
      data: { userId, marketId, optionId, amount, burnAmount: Math.floor(amount * 0.01) },
    }),
    prisma.predictionOption.update({
      where: { id: optionId },
      data: { totalBet: { increment: amount } },
    }),
    prisma.predictionMarket.update({
      where: { id: marketId },
      data: { totalPool: { increment: amount } },
    }),
  ]);
}
