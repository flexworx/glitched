/**
 * Seasons Service — Season & Rules Engine
 * Full CRUD for Seasons, Challenges, Rules, Penalties, Instructions, Disputes
 */
import { prisma } from '@/lib/db/client';
import {
  SeasonStatus,
  ChallengeStatus,
  PenaltyType,
  DisputeStatus,
  InstructionDelivery,
} from '@prisma/client';

// ─── SEASONS ────────────────────────────────────────────────

export async function listSeasons() {
  return prisma.season.findMany({
    orderBy: { number: 'desc' },
    include: {
      _count: { select: { matches: true, challenges: true } },
      challenges: {
        orderBy: { orderIndex: 'asc' },
        select: { id: true, title: true, status: true, orderIndex: true, scheduledStartAt: true },
      },
    },
  });
}

export async function getSeasonById(id: string) {
  return prisma.season.findUnique({
    where: { id },
    include: {
      challenges: {
        orderBy: { orderIndex: 'asc' },
        include: {
          rules: { orderBy: { orderIndex: 'asc' } },
          penalties: true,
          _count: { select: { disputes: true, timerEvents: true } },
        },
      },
      standings: {
        orderBy: { rank: 'asc' },
        take: 20,
        include: { agent: { select: { id: true, name: true, archetype: true, signatureColor: true } } },
      },
      _count: { select: { matches: true, challenges: true } },
    },
  });
}

export async function createSeason(data: {
  number: number;
  name: string;
  description?: string;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  config?: object;
}) {
  return prisma.season.create({
    data: {
      number: data.number,
      name: data.name,
      description: data.description,
      status: SeasonStatus.UPCOMING,
      startedAt: data.scheduledStartAt,
      endedAt: data.scheduledEndAt,
      config: data.config ?? {},
    },
  });
}

export async function updateSeason(id: string, data: {
  name?: string;
  description?: string;
  status?: SeasonStatus;
  startedAt?: Date;
  endedAt?: Date;
  config?: object;
}) {
  return prisma.season.update({ where: { id }, data });
}

export async function activateSeason(id: string) {
  return prisma.season.update({
    where: { id },
    data: { status: SeasonStatus.ACTIVE, startedAt: new Date() },
  });
}

export async function endSeason(id: string) {
  return prisma.season.update({
    where: { id },
    data: { status: SeasonStatus.COMPLETED, endedAt: new Date() },
  });
}

// ─── CHALLENGES ─────────────────────────────────────────────

export async function listChallenges(seasonId: string) {
  return prisma.challenge.findMany({
    where: { seasonId },
    orderBy: { orderIndex: 'asc' },
    include: {
      rules: { orderBy: { orderIndex: 'asc' } },
      penalties: true,
      _count: { select: { disputes: true, operatorInstructions: true } },
    },
  });
}

export async function getChallengeById(id: string) {
  return prisma.challenge.findUnique({
    where: { id },
    include: {
      rules: { orderBy: { orderIndex: 'asc' }, include: { violations: { take: 10, orderBy: { appliedAt: 'desc' } } } },
      penalties: true,
      operatorInstructions: { orderBy: { createdAt: 'desc' }, take: 20 },
      disputes: { orderBy: { createdAt: 'desc' }, take: 20, include: { agent: { select: { id: true, name: true } }, filedByUser: { select: { id: true, username: true } } } },
      timerEvents: { orderBy: { scheduledAt: 'asc' } },
      season: { select: { id: true, name: true, number: true } },
    },
  });
}

