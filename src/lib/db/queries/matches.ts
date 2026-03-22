import { prisma } from '../client';
import type { MatchStatus } from '@prisma/client';

export async function getRecentActions(matchId: string, limit = 20) {
  return prisma.matchAction.findMany({
    where: { matchId },
    orderBy: { timestamp: 'desc' },
    take: limit,
    include: { agent: true, targetAgent: true },
  });
}

export async function getActiveMatches() {
  return prisma.match.findMany({
    where: { status: 'RUNNING' as MatchStatus },
    include: { participants: { include: { agent: true } } },
    orderBy: { dramaScore: 'desc' },
  });
}

export async function startMatch(matchId: string) {
  return prisma.match.update({
    where: { id: matchId },
    data: { status: 'RUNNING' as MatchStatus, startedAt: new Date() },
  });
}

export async function endMatch(matchId: string, winnerId?: string) {
  return prisma.match.update({
    where: { id: matchId },
    data: {
      status: 'COMPLETED' as MatchStatus,
      endedAt: new Date(),
      ...(winnerId ? { winnerId } : {}),
    },
  });
}

export async function incrementMatchTurn(matchId: string) {
  return prisma.match.update({
    where: { id: matchId },
    data: { currentTurn: { increment: 1 } },
  });
}
