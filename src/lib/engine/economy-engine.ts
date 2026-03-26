/**
 * Economy Engine
 * Manages in-match $MURPH economy: wallets, pickups, bets, eliminations, winnings.
 * Models: AgentMatchWallet, AgentMatchTransaction, AgentBet, ArenaPickup
 */

import prisma from '@/lib/db/client';
import type { AgentTxType } from '@prisma/client';

// ─── Constants ─────────────────────────────────────────────────────────────────
const STARTING_BALANCE = 2500;
const ROUND_SURVIVAL_REWARD = 200;
const ELIMINATION_BOUNTY_PCT = 0.3; // 30% of eliminated agent's balance
const PRIZE_POOL_WINNER_PCT = 0.6;  // 60% to winner
const PRIZE_POOL_RUNNER_PCT = 0.25; // 25% to runner-up
const PRIZE_POOL_THIRD_PCT = 0.15;  // 15% to 3rd place

const PICKUP_TYPES = [
  { type: 'MURPH_SMALL',  amount: 100,  weight: 50 },
  { type: 'MURPH_MEDIUM', amount: 250,  weight: 30 },
  { type: 'MURPH_LARGE',  amount: 500,  weight: 15 },
  { type: 'GOLDEN_MURPH', amount: 1000, weight: 5  },
];

// ─── EconomyEngine Class ───────────────────────────────────────────────────────
export class EconomyEngine {
  private matchId: string;

  constructor(matchId: string) {
    this.matchId = matchId;
  }

  // ── Wallet Initialization ──────────────────────────────────────────────────

  async initializeMatchWallets(agentIds: string[]): Promise<void> {
    await prisma.$transaction(
      agentIds.map((agentId) =>
        prisma.agentMatchWallet.upsert({
          where: { matchId_agentId: { matchId: this.matchId, agentId } },
          create: {
            matchId: this.matchId,
            agentId,
            startingBalance: STARTING_BALANCE,
            currentBalance: STARTING_BALANCE,
          },
          update: {},
        })
      )
    );
  }

  // ── Arena Pickups ──────────────────────────────────────────────────────────

  async spawnPickups(gridWidth: number, gridHeight: number): Promise<object[]> {
    const count = Math.floor((gridWidth * gridHeight) / 10);
    const pickups = [];

    for (let i = 0; i < count; i++) {
      const roll = Math.random() * 100;
      let cumulative = 0;
      let selected = PICKUP_TYPES[0];
      for (const pt of PICKUP_TYPES) {
        cumulative += pt.weight;
        if (roll <= cumulative) { selected = pt; break; }
      }

      pickups.push({
        matchId: this.matchId,
        pickupType: selected.type,
        amount: selected.amount,
        positionX: Math.floor(Math.random() * gridWidth),
        positionY: Math.floor(Math.random() * gridHeight),
      });
    }

    const created = await prisma.arenaPickup.createMany({ data: pickups });
    return pickups.slice(0, created.count);
  }

  async collectPickup(pickupId: string, agentId: string): Promise<number> {
    const pickup = await prisma.arenaPickup.findUnique({ where: { id: pickupId } });
    if (!pickup || pickup.isCollected || !pickup.amount) return 0;

    await prisma.$transaction([
      prisma.arenaPickup.update({
        where: { id: pickupId },
        data: { isCollected: true, collectedBy: agentId, collectedAt: new Date() },
      }),
      this._creditWallet(agentId, pickup.amount, 'FOUND_MURPH', `Collected ${pickup.pickupType} pickup`),
    ]);

    return pickup.amount;
  }

  // ── Round Rewards ──────────────────────────────────────────────────────────

  async processRoundSurvival(survivorIds: string[], roundNumber: number): Promise<void> {
    for (const agentId of survivorIds) {
      await this._creditWallet(agentId, ROUND_SURVIVAL_REWARD, 'ROUND_SURVIVAL', `Survived round ${roundNumber}`);
    }
  }

  // ── Elimination ────────────────────────────────────────────────────────────

