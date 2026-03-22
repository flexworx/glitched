/**
 * RADF v3 — Matches Service
 * Authoritative source for match creation, retrieval, and state management.
 * All field names verified against prisma/schema.prisma.
 */
import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export interface MatchListFilters {
  status?: string;
  seasonId?: string;
  limit?: number;
  offset?: number;
}

export async function listMatches(filters: MatchListFilters = {}) {
  const where: Prisma.MatchWhereInput = {};
  if (filters.status) where.status = filters.status as any;
  if (filters.seasonId) where.seasonId = filters.seasonId;

  const [matches, total] = await Promise.all([
    prisma.match.findMany({
      where,
      select: {
        id: true,
        status: true,
        currentPhase: true,
        currentTurn: true,
        maxTurns: true,
        dramaScore: true,
        startedAt: true,
        endedAt: true,
        seasonId: true,
        participants: {
          select: {
            agentId: true,
            isEliminated: true,
            finalRank: true,
            agent: { select: { id: true, name: true, signatureColor: true, archetype: true } },
          },
        },
      },
      take: filters.limit ?? 20,
      skip: filters.offset ?? 0,
      orderBy: { startedAt: 'desc' },
    }),
    prisma.match.count({ where }),
  ]);

  return { matches, total };
}

export async function getMatchById(matchId: string) {
  return prisma.match.findUnique({
    where: { id: matchId },
    include: {
      participants: {
        include: {
          agent: {
            select: {
              id: true,
              name: true,
              archetype: true,
              signatureColor: true,
              mbti: true,
              veritasScore: true,
              personality: true,
            },
          },
        },
      },
      predictions: true,
    },
  });
}

export async function getMatchState(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: {
      id: true,
      status: true,
      currentPhase: true,
      currentTurn: true,
      maxTurns: true,
      dramaScore: true,
      participants: {
        select: {
          agentId: true,
          isEliminated: true,
          creditsEarned: true,
          agent: { select: { id: true, name: true, signatureColor: true } },
        },
      },
    },
  });

  // Get the latest MatchState snapshot
  const latestState = await prisma.matchState.findFirst({
    where: { matchId },
    orderBy: { turnNumber: 'desc' },
    select: { boardState: true, agentStates: true, eventLog: true, turnNumber: true },
  });

  return { ...match, latestState };
}

export async function getMatchReplay(matchId: string) {
  return prisma.matchAction.findMany({
    where: { matchId },
    orderBy: { timestamp: 'asc' },
    select: {
      id: true,
      actionType: true,
      agentId: true,
      targetAgentId: true,
      actionData: true,
      result: true,
      wasValid: true,
      timestamp: true,
    },
  });
}

export interface CreateMatchInput {
  agentIds: string[];
  seasonId?: string;
  arenaId?: string;
  maxTurns?: number;
  gameMode?: string;
}

export async function createMatch(input: CreateMatchInput) {
  return prisma.$transaction(async (tx) => {
    // Verify agents exist
    const agents = await tx.agent.findMany({
      where: { id: { in: input.agentIds }, status: 'ACTIVE' },
      select: { id: true },
    });
    if (agents.length < 2) {
      throw new Error('At least 2 active agents are required to create a match');
    }

    // Get or create a default arena
    let arenaId = input.arenaId;
    if (!arenaId) {
      const defaultArena = await tx.arena.findFirst({ where: { isActive: true }, select: { id: true } });
      if (!defaultArena) throw new Error('No active arena found. Please create an arena first.');
      arenaId = defaultArena.id;
    }

    const match = await tx.match.create({
      data: {
        arenaId,
        seasonId: input.seasonId ?? null,
        maxTurns: input.maxTurns ?? 100,
        gameMode: (input.gameMode as any) ?? 'STANDARD_ELIMINATION',
        status: 'SCHEDULED',
      },
    });

    await tx.matchParticipant.createMany({
      data: agents.map((a) => ({
        matchId: match.id,
        agentId: a.id,
        startingPosition: {},
      })),
    });

    // Create prediction pool for the match
    await tx.predictionPool.create({
      data: {
        matchId: match.id,
        status: 'OPEN',
        totalPool: 0,
        outcomeOdds: {},
      },
    });

    return match;
  });
}