export async function createChallenge(seasonId: string, data: {
  title: string;
  description: string;
  instructions: string;
  publicSummary: string;
  orderIndex?: number;
  scheduledStartAt?: Date;
  scheduledEndAt?: Date;
  durationMinutes?: number;
  complianceWindowMinutes?: number;
  targetAllAgents?: boolean;
  targetAgentIds?: string[];
  createdBy: string;
}) {
  const challenge = await prisma.challenge.create({
    data: {
      seasonId,
      title: data.title,
      description: data.description,
      instructions: data.instructions,
      publicSummary: data.publicSummary,
      status: ChallengeStatus.DRAFT,
      orderIndex: data.orderIndex ?? 0,
      scheduledStartAt: data.scheduledStartAt,
      scheduledEndAt: data.scheduledEndAt,
      durationMinutes: data.durationMinutes,
      complianceWindowMinutes: data.complianceWindowMinutes,
      targetAllAgents: data.targetAllAgents ?? true,
      targetAgentIds: data.targetAgentIds ?? [],
      createdBy: data.createdBy,
    },
  });

  // Auto-create timer events if scheduled times are set
  if (data.scheduledStartAt) {
    await prisma.challengeTimerEvent.create({
      data: {
        challengeId: challenge.id,
        eventType: 'CHALLENGE_START',
        scheduledAt: data.scheduledStartAt,
        payload: { challengeTitle: data.title },
      },
    });
  }
  if (data.scheduledEndAt) {
    await prisma.challengeTimerEvent.create({
      data: {
        challengeId: challenge.id,
        eventType: 'CHALLENGE_END',
        scheduledAt: data.scheduledEndAt,
        payload: { challengeTitle: data.title },
      },
    });
  }
  if (data.scheduledStartAt && data.complianceWindowMinutes) {
    const deadline = new Date(data.scheduledStartAt.getTime() + data.complianceWindowMinutes * 60000);
    await prisma.challengeTimerEvent.create({
      data: {
        challengeId: challenge.id,
        eventType: 'COMPLIANCE_DEADLINE',
        scheduledAt: deadline,
        payload: { complianceWindowMinutes: data.complianceWindowMinutes },
      },
    });
  }

  return challenge;
}

export async function updateChallenge(id: string, data: Partial<{
  title: string;
  description: string;
  instructions: string;
  publicSummary: string;
  status: ChallengeStatus;
  orderIndex: number;
  scheduledStartAt: Date;
  scheduledEndAt: Date;
  durationMinutes: number;
  complianceWindowMinutes: number;
  targetAllAgents: boolean;
  targetAgentIds: string[];
}>) {
  return prisma.challenge.update({ where: { id }, data });
}

export async function activateChallenge(id: string) {
  return prisma.challenge.update({
    where: { id },
    data: { status: ChallengeStatus.ACTIVE, actualStartAt: new Date() },
  });
}

export async function completeChallenge(id: string) {
  return prisma.challenge.update({
    where: { id },
    data: { status: ChallengeStatus.COMPLETED, actualEndAt: new Date() },
  });
}

// ─── RULES ──────────────────────────────────────────────────

export async function createRule(challengeId: string, data: {
  title: string;
  description: string;
  hasTimeLimit?: boolean;
  timeLimitMinutes?: number;
  violationPenaltyType?: PenaltyType;
  violationPenaltyAmount?: number;
  violationMessage?: string;
  orderIndex?: number;
}) {
  return prisma.challengeRule.create({
    data: {
      challengeId,
      title: data.title,
      description: data.description,
      hasTimeLimit: data.hasTimeLimit ?? false,
      timeLimitMinutes: data.timeLimitMinutes,
      violationPenaltyType: data.violationPenaltyType ?? PenaltyType.WARNING,
      violationPenaltyAmount: data.violationPenaltyAmount,
      violationMessage: data.violationMessage,
      orderIndex: data.orderIndex ?? 0,
    },
  });
}

export async function updateRule(id: string, data: Partial<{
  title: string;
  description: string;
  hasTimeLimit: boolean;
  timeLimitMinutes: number;
  violationPenaltyType: PenaltyType;
  violationPenaltyAmount: number;
  violationMessage: string;
  isActive: boolean;
  orderIndex: number;
}>) {
  return prisma.challengeRule.update({ where: { id }, data });
}

