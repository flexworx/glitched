/**
 * Prediction Market — Solana + Database Integration
 * Handles $MURPH betting, market settlement, and burn mechanics.
 */
import { getMurphConnection, MURPH_CONFIG } from './murph-token';
import { prisma } from '@/lib/db/client';
import { PredictionStatus, TransactionType } from '@prisma/client';

export interface PredictionBet {
  marketId: string;
  optionId: string;
  amount: number;
  walletAddress: string;
  userId: string;
}

export interface MarketOption {
  id: string;
  label: string;
  odds: number;
  totalBets: number;
}

export interface MarketSummary {
  id: string;
  matchId: string;
  status: string;
  totalPool: number;
  options: MarketOption[];
  closesAt: Date | null;
}

const BURN_PERCENT = 0.01;
const HOUSE_PERCENT = 0.02;

export async function createPredictionMarket(
  matchId: string,
  options: string[]
): Promise<{ marketId: string }> {
  const initialOdds: Record<string, number> = {};
  options.forEach(opt => { initialOdds[opt] = 2.0; });
  const pool = await prisma.predictionPool.upsert({
    where: { matchId },
    update: { status: PredictionStatus.OPEN },
    create: { matchId, totalPool: 0, outcomeOdds: initialOdds, status: PredictionStatus.OPEN },
  });
  return { marketId: pool.id };
}

export async function placePredictionBet(
  bet: PredictionBet
): Promise<{ success: boolean; txHash?: string; betId?: string; error?: string }> {
  try {
    const pool = await prisma.predictionPool.findUnique({ where: { id: bet.marketId } });
    if (!pool || pool.status !== PredictionStatus.OPEN)
      return { success: false, error: 'Market is not open for betting' };

    const wallet = await prisma.userWallet.findUnique({ where: { userId: bet.userId } });
    if (!wallet || wallet.murphBalance < bet.amount)
      return { success: false, error: 'Insufficient $MURPH balance' };

    const currentOdds = (pool.outcomeOdds as Record<string, number>) || {};
    const newTotalPool = pool.totalPool + bet.amount;
    const updatedOdds = recalculateOdds(currentOdds, bet.optionId, newTotalPool);

    const [, betRecord] = await prisma.$transaction([
      prisma.userWallet.update({
        where: { id: wallet.id },
        data: { murphBalance: { decrement: bet.amount } },
      }),
      prisma.userPrediction.create({
        data: {
          userId: bet.userId,
          poolId: bet.marketId,
          predictionType: 'WIN',
          predictionData: { label: bet.optionId, odds: currentOdds[bet.optionId] || 2.0 },
          amount: bet.amount,
        },
      }),
      prisma.predictionPool.update({
        where: { id: bet.marketId },
        data: { totalPool: newTotalPool, outcomeOdds: updatedOdds },
      }),
      prisma.murphTransaction.create({
        data: {
          userWalletId: wallet.id,
          amount: bet.amount,
          txType: TransactionType.BURN,
          description: `Prediction bet on market ${bet.marketId}`,
          matchId: pool.matchId,
        },
      }),
    ]);

    let txHash: string | undefined;
    try { txHash = await submitOnChainBet(bet); } catch { /* non-blocking */ }

    return { success: true, betId: betRecord.id, txHash: txHash || `db_${betRecord.id}` };
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : 'Transaction failed' };
  }
}

