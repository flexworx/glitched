/**
 * RADF v3 — Agents Service
 * Single source of truth for all agent data operations.
 * All field names verified against prisma/schema.prisma.
 */
import { prisma } from '@/lib/db/client';
import { Prisma } from '@prisma/client';

export interface AgentListFilters {
  type?: 'pantheon' | 'byoa';
  status?: string;
  limit?: number;
  offset?: number;
}

export async function listAgents(filters: AgentListFilters = {}) {
  const where: Prisma.AgentWhereInput = {};
  if (filters.status) where.status = filters.status as any;
  if (filters.type === 'pantheon') where.isPantheon = true;
  if (filters.type === 'byoa') where.isByoa = true;

  const [agents, total] = await Promise.all([
    prisma.agent.findMany({
      where,
      select: {
        id: true,
        name: true,
        archetype: true,
        mbti: true,
        enneagram: true,
        backstory: true,
        status: true,
        veritasScore: true,
        veritasTier: true,
        signatureColor: true,
        avatarUrl: true,
        isPantheon: true,
        isByoa: true,
        totalWins: true,
        totalMatches: true,
        createdAt: true,
      },
      take: filters.limit ?? 50,
      skip: filters.offset ?? 0,
      orderBy: { veritasScore: 'desc' },
    }),
    prisma.agent.count({ where }),
  ]);

  return { agents, total };
}

export async function getAgentById(agentId: string) {
  return prisma.agent.findUnique({
    where: { id: agentId },
    include: {
      personality: true,
      wallet: true,
      matchParticipations: {
        take: 10,
        orderBy: { match: { startedAt: 'desc' } },
        include: { match: { select: { id: true, status: true, startedAt: true, endedAt: true } } },
      },
    },
  });
}

export async function getAgentMemories(agentId: string, limit = 10) {
  return prisma.agentMemory.findMany({
    where: { agentId },
    orderBy: [{ emotionalWeight: 'desc' }, { createdAt: 'desc' }],
    take: limit,
    select: {
      id: true,
      memoryType: true,
      content: true,
      emotionalWeight: true,
      turnNumber: true,
      createdAt: true,
    },
  });
}

export async function getAgentDreams(agentId: string, limit = 5) {
  return prisma.agentDream.findMany({
    where: { agentId },
    orderBy: { generatedAt: 'desc' },
    take: limit,
    select: {
      id: true,
      content: true,
      dreamType: true,
      generatedAt: true,
    },
  });
}

export interface CreateByoaAgentInput {
  name: string;
  archetype: string;
  backstory: string;
  tagline?: string;
  signatureColor?: string;
  mbti?: string;
  enneagram?: string;
  traits?: Record<string, number>;
  beliefs?: {
    tier1Ethics: string[];
    tier2Mantras: string[];
    tier3RoleBeliefs: string[];
  };
  skillPackId?: string;
  detractorType?: string;
  creatorId: string;
}

export async function createByoaAgent(input: CreateByoaAgentInput) {
  return prisma.$transaction(async (tx) => {
    const agent = await tx.agent.create({
      data: {
        name: input.name.toUpperCase(),
        archetype: input.archetype,
        backstory: input.backstory,
        signatureColor: input.signatureColor ?? '#39FF14',
        mbti: input.mbti ?? 'INTJ',
        enneagram: input.enneagram ?? '5',
        isPantheon: false,
        isByoa: true,
        status: 'ACTIVE',
        operatorId: input.creatorId,
      },
    });

    // Build personality data from traits map
    const traitData: Record<string, number> = {};
    if (input.traits) {
      const traitMap: Record<string, string> = {
        openness: 'openness', conscientiousness: 'conscientiousness',
        extraversion: 'extraversion', agreeableness: 'agreeableness',
        neuroticism: 'neuroticism', directness: 'directness',
        formality: 'formality', verbosity: 'verbosity', humor: 'humor',
        empathy: 'empathy', riskTolerance: 'riskTolerance',
        deceptionAptitude: 'deceptionAptitude', loyaltyBias: 'loyaltyBias',
        competitiveness: 'competitiveness', adaptability: 'adaptability',
        emotionality: 'emotionality', impulsivity: 'impulsivity',
        resilience: 'resilience', jealousy: 'jealousy', pride: 'pride',
        assertiveness: 'assertiveness', persuasiveness: 'persuasiveness',
        trustingness: 'trustingness', dominance: 'dominance',
        cooperativeness: 'cooperativeness', analyticalThinking: 'analyticalThinking',
        creativity: 'creativity', patience: 'patience',
        decisionSpeed: 'decisionSpeed', memoryRetention: 'memoryRetention',
        moralFlexibility: 'moralFlexibility', vengefulness: 'vengefulness',
        generosity: 'generosity', urgencyBias: 'urgencyBias',
      };
      for (const [key, prismaKey] of Object.entries(traitMap)) {
        if (input.traits[key] !== undefined) {
          traitData[prismaKey] = input.traits[key] / 100; // Normalize 0-100 to 0-1
        }
      }
    }

    await tx.agentPersonality.create({
      data: {
        agentId: agent.id,
        ...traitData,
        tier1Beliefs: (input.beliefs?.tier1Ethics ?? []) as any,
        tier2Beliefs: (input.beliefs?.tier2Mantras ?? []) as any,
        tier3Beliefs: (input.beliefs?.tier3RoleBeliefs ?? []) as any,
        capabilities: [] as any,
        guardrails: [] as any,
      },
    });

    await tx.agentWallet.create({
      data: {
        agentId: agent.id,
        murphBalance: 0,
      },
    });

    return agent;
  });
}