  async processElimination(
    eliminatedId: string,
    eliminatorId: string,
    round: number
  ): Promise<{ bounty: number; prizePoolContribution: number; eliminatedKeeps: number }> {
    const eliminatedWallet = await prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId: eliminatedId } },
    });

    if (!eliminatedWallet) return { bounty: 0, prizePoolContribution: 0, eliminatedKeeps: 0 };

    const balance = eliminatedWallet.currentBalance;
    const bounty = Math.floor(balance * ELIMINATION_BOUNTY_PCT);
    const eliminatedKeeps = balance - bounty;
    const prizePoolContribution = Math.floor(bounty * 0.5);
    const eliminatorGets = bounty - prizePoolContribution;

    await prisma.$transaction([
      this._debitWallet(eliminatedId, bounty, 'PENALTY', `Eliminated in round ${round}`),
      this._creditWallet(eliminatorId, eliminatorGets, 'ELIMINATION_BOUNTY', `Eliminated ${eliminatedId} in round ${round}`),
    ]);

    return { bounty, prizePoolContribution, eliminatedKeeps };
  }

  // ── Tool Activation ────────────────────────────────────────────────────────

  async activateToolInGame(agentId: string, toolId: string, roundNumber: number): Promise<object | null> {
    const wallet = await prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
    });
    if (!wallet) return null;

    // Record tool activation as a transaction
    const tx = await prisma.agentMatchTransaction.create({
      data: {
        walletId: wallet.id,
        amount: 0,
        txType: 'TOOL_PURCHASE',
        description: `Activated tool: ${toolId} in round ${roundNumber}`,
        roundNumber,
      },
    });

    return tx;
  }

  // ── Self-Bets ──────────────────────────────────────────────────────────────

  async placeSelfBet(
    agentId: string,
    amount: number,
    roundNumber: number
  ): Promise<{ success: boolean; reason?: string; betId?: string }> {
    const wallet = await prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
    });
    if (!wallet) return { success: false, reason: 'Wallet not found' };
    if (wallet.currentBalance < amount) return { success: false, reason: 'Insufficient balance' };

    const [bet] = await prisma.$transaction([
      prisma.agentBet.create({
        data: {
          walletId: wallet.id,
          betType: 'SELF_WIN',
          amount,
          odds: 2.0,
          roundNumber,
        },
      }),
      this._debitWallet(agentId, amount, 'SELF_BET_PLACED', `Self-bet placed in round ${roundNumber}`),
    ]);

    return { success: true, betId: bet.id };
  }

  async settleSelfBets(winnerId: string): Promise<{ settled: number }> {
    const winnerWallet = await prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId: winnerId } },
      include: { bets: { where: { resolved: false, betType: 'SELF_WIN' } } },
    });

    if (!winnerWallet) return { settled: 0 };

    let settled = 0;
    for (const bet of winnerWallet.bets) {
      const payout = Math.floor(bet.amount * bet.odds);
      await prisma.$transaction([
        prisma.agentBet.update({
          where: { id: bet.id },
          data: { resolved: true, won: true, payout },
        }),
        this._creditWallet(winnerId, payout, 'SELF_BET_WON', `Self-bet won — payout ${payout} $MURPH`),
      ]);
      settled++;
    }

    // Mark all other bets as lost
    const allWallets = await prisma.agentMatchWallet.findMany({
      where: { matchId: this.matchId, agentId: { not: winnerId } },
      include: { bets: { where: { resolved: false } } },
    });

    for (const w of allWallets) {
      for (const bet of w.bets) {
        await prisma.agentBet.update({
          where: { id: bet.id },
          data: { resolved: true, won: false, payout: 0 },
        });
        settled++;
      }
    }

    return { settled };
  }

  // ── Winnings Distribution ──────────────────────────────────────────────────

  async distributeWinnings(winnerId: string): Promise<{ distributed: number }> {
    const wallets = await prisma.agentMatchWallet.findMany({
      where: { matchId: this.matchId },
      orderBy: { currentBalance: 'desc' },
    });

    if (wallets.length === 0) return { distributed: 0 };

    const totalPrizePool = wallets.reduce((s, w) => s + w.currentBalance, 0);
    const winnerPrize = Math.floor(totalPrizePool * PRIZE_POOL_WINNER_PCT);
    const runnerPrize = wallets.length > 1 ? Math.floor(totalPrizePool * PRIZE_POOL_RUNNER_PCT) : 0;
    const thirdPrize = wallets.length > 2 ? Math.floor(totalPrizePool * PRIZE_POOL_THIRD_PCT) : 0;

    const distributions = [
      { agentId: winnerId, amount: winnerPrize, place: 1 },
    ];

    if (wallets.length > 1 && wallets[1].agentId !== winnerId) {
      distributions.push({ agentId: wallets[1].agentId, amount: runnerPrize, place: 2 });
    }
    if (wallets.length > 2) {
      distributions.push({ agentId: wallets[2].agentId, amount: thirdPrize, place: 3 });
    }

    for (const d of distributions) {
      await this._creditWallet(
        d.agentId,
        d.amount,
        'PRIZE_POOL_SHARE',
        `Match prize pool — Place #${d.place}`
      );
    }

    return { distributed: distributions.reduce((s, d) => s + d.amount, 0) };
  }

  // ── Summary ────────────────────────────────────────────────────────────────

  async getMatchEconomySummary() {
    const [wallets, pickups] = await Promise.all([
      prisma.agentMatchWallet.findMany({
        where: { matchId: this.matchId },
        include: { transactions: { orderBy: { timestamp: 'desc' }, take: 5 } },
        orderBy: { currentBalance: 'desc' },
      }),
      prisma.arenaPickup.findMany({
        where: { matchId: this.matchId },
        orderBy: { spawnedAt: 'desc' },
      }),
    ]);

    const totalPrizePool = wallets.reduce((s, w) => s + w.currentBalance, 0);
    const collectedPickups = pickups.filter((p) => p.isCollected).length;

    return {
      totalPrizePool,
      wallets,
      pickups,
      collectedPickups,
      uncollectedPickups: pickups.length - collectedPickups,
    };
  }

  // ── Private Helpers ────────────────────────────────────────────────────────

  private _creditWallet(agentId: string, amount: number, txType: AgentTxType, description: string) {
    return prisma.agentMatchWallet.update({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
      data: {
        currentBalance: { increment: amount },
        totalEarned: { increment: amount },
        transactions: {
          create: {
            amount,
            txType,
            description,
            roundNumber: 0,
          },
        },
      },
    });
  }

  private _debitWallet(agentId: string, amount: number, txType: AgentTxType, description: string) {
    return prisma.agentMatchWallet.update({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
      data: {
        currentBalance: { decrement: amount },
        totalSpent: { increment: amount },
        transactions: {
          create: {
            amount: -amount,
            txType,
            description,
            roundNumber: 0,
          },
        },
      },
    });
  }
}
