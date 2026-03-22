import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma: PrismaClient };

export const prisma = globalForPrisma.prisma || new PrismaClient({
  log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
});

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma;

// ── Match queries ──────────────────────────────────────────

export async function getActiveMatches() {
  return prisma.match.findMany({
    where: { status: 'active' },
    include: { matchAgents: { include: { agent: true } } },
    orderBy: { createdAt: 'desc' },
  });
}

export async function getMatchById(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      matchAgents: { include: { agent: true } },
      turns: { orderBy: { turnNumber: 'desc' }, take: 20 },
      alliances: true,
    },
  });
}

export async function createMatch(agentIds: string[], seasonId?: string) {
  return prisma.match.create({
    data: {
      status: 'pending',
      currentTurn: 0,
      maxTurns: 100,
      seasonId: seasonId || null,
      matchAgents: {
        create: agentIds.map(agentId => ({
          agentId,
          hp: 100,
          status: 'alive',
          position: JSON.stringify([Math.floor(Math.random()*10), Math.floor(Math.random()*10)]),
        })),
      },
    },
  });
}

// ── Agent queries ──────────────────────────────────────────

export async function getAgentById(agentId: string) {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: { memories: { orderBy: { createdAt: 'desc' }, take: 50 } },
  });
}

export async function getAllAgents() {
  return prisma.agent.findMany({
    where: { isActive: true },
    orderBy: { veritasScore: 'desc' },
  });
}

// ── Prediction queries ─────────────────────────────────────

export async function getOpenMarkets(matchId?: string) {
  return prisma.predictionMarket.findMany({
    where: { status: 'open', ...(matchId ? { matchId } : {}) },
    include: { options: true },
    orderBy: { createdAt: 'desc' },
  });
}

// ── User queries ───────────────────────────────────────────

export async function getUserByAddress(walletAddress: string) {
  return prisma.user.findUnique({ where: { walletAddress } });
}

export async function upsertUser(walletAddress: string, username?: string) {
  return prisma.user.upsert({
    where: { walletAddress },
    update: { lastActive: new Date() },
    create: { walletAddress, username: username || `user_${walletAddress.slice(-6)}`, xp: 0, level: 1, murphBalance: 0 },
  });
}