export async function deleteRule(id: string) {
  return prisma.challengeRule.delete({ where: { id } });
}

// ─── PENALTIES ──────────────────────────────────────────────

export async function createPenalty(challengeId: string, data: {
  name: string;
  description: string;
  penaltyType: PenaltyType;
  amount?: number;
  triggerCondition: string;
  autoApply?: boolean;
}) {
  return prisma.challengePenalty.create({
    data: { challengeId, ...data, autoApply: data.autoApply ?? false },
  });
}

export async function applyViolation(data: {
  ruleId: string;
  agentId: string;
  matchId?: string;
  penaltyType: PenaltyType;
  penaltyAmount?: number;
  reason: string;
  appliedBy: string;
}) {
  return prisma.ruleViolation.create({ data });
}

export async function listViolations(agentId?: string, ruleId?: string) {
  return prisma.ruleViolation.findMany({
    where: {
      ...(agentId ? { agentId } : {}),
      ...(ruleId ? { ruleId } : {}),
    },
    orderBy: { appliedAt: 'desc' },
    take: 50,
    include: {
      agent: { select: { id: true, name: true, signatureColor: true } },
      rule: { select: { id: true, title: true, challengeId: true } },
      dispute: { select: { id: true, status: true } },
    },
  });
}

// ─── OPERATOR INSTRUCTIONS ──────────────────────────────────

export async function sendInstruction(data: {
  challengeId?: string;
  matchId?: string;
  operatorId: string;
  delivery: InstructionDelivery;
  whisperText: string;
  bigScreenText?: string;
  targetAllAgents?: boolean;
  targetAgentIds?: string[];
  complianceWindowMinutes?: number;
}) {
  const complianceDeadline = data.complianceWindowMinutes
    ? new Date(Date.now() + data.complianceWindowMinutes * 60000)
    : undefined;

  const instruction = await prisma.operatorInstruction.create({
    data: {
      challengeId: data.challengeId,
      matchId: data.matchId,
      operatorId: data.operatorId,
      delivery: data.delivery,
      whisperText: data.whisperText,
      bigScreenText: data.bigScreenText,
      targetAllAgents: data.targetAllAgents ?? false,
      targetAgentIds: data.targetAgentIds ?? [],
      complianceWindowMinutes: data.complianceWindowMinutes,
      complianceDeadline,
      isDelivered: false,
    },
  });

  // Create delivery log entries for each targeted agent
  const agentIds: string[] = data.targetAllAgents
    ? (await prisma.agent.findMany({ where: { status: { in: ['ACTIVE', 'COMPETING'] } }, select: { id: true } })).map(a => a.id)
    : (data.targetAgentIds ?? []);

  if (agentIds.length > 0) {
    await prisma.instructionDeliveryLog.createMany({
      data: agentIds.map(agentId => ({
        instructionId: instruction.id,
        agentId,
      })),
    });
  }

  // Mark as delivered
  await prisma.operatorInstruction.update({
    where: { id: instruction.id },
    data: { isDelivered: true, deliveredAt: new Date() },
  });

  return instruction;
}

export async function listInstructions(challengeId?: string, matchId?: string) {
  return prisma.operatorInstruction.findMany({
    where: {
      ...(challengeId ? { challengeId } : {}),
      ...(matchId ? { matchId } : {}),
    },
    orderBy: { createdAt: 'desc' },
    take: 50,
    include: {
      agentDeliveries: {
        include: { agent: { select: { id: true, name: true, signatureColor: true } } },
      },
    },
  });
}

export async function getPendingInstructionsForAgent(agentId: string) {
  return prisma.instructionDeliveryLog.findMany({
    where: { agentId, wasAcknowledged: false },
    include: { instruction: true },
    orderBy: { deliveredAt: 'asc' },
  });
}

