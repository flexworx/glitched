/**
 * RADF v3 — Admin Service
 * All admin operations are DB-backed and audit-logged.
 * No fake system stats. All data from real Prisma queries.
 */
import { prisma } from '@/lib/db/client';

export async function getSystemStats() {
  const [
    totalUsers,
    totalAgents,
    activeMatches,
    totalMatches,
    totalBurned,
    openPredictions,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.agent.count(),
    prisma.match.count({ where: { status: 'RUNNING' } }),
    prisma.match.count(),
    prisma.murphBurn.aggregate({ _sum: { amount: true } }),
    prisma.predictionPool.count({ where: { status: 'OPEN' } }),
  ]);

  return {
    totalUsers,
    totalAgents,
    activeMatches,
    totalMatches,
    totalMurphBurned: totalBurned._sum.amount ?? 0,
    openPredictions,
  };
}

export async function getAdminMatchList(limit = 20) {
  return prisma.match.findMany({
    orderBy: { startedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      status: true,
      currentTurn: true,
      maxTurns: true,
      dramaScore: true,
      startedAt: true,
      endedAt: true,
      participants: {
        select: { agent: { select: { id: true, name: true } }, isEliminated: true },
      },
    },
  });
}

export async function adminStartMatch(matchId: string, adminId: string) {
  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');
    if (match.status !== 'SCHEDULED') throw new Error('Match is not in SCHEDULED state');

    const updated = await tx.match.update({
      where: { id: matchId },
      data: { status: 'RUNNING', startedAt: new Date() },
    });

    await tx.adminLog.create({
      data: {
        adminId,
        action: 'START_MATCH',
        targetType: 'MATCH',
        targetId: matchId,
        details: { previousStatus: match.status },
      },
    });

    return updated;
  });
}

export async function adminStopMatch(matchId: string, adminId: string, reason: string) {
  return prisma.$transaction(async (tx) => {
    const match = await tx.match.findUnique({ where: { id: matchId } });
    if (!match) throw new Error('Match not found');
    if (!['ACTIVE', 'SCHEDULED'].includes(match.status)) {
      throw new Error('Match cannot be stopped in its current state');
    }

    const updated = await tx.match.update({
      where: { id: matchId },
      data: { status: 'CANCELLED', endedAt: new Date() },
    });

    await tx.adminLog.create({
      data: {
        adminId,
        action: 'STOP_MATCH',
        targetType: 'MATCH',
        targetId: matchId,
        details: { reason, previousStatus: match.status },
      },
    });

    return updated;
  });
}

export async function getAdminLogs(limit = 50) {
  return prisma.adminLog.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
    select: {
      id: true,
      adminId: true,
      action: true,
      targetType: true,
      targetId: true,
      details: true,
      timestamp: true,
    },
  });
}

export async function getEconomyStats() {
  const [burns, transactions, totalSupply] = await Promise.all([
    prisma.murphBurn.findMany({
      orderBy: { timestamp: 'desc' },
      take: 10,
      select: { id: true, amount: true, burnReason: true, matchId: true, timestamp: true },
    }),
    prisma.murphTransaction.findMany({
      orderBy: { timestamp: 'desc' },
      take: 20,
      select: { id: true, amount: true, txType: true, description: true, timestamp: true },
    }),
    prisma.murphBurn.aggregate({ _sum: { amount: true } }),
  ]);

  return {
    recentBurns: burns,
    recentTransactions: transactions,
    totalBurned: totalSupply._sum.amount ?? 0,
  };
}

export async function listUsersForAdmin(limit = 50, offset = 0) {
  return prisma.user.findMany({
    take: limit,
    skip: offset,
    orderBy: { createdAt: 'desc' },
    select: {
      id: true,
      username: true,
      displayName: true,
      walletAddress: true,
      role: true,
      createdAt: true,
      wallet: { select: { murphBalance: true } },
    },
  });
}

export async function updateUserRole(
  targetUserId: string,
  newRole: string,
  adminId: string
) {
  return prisma.$transaction(async (tx) => {
    const updated = await tx.user.update({
      where: { id: targetUserId },
      data: { role: newRole as any },
      select: { id: true, username: true, role: true },
    });

    await tx.adminLog.create({
      data: {
        adminId,
        action: 'UPDATE_USER_ROLE',
        targetType: 'USER',
        targetId: targetUserId,
        details: { newRole },
      },
    });

    return updated;
  });
}
