import { prisma } from '../client';

export async function getOpenPools(matchId?: string) {
  return prisma.predictionPool.findMany({
    where: { status: 'OPEN', ...(matchId ? { matchId } : {}) },
    include: { match: true },
    orderBy: { totalPool: 'desc' },
  });
}

export async function placeBet(data: {
  userId: string;
  poolId: string;
  predictionType?: string;
  amount: number;
}) {
  return prisma.userPrediction.create({
    data: {
      userId: data.userId,
      poolId: data.poolId,
      predictionType: (data.predictionType as any) || 'WINNER',
      predictionData: {},
      amount: data.amount,
    },
  });
}

export async function getUserPredictions(userId: string) {
  return prisma.userPrediction.findMany({
    where: { userId },
    include: { pool: { include: { match: true } } },
    orderBy: { createdAt: 'desc' },
  });
}