export async function acknowledgeInstruction(instructionId: string, agentId: string, turnNumber: number) {
  return prisma.instructionDeliveryLog.updateMany({
    where: { instructionId, agentId },
    data: { wasAcknowledged: true, injectedIntoTurn: turnNumber },
  });
}

// ─── DISPUTES ───────────────────────────────────────────────

export async function fileDispute(data: {
  violationId?: string;
  challengeId?: string;
  filedBy: string;
  agentId: string;
  disputeReason: string;
  evidenceText?: string;
}) {
  return prisma.dispute.create({
    data: {
      violationId: data.violationId,
      challengeId: data.challengeId,
      filedBy: data.filedBy,
      agentId: data.agentId,
      disputeReason: data.disputeReason,
      evidenceText: data.evidenceText,
      status: DisputeStatus.PENDING,
    },
  });
}

export async function listDisputes(status?: DisputeStatus) {
  return prisma.dispute.findMany({
    where: status ? { status } : {},
    orderBy: { createdAt: 'desc' },
    include: {
      agent: { select: { id: true, name: true, signatureColor: true } },
      filedByUser: { select: { id: true, username: true, displayName: true } },
      violation: { include: { rule: { select: { id: true, title: true } } } },
      challenge: { select: { id: true, title: true } },
    },
  });
}

export async function reviewDispute(id: string, data: {
  reviewedBy: string;
  status: DisputeStatus;
  reviewNotes: string;
  penaltyReversed?: boolean;
}) {
  return prisma.dispute.update({
    where: { id },
    data: {
      status: data.status,
      reviewedBy: data.reviewedBy,
      reviewNotes: data.reviewNotes,
      reviewedAt: new Date(),
      penaltyReversed: data.penaltyReversed ?? false,
    },
  });
}

// ─── BIG SCREEN ─────────────────────────────────────────────

export async function getBigScreenData(matchId: string) {
  const match = await prisma.match.findUnique({
    where: { id: matchId },
    select: { id: true, seasonId: true, status: true, currentTurn: true, dramaScore: true },
  });

  if (!match?.seasonId) return null;

  // Get the currently active challenge for this season
  const activeChallenge = await prisma.challenge.findFirst({
    where: { seasonId: match.seasonId, status: ChallengeStatus.ACTIVE },
    include: {
      rules: { where: { isActive: true }, orderBy: { orderIndex: 'asc' } },
      penalties: true,
      timerEvents: {
        where: { wasFired: false },
        orderBy: { scheduledAt: 'asc' },
        take: 3,
      },
    },
  });

  // Get latest BIG_SCREEN messages for this match
  const bigScreenMessages = await prisma.matchMessage.findMany({
    where: { matchId, isBigScreen: true },
    orderBy: { timestamp: 'desc' },
    take: 5,
    include: { sender: { select: { id: true, name: true, signatureColor: true } } },
  });

  // Get recent violations
  const recentViolations = activeChallenge
    ? await prisma.ruleViolation.findMany({
        where: { rule: { challengeId: activeChallenge.id } },
        orderBy: { appliedAt: 'desc' },
        take: 5,
        include: { agent: { select: { id: true, name: true, signatureColor: true } } },
      })
    : [];

  return {
    match,
    activeChallenge,
    bigScreenMessages,
    recentViolations,
    serverTime: new Date().toISOString(),
  };
}

// ─── TIMER ENGINE HELPERS ────────────────────────────────────

export async function getPendingTimerEvents() {
  return prisma.challengeTimerEvent.findMany({
    where: {
      wasFired: false,
      scheduledAt: { lte: new Date() },
    },
    include: { challenge: { include: { season: { select: { id: true, name: true } } } } },
    orderBy: { scheduledAt: 'asc' },
  });
}

export async function markTimerEventFired(id: string) {
  return prisma.challengeTimerEvent.update({
    where: { id },
    data: { wasFired: true, firedAt: new Date() },
  });
}
