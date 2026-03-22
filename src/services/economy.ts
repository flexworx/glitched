/**
 * RADF v3 — Economy Service
 * Real $MURPH token economics backed by DB ledger.
 * All field names verified against prisma/schema.prisma.
 */
import { prisma } from '@/lib/db/client';

export async function getMurphStats() {
  const [totalBurned, totalTransactions, recentBurns] = await Promise.all([
    prisma.murphBurn.aggregate({ _sum: { amount: true } }),
    prisma.murphTransaction.count(),
    prisma.murphBurn.findMany({
      orderBy: { timestamp: 'desc' },
      take: 5,
      select: { id: true, amount: true, burnReason: true, matchId: true, timestamp: true },
    }),
  ]);

  const TOTAL_SUPPLY = 1_000_000_000;
  const burned = totalBurned._sum.amount ?? 0;

  return {
    totalSupply: TOTAL_SUPPLY,
    circulatingSupply: TOTAL_SUPPLY - burned,
    totalBurned: burned,
    burnRate: burned / TOTAL_SUPPLY,
    totalTransactions,
    recentBurns,
  };
}

export async function getMurphTransactions(limit = 20, offset = 0) {
  return prisma.murphTransaction.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    skip: offset,
    select: {
      id: true,
      amount: true,
      txType: true,
      description: true,
      timestamp: true,
      userWallet: { select: { user: { select: { username: true } } } },
      agentWallet: { select: { agent: { select: { name: true } } } },
    },
  });
}

export async function getUserWalletBalance(userId: string) {
  return prisma.userWallet.findUnique({
    where: { userId },
    select: {
      murphBalance: true,
      solanaAddress: true,
      lastSync: true,
    },
  });
}

export async function getLeaderboard(limit = 20) {
  // Leaderboard by total XP (sum of xpEvents) and wallet balance
  const users = await prisma.user.findMany({
    take: limit,
    select: {
      id: true,
      username: true,
      displayName: true,
      avatarUrl: true,
      role: true,
      wallet: { select: { murphBalance: true } },
      xpEvents: { select: { amount: true } },
      streak: { select: { currentStreak: true } },
      factionMembership: { select: { faction: { select: { name: true, color: true } } } },
    },
    orderBy: { createdAt: 'asc' }, // Will be re-sorted by XP in application layer
  });

  // Calculate total XP per user and sort
  const withXp = users.map((u) => ({
    ...u,
    totalXp: u.xpEvents.reduce((sum, e) => sum + e.amount, 0),
    xpEvents: undefined,
  }));
  withXp.sort((a, b) => b.totalXp - a.totalXp);

  return withXp.slice(0, limit);
}

export async function getSeasons() {
  return prisma.season.findMany({
    orderBy: { number: 'desc' },
    select: {
      id: true,
      number: true,
      name: true,
      description: true,
      status: true,
      startedAt: true,
      endedAt: true,
      config: true,
      _count: { select: { matches: true } },
    },
  });
}

export async function getSeasonById(seasonId: string) {
  return prisma.season.findUnique({
    where: { id: seasonId },
    include: {
      matches: {
        orderBy: { startedAt: 'desc' },
        take: 10,
        select: {
          id: true,
          status: true,
          currentTurn: true,
          dramaScore: true,
          startedAt: true,
          endedAt: true,
        },
      },
    },
  });
}
