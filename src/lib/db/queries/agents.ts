import prisma from '../client';

export async function getAgentById(id: string) {
  return prisma.agent.findUnique({ where: { id } });
}

export async function getAllAgents(type?: string) {
  return prisma.agent.findMany({
    where: type ? { type } : undefined,
    orderBy: { veritasScore: 'desc' },
  });
}

export async function updateAgentVeritas(agentId: string, delta: number) {
  return prisma.agent.update({
    where: { id: agentId },
    data: { veritasScore: { increment: delta } },
  });
}

export async function recordMatchResult(agentId: string, won: boolean) {
  return prisma.agent.update({
    where: { id: agentId },
    data: {
      wins: won ? { increment: 1 } : undefined,
      losses: won ? undefined : { increment: 1 },
      totalMatches: { increment: 1 },
    },
  });
}
