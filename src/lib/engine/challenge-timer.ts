/**
 * Challenge Timer Engine
 * Processes active challenges, checks time limits, and fires penalties
 * Called by the /api/engine/cron endpoint every minute
 */

import { prisma } from '@/lib/db/client';
import { logger } from '@/lib/logger';

export interface TimerTickResult {
  challengesProcessed: number;
  penaltiesFired: number;
  challengesExpired: number;
  errors: string[];
}

export async function processChallengeTick(): Promise<TimerTickResult> {
  const result: TimerTickResult = {
    challengesProcessed: 0,
    penaltiesFired: 0,
    challengesExpired: 0,
    errors: [],
  };

  const now = new Date();

  try {
    // 1. Find all active challenges
    const activeChallenges = await prisma.challenge.findMany({
      where: { status: 'ACTIVE' },
      include: {
        rules: { where: { isActive: true, hasTimeLimit: true }, orderBy: { orderIndex: 'asc' } },
        season: { select: { id: true, name: true } },
      },
    });

    result.challengesProcessed = activeChallenges.length;

    for (const challenge of activeChallenges) {
      try {
        // 2. Check if the challenge itself has expired
        if (challenge.scheduledEndAt && challenge.scheduledEndAt <= now) {
          await expireChallenge(challenge.id, challenge.title);
          result.challengesExpired++;
          continue;
        }

        // 3. Check compliance window — if complianceWindowMinutes is set,
        //    check if agents have been given enough time to comply
        if (challenge.complianceWindowMinutes && challenge.actualStartAt) {
          const complianceDeadline = new Date(
            challenge.actualStartAt.getTime() + challenge.complianceWindowMinutes * 60 * 1000
          );

          if (now >= complianceDeadline) {
            // Fire penalties for non-compliant agents
            const penaltiesFired = await fireCompliancePenalties(challenge);
            result.penaltiesFired += penaltiesFired;
          }
        }

        // 4. Check individual rule time limits
        for (const rule of challenge.rules) {
          if (!rule.timeLimitMinutes || !challenge.actualStartAt) continue;

          const ruleDeadline = new Date(
            challenge.actualStartAt.getTime() + rule.timeLimitMinutes * 60 * 1000
          );

          if (now >= ruleDeadline) {
            const penaltiesFired = await fireRulePenalties(challenge.id, rule);
            result.penaltiesFired += penaltiesFired;
          }
        }
      } catch (err) {
        const msg = `Error processing challenge ${challenge.id}: ${err instanceof Error ? err.message : 'Unknown'}`;
        result.errors.push(msg);
        logger.error(msg);
      }
    }

    // 5. Auto-activate scheduled challenges whose start time has arrived
    const scheduledToActivate = await prisma.challenge.findMany({
      where: {
        status: 'SCHEDULED',
      },
      select: { id: true, title: true, seasonId: true },
    });

    for (const challenge of scheduledToActivate) {
      await prisma.challenge.update({
        where: { id: challenge.id },
        data: { status: 'ACTIVE', actualStartAt: now },
      });
      logger.info(`Auto-activated challenge: ${challenge.title} (${challenge.id})`);
    }

    // 6. Auto-activate scheduled seasons
    const seasonsToActivate = await prisma.season.findMany({
      where: {
        status: 'UPCOMING',
      },
      select: { id: true, name: true },
    });

    for (const season of seasonsToActivate) {
      await prisma.season.update({
        where: { id: season.id },
        data: { status: 'ACTIVE', startedAt: now },
      });
      logger.info(`Auto-activated season: ${season.name} (${season.id})`);
    }

    // 7. Auto-end scheduled seasons
    const seasonsToEnd = await prisma.season.findMany({
      where: {
        status: 'ACTIVE',
        endedAt: { lte: now },
      },
      select: { id: true, name: true },
    });

    for (const season of seasonsToEnd) {
      await prisma.season.update({
        where: { id: season.id },
        data: { status: 'COMPLETED', endedAt: now },
      });
      logger.info(`Auto-ended season: ${season.name} (${season.id})`);
    }

  } catch (err) {
    const msg = `Challenge timer tick failed: ${err instanceof Error ? err.message : 'Unknown'}`;
    result.errors.push(msg);
    logger.error(msg);
  }

  return result;
}

async function expireChallenge(challengeId: string, title: string): Promise<void> {
  await prisma.challenge.update({
    where: { id: challengeId },
    data: { status: 'COMPLETED', actualEndAt: new Date() },
  });
  logger.info(`Challenge expired: ${title} (${challengeId})`);
}

interface RuleWithTimeLimit {
  id: string;
  title: string;
  timeLimitMinutes: number | null;
  violationPenaltyType: string;
  violationPenaltyAmount: number | null;
  violationMessage: string | null;
}

async function fireRulePenalties(challengeId: string, rule: RuleWithTimeLimit): Promise<number> {
  // Check if penalty was already fired for this rule
  const existingPenalty = await prisma.ruleViolation.findFirst({
    where: {
      ruleId: rule.id,
      reason: `TIME_LIMIT_EXCEEDED:${rule.id}`,
    },
  });

  if (existingPenalty) return 0; // Already fired

  // Get all active match participants for this challenge's active matches
  const activeMatches = await prisma.match.findMany({
    where: { status: 'RUNNING' },
    include: {
      participants: {
        where: { isEliminated: false },
        include: { agent: { select: { id: true, name: true } } },
      },
    },
  });

  let penaltiesApplied = 0;

  for (const match of activeMatches) {
    for (const participant of match.participants) {
      await prisma.ruleViolation.create({
        data: {
          ruleId: rule.id,
          agentId: participant.agentId,
          matchId: match.id,
          penaltyType: rule.violationPenaltyType as any,
          penaltyAmount: rule.violationPenaltyAmount ?? undefined,
          reason: `TIME_LIMIT_EXCEEDED:${rule.id}`,
          appliedBy: 'SYSTEM',
        },
      });

      // Apply HP loss if applicable
      if (rule.violationPenaltyType === 'HP_LOSS' && rule.violationPenaltyAmount) {
        await prisma.matchParticipant.update({
          where: { id: participant.id },
          data: {
            currentState: { update: { hp: { decrement: rule.violationPenaltyAmount } } },
          } as any,
        });
      }

      penaltiesApplied++;
      logger.info(`Penalty fired: ${rule.violationPenaltyType} on agent ${participant.agent.name} for rule "${rule.title}"`);
    }
  }

  return penaltiesApplied;
}

interface ChallengeWithRules {
  id: string;
  title: string;
  complianceWindowMinutes: number | null;
  actualStartAt: Date | null;
  rules: RuleWithTimeLimit[];
}

async function fireCompliancePenalties(challenge: ChallengeWithRules): Promise<number> {
  // Check if compliance penalties were already fired
  const existingPenalty = await prisma.ruleViolation.findFirst({
    where: {
      agentId: { not: undefined },
      reason: 'COMPLIANCE_WINDOW_EXCEEDED',
      rule: { challengeId: challenge.id },
    },
  });

  if (existingPenalty) return 0;

  // Get the first active rule with a penalty for non-compliance
  const complianceRule = challenge.rules[0];
  if (!complianceRule) return 0;

  return fireRulePenalties(challenge.id, {
    ...complianceRule,
    violationMessage: `Compliance window exceeded for challenge: ${challenge.title}`,
  });
}
