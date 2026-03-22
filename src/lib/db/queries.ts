// Main database queries — using correct Prisma model names and field names
import { prisma } from './client';
import type { MatchStatus, AgentStatus } from '@prisma/client';

// ─── Match Queries ────────────────────────────────────────────────────────────

export async function getActiveMatches() {
  return prisma.match.findMany({
    where: { status: 'RUNNING' as MatchStatus },
    include: {
      participants: { include: { agent: true } },
      turns: { orderBy: { turnNumber: 'desc' }, take: 1 },
    },
    orderBy: { dramaScore: 'desc' },
  });
}

export async function getMatchById(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: { include: { agent: true } },
      turns: { orderBy: { turnNumber: 'desc' }, take: 10 },
      actions: { orderBy: { timestamp: 'desc' }, take: 20 },
    },
  });
}

export async function createMatch(data: {
  arenaId: string;
  seasonId?: string;
  gameMode?: string;
  maxTurns?: number;
}) {
  return prisma.match.create({
    data: {
      arenaId: data.arenaId,
      seasonId: data.seasonId,
      status: 'SCHEDULED' as MatchStatus,
      gameMode: (data.gameMode as any) || 'STANDARD_ELIMINATION',
      maxTurns: data.maxTurns || 100,
      config: {},
    },
  });
}

export async function updateMatchStatus(matchId: string, status: MatchStatus) {
  return prisma.match.update({
    where: { id: matchId },
    data: {
      status,
      ...(status === 'RUNNING' ? { startedAt: new Date() } : {}),
      ...(status === 'COMPLETED' ? { endedAt: new Date() } : {}),
    },
  });
}

// ─── Agent Queries ────────────────────────────────────────────────────────────

export async function getActiveAgents() {
  return prisma.agent.findMany({
    where: { status: 'ACTIVE' as AgentStatus },
    include: { personality: true },
    orderBy: { veritasScore: 'desc' },
  });
}

export async function getAgentById(agentId: string) {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      personality: true,
      wallet: true,
      memories: { take: 10, orderBy: { createdAt: 'desc' } },
    },
  });
}

export async function getAllAgents() {
  return prisma.agent.findMany({
    where: { status: 'ACTIVE' as AgentStatus },
    include: { personality: true },
    orderBy: { veritasScore: 'desc' },
  });
}

// ─── Prediction Queries ───────────────────────────────────────────────────────

export async function getActivePredictionPools(matchId?: string) {
  return prisma.predictionPool.findMany({
    where: { status: 'OPEN', ...(matchId ? { matchId } : {}) },
    include: { match: true },
    orderBy: { totalPool: 'desc' },
  });
}

export async function createPrediction(data: {
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

// ─── User Queries ─────────────────────────────────────────────────────────────

export async function getUserByAddress(walletAddress: string) {
  return prisma.user.findUnique({ where: { walletAddress } });
}

export async function upsertUser(walletAddress: string, username?: string) {
  return prisma.user.upsert({
    where: { walletAddress },
    update: { updatedAt: new Date() },
    create: {
      walletAddress,
      username: username || `user_${walletAddress.slice(-6)}`,
    },
  });
}

export async function getUserById(userId: string) {
  return prisma.user.findUnique({
    where: { id: userId },
    include: {
      wallet: true,
      streak: true,
      achievements: { include: { achievement: true } },
    },
  });
}

// ─── Economy Queries ──────────────────────────────────────────────────────────

export async function getRecentBurns(limit = 10) {
  return prisma.murphBurn.findMany({
    orderBy: { timestamp: 'desc' },
    take: limit,
  });
}

export async function createBurnEvent(data: {
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

export async function getTotalBurned() {
  const result = await prisma.murphBurn.aggregate({ _sum: { amount: true } });
  return result._sum.amount || 0;
}
