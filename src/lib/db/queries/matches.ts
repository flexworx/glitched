import prisma from '../client';

export async function getMatchById(id: string) {
  return prisma.match.findUnique({
    where: { id },
    include: { agents: true, actions: { orderBy: { turn: 'desc' }, take: 20 } },
  });
}

export async function getActiveMatches() {
  return prisma.match.findMany({
    where: { status: 'active' },
    orderBy: { startedAt: 'desc' },
  });
}

export async function createMatch(agentIds: string[], maxTurns = 100) {
  const matchId = `match-${Date.now()}`;
  return prisma.match.create({
    data: {
      id: matchId,
      status: 'pending',
      turn: 0,
      maxTurns,
      phase: 'early_game',
      dramaScore: 0,
      agents: { connect: agentIds.map(id => ({ id })) },
    },
  });
}

export async function advanceTurn(matchId: string) {
  return prisma.match.update({
    where: { id: matchId },
    data: { turn: { increment: 1 } },
  });
}
