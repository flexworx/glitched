import { prisma } from '../client';
import type { AgentStatus } from '@prisma/client';

export async function getAgentsByType(type?: string) {
  return prisma.agent.findMany({
    where: type ? { archetype: type } : undefined,
    include: { personality: true },
    orderBy: { veritasScore: 'desc' },
  });
}

export async function updateAgentStats(agentId: string, data: {
  totalWins?: number;
  totalMatches?: number;
  veritasScore?: number;
}) {
  return prisma.agent.update({
    where: { id: agentId },
    data: {
      ...(data.totalWins !== undefined ? { totalWins: data.totalWins } : {}),
      ...(data.totalMatches !== undefined ? { totalMatches: data.totalMatches } : {}),
      ...(data.veritasScore !== undefined ? { veritasScore: data.veritasScore } : {}),
    },
  });
}

export async function getAgentLeaderboard(limit = 20) {
  return prisma.agent.findMany({
    where: { status: 'ACTIVE' as AgentStatus },
    orderBy: { veritasScore: 'desc' },
    take: limit,
    include: { personality: true },
  });
}