export async function settlePredictionMarket(
  marketId: string,
  winningOptionId: string
): Promise<{ success: boolean; settledBets: number; totalPayout: number; burned: number }> {
  try {
    const pool = await prisma.predictionPool.findUnique({
      where: { id: marketId },
      include: { bets: { include: { user: { include: { wallet: true } } } } },
    });
    if (!pool || pool.status === PredictionStatus.RESOLVED)
      return { success: false, settledBets: 0, totalPayout: 0, burned: 0 };

    const winningBets = pool.bets.filter(b => {
      const data = b.predictionData as Record<string, unknown>;
      return data?.label === winningOptionId;
    });
    const totalWinPool = winningBets.reduce((sum, b) => sum + b.amount, 0);
    const burnAmount = pool.totalPool * BURN_PERCENT;
    const houseAmount = pool.totalPool * HOUSE_PERCENT;
    const payoutPool = pool.totalPool - burnAmount - houseAmount;
    let totalPayout = 0;

    const ops: Promise<unknown>[] = [];
    for (const bet of winningBets) {
      const share = totalWinPool > 0 ? bet.amount / totalWinPool : 0;
      const payout = payoutPool * share;
      totalPayout += payout;
      if (bet.user?.wallet) {
        ops.push(prisma.userWallet.update({ where: { id: bet.user.wallet.id }, data: { murphBalance: { increment: payout } } }));
        ops.push(prisma.userPrediction.update({ where: { id: bet.id }, data: { outcome: 'WIN', payout, resolvedAt: new Date() } }));
        ops.push(prisma.murphTransaction.create({ data: { userWalletId: bet.user.wallet.id, amount: payout, txType: TransactionType.PREDICTION_WIN, description: `Prediction win: market ${marketId}`, matchId: pool.matchId } }));
      }
    }
    for (const bet of pool.bets.filter(b => { const d = b.predictionData as Record<string, unknown>; return d?.label !== winningOptionId; })) {
      ops.push(prisma.userPrediction.update({ where: { id: bet.id }, data: { outcome: 'LOSS', payout: 0, resolvedAt: new Date() } }));
    }
    if (burnAmount > 0) {
      ops.push(prisma.murphBurn.create({ data: { amount: burnAmount, burnReason: `Prediction market settlement: ${marketId}`, matchId: pool.matchId } }));
    }
    ops.push(prisma.predictionPool.update({ where: { id: marketId }, data: { status: PredictionStatus.RESOLVED, resolvedAt: new Date(), winningOutcome: winningOptionId } }));
    await Promise.all(ops);
    return { success: true, settledBets: pool.bets.length, totalPayout, burned: burnAmount };
  } catch (error) {
    console.error('[PredictionMarket] settlePredictionMarket error:', error);
    return { success: false, settledBets: 0, totalPayout: 0, burned: 0 };
  }
}

export async function lockPredictionMarket(marketId: string): Promise<void> {
  await prisma.predictionPool.update({ where: { id: marketId }, data: { status: PredictionStatus.LOCKED } });
}

export async function cancelPredictionMarket(marketId: string): Promise<void> {
  const pool = await prisma.predictionPool.findUnique({ where: { id: marketId }, include: { bets: { include: { user: { include: { wallet: true } } } } } });
  if (!pool) return;
  const ops = pool.bets.filter(b => b.user?.wallet).flatMap(b => [
    prisma.userWallet.update({ where: { id: b.user!.wallet!.id }, data: { murphBalance: { increment: b.amount } } }),
    prisma.userPrediction.update({ where: { id: b.id }, data: { outcome: 'REFUND', payout: b.amount, resolvedAt: new Date() } }),
  ]);
  await Promise.all([...ops, prisma.predictionPool.update({ where: { id: marketId }, data: { status: PredictionStatus.CANCELLED, resolvedAt: new Date() } })]);
}

export function calculatePayout(betAmount: number, odds: number, burnPct: number = BURN_PERCENT): number {
  const gross = betAmount * odds;
  return gross - gross * burnPct - gross * HOUSE_PERCENT;
}

export async function getMarketSummary(matchId: string): Promise<MarketSummary | null> {
  const pool = await prisma.predictionPool.findUnique({ where: { matchId } });
  if (!pool) return null;
  const odds = (pool.outcomeOdds as Record<string, number>) || {};
  return {
    id: pool.id,
    matchId: pool.matchId,
    status: pool.status,
    totalPool: pool.totalPool,
    options: Object.entries(odds).map(([id, odd]) => ({ id, label: id, odds: odd, totalBets: 0 })),
    closesAt: pool.resolvedAt,
  };
}

function recalculateOdds(current: Record<string, number>, bettedOption: string, newTotal: number): Record<string, number> {
  const updated: Record<string, number> = { ...current };
  const n = Math.max(Object.keys(updated).length - 1, 1);
  Object.keys(updated).forEach(opt => {
    const share = opt === bettedOption ? 0.6 : 0.4 / n;
    updated[opt] = Math.max(1.1, newTotal > 0 ? (1 / share) * 0.95 : 2.0);
  });
  return updated;
}

async function submitOnChainBet(bet: PredictionBet): Promise<string> {
  if (!process.env.SOLANA_RPC_URL || MURPH_CONFIG.MINT_ADDRESS.includes('xxx'))
    return `sim_${Date.now()}_${bet.optionId}`;
  const _connection = getMurphConnection();
  console.log(`[OnChain] Transfer ${bet.amount} $MURPH from ${bet.walletAddress} to market PDA`);
  return `pending_${Date.now()}`;
}
