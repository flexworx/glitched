/**
 * RADF v3 — Predictions Service
 * Off-chain prediction market with DB-backed ledger.
 * All field names verified against prisma/schema.prisma.
 * TransactionType enum: MATCH_REWARD | PREDICTION_WIN | AGENT_TRADE | BRIBE |
 *   KNOWLEDGE_PACK | COSMETIC_PURCHASE | BATTLE_PASS | VIEWER_TIP |
 *   SPONSORSHIP | BURN | DEPOSIT | WITHDRAWAL
 * PredictionStatus enum: OPEN | LOCKED | RESOLVED | CANCELLED
 */
import { prisma } from '@/lib/db/client';

export async function getPredictionPoolForMatch(matchId: string) {
  return prisma.predictionPool.findUnique({
    where: { matchId },
    include: {
      bets: {
        select: {
          id: true,
          userId: true,
          predictionType: true,
          predictionData: true,
          amount: true,
          outcome: true,
          payout: true,
          resolvedAt: true,
        },
      },
    },
  });
}

export async function listOpenPredictionPools() {
  return prisma.predictionPool.findMany({
    where: { status: 'OPEN' },
    include: {
      match: {
        select: {
          id: true,
          status: true,
          currentTurn: true,
          participants: {
            select: { agent: { select: { id: true, name: true, signatureColor: true } } },
          },
        },
      },
      _count: { select: { bets: true } },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export interface PlaceBetInput {
  userId: string;
  matchId: string;
  predictionType: string;
  predictionData: Record<string, unknown>;
  amount: number;
}

export async function placeBet(input: PlaceBetInput) {
  return prisma.$transaction(async (tx) => {
    const pool = await tx.predictionPool.findUnique({
      where: { matchId: input.matchId },
    });
    if (!pool) throw new Error('Prediction pool not found for this match');
    if (pool.status !== 'OPEN') throw new Error('Prediction pool is closed');

    const wallet = await tx.userWallet.findUnique({
      where: { userId: input.userId },
    });
    if (!wallet) throw new Error('User wallet not found');
    if (wallet.murphBalance < input.amount) {
      throw new Error(`Insufficient $MURPH balance. Have ${wallet.murphBalance}, need ${input.amount}`);
    }

    await tx.userWallet.update({
      where: { userId: input.userId },
      data: { murphBalance: { decrement: input.amount } },
    });

    await tx.predictionPool.update({
      where: { matchId: input.matchId },
      data: { totalPool: { increment: input.amount } },
    });

    const prediction = await tx.userPrediction.create({
      data: {
        userId: input.userId,
        poolId: pool.id,
        predictionType: input.predictionType,
        predictionData: input.predictionData as any,
        amount: input.amount,
      },
    });

    // Record the transaction using DEPOSIT as closest available type for bet placement
    await tx.murphTransaction.create({
      data: {
        userWalletId: wallet.id,
        amount: -input.amount,
        txType: 'DEPOSIT', // Using available enum value
        description: `Prediction bet on match ${input.matchId}: ${input.predictionType}`,
        matchId: input.matchId,
      },
    });

    return prediction;
  });
}

export async function getUserPredictions(userId: string) {
  return prisma.userPrediction.findMany({
    where: { userId },
    include: {
      pool: {
        include: {
          match: { select: { id: true, status: true, startedAt: true } },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: 20,
  });
}

export async function settlePredictions(matchId: string, winnerId: string) {
  return prisma.$transaction(async (tx) => {
    const pool = await tx.predictionPool.findUnique({
      where: { matchId },
      include: { bets: true },
    });
    if (!pool) throw new Error('Pool not found');
    if (pool.status !== 'OPEN') throw new Error('Pool already settled');

    await tx.predictionPool.update({
      where: { matchId },
      data: { status: 'RESOLVED', resolvedAt: new Date(), winningOutcome: winnerId },
    });

    const winningBets = pool.bets.filter(
      (p) => p.predictionType === 'WINNER' && (p.predictionData as any)?.agentId === winnerId
    );
    const losingBets = pool.bets.filter(
      (p) => !(p.predictionType === 'WINNER' && (p.predictionData as any)?.agentId === winnerId)
    );

    const totalWinningAmount = winningBets.reduce((sum, b) => sum + b.amount, 0);
    const burnAmount = pool.totalPool * 0.05;
    const payoutPool = pool.totalPool - burnAmount;

    for (const bet of winningBets) {
      const share = totalWinningAmount > 0 ? bet.amount / totalWinningAmount : 0;
      const payout = payoutPool * share;

      await tx.userPrediction.update({
        where: { id: bet.id },
        data: { outcome: 'WIN', payout, resolvedAt: new Date() },
      });

      const wallet = await tx.userWallet.findUnique({ where: { userId: bet.userId } });
      if (wallet) {
        await tx.userWallet.update({
          where: { userId: bet.userId },
          data: { murphBalance: { increment: payout } },
        });
        await tx.murphTransaction.create({
          data: {
            userWalletId: wallet.id,
            amount: payout,
            txType: 'PREDICTION_WIN',
            description: `Prediction payout for match ${matchId}`,
            matchId,
          },
        });
      }
    }

    for (const bet of losingBets) {
      await tx.userPrediction.update({
        where: { id: bet.id },
        data: { outcome: 'LOSS', payout: 0, resolvedAt: new Date() },
      });
    }

    if (burnAmount > 0) {
      await tx.murphBurn.create({
        data: {
          amount: burnAmount,
          burnReason: `Prediction settlement for match ${matchId}`,
          matchId,
        },
      });
    }

    return { settled: pool.bets.length, winners: winningBets.length, burnAmount };
  });
}
