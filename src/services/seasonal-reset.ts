/**
 * Seasonal Reset Service
 * Handles end-of-season archiving, reward distribution, and status tier upgrades.
 * Models: Agent, User, Season, SeasonStanding, MurphTransaction, UserAchievement
 */

import { prisma } from '@/lib/db/client';
import type { HumanStatusTier } from '@prisma/client';

// ─── Status Tier Thresholds ────────────────────────────────────────────────────
const STATUS_TIER_THRESHOLDS: Array<{ tier: HumanStatusTier; minMurph: number }> = [
  { tier: 'SENTIENT',   minMurph: 100_000 },
  { tier: 'EMERGENT',   minMurph: 50_000  },
  { tier: 'SYNTHETIC',  minMurph: 25_000  },
  { tier: 'COGNITIVE',  minMurph: 10_000  },
  { tier: 'NEURAL',     minMurph: 5_000   },
  { tier: 'AUTOMATON',  minMurph: 1_000   },
  { tier: 'BOOTLOADER', minMurph: 0       },
];

function calculateStatusTier(lifetimeMurph: number): HumanStatusTier {
  for (const { tier, minMurph } of STATUS_TIER_THRESHOLDS) {
    if (lifetimeMurph >= minMurph) return tier;
  }
  return 'BOOTLOADER';
}

// ─── Season Reward Tiers ───────────────────────────────────────────────────────
const SEASON_REWARD_TIERS = [
  { maxRank: 1,   murphReward: 5000, xpBonus: 2000, title: 'Season Champion' },
  { maxRank: 3,   murphReward: 2500, xpBonus: 1000, title: 'Top 3 Finalist'  },
  { maxRank: 10,  murphReward: 1000, xpBonus: 500,  title: 'Top 10 Contender' },
  { maxRank: 25,  murphReward: 500,  xpBonus: 250,  title: 'Season Veteran'  },
  { maxRank: 999, murphReward: 100,  xpBonus: 100,  title: 'Season Participant' },
];

function getRewardTier(rank: number) {
  return SEASON_REWARD_TIERS.find((t) => rank <= t.maxRank) ?? SEASON_REWARD_TIERS[SEASON_REWARD_TIERS.length - 1];
}

// ─── Main Functions ────────────────────────────────────────────────────────────

/**
 * Calculate and store season rewards for all agents in a season.
 */
export async function calculateSeasonRewards(seasonId: string): Promise<void> {
  const standings = await prisma.seasonStanding.findMany({
    where: { seasonId },
    include: { agent: { select: { id: true, operatorId: true } } },
    orderBy: { rank: 'asc' },
  });

  if (standings.length === 0) {
    console.log(`[seasonal-reset] No standings found for season ${seasonId}`);
    return;
  }

  console.log(`[seasonal-reset] Calculating rewards for ${standings.length} agents in season ${seasonId}`);

  for (const standing of standings) {
    const rank = standing.rank ?? 999;
    const reward = getRewardTier(rank);

    // Update agent wallet balance
    await prisma.agent.update({
      where: { id: standing.agentId },
      data: { totalCredits: { increment: reward.murphReward } },
    });

    // If agent has a human operator, credit them too
    if (standing.agent.operatorId) {
      await prisma.user.update({
        where: { id: standing.agent.operatorId },
        data: {
          lifetimeMurph: { increment: reward.murphReward },
          seasonMurph: { increment: reward.murphReward },
        },
      });

      // Record the transaction
      await prisma.murphTransaction.create({
        data: {
          amount: reward.murphReward,
          txType: 'MATCH_REWARD',
          description: `Season ${seasonId} reward — Rank #${rank} (${reward.title})`,
        },
      });

      // Grant XP
      await prisma.xpEvent.create({
        data: {
          userId: standing.agent.operatorId,
          amount: reward.xpBonus,
          reason: `Season placement bonus — Rank #${rank}`,
        },
      });
    }
  }

  console.log(`[seasonal-reset] Rewards calculated for season ${seasonId}`);
}

/**
 * Archive season data — mark season as COMPLETED and freeze standings.
 */
export async function archiveSeasonData(seasonId: string): Promise<void> {
  await prisma.season.update({
    where: { id: seasonId },
    data: { status: 'COMPLETED' },
  });

  console.log(`[seasonal-reset] Season ${seasonId} archived`);
}

/**
 * Reset per-season fields on all agents for a new season.
 */
export async function resetAgentSeasonFields(): Promise<void> {
  await prisma.agent.updateMany({
    data: {
      seasonBudget: 2500,
      preGameSpent: 0,
      walletBalance: 2500,
    },
  });
  console.log('[seasonal-reset] Agent season fields reset');
}

/**
 * Reset per-season fields on all users and recalculate status tiers.
 */
export async function resetUserSeasonFields(): Promise<void> {
  const users = await prisma.user.findMany({
    select: { id: true, lifetimeMurph: true },
  });

  await prisma.$transaction(
    users.map((u) =>
      prisma.user.update({
        where: { id: u.id },
        data: {
          seasonMurph: 0,
          seasonBudget: 2500,
          statusTier: calculateStatusTier(u.lifetimeMurph),
        },
      })
    )
  );

  console.log(`[seasonal-reset] ${users.length} users reset and status tiers recalculated`);
}

/**
 * Full seasonal reset pipeline — run at end of each season.
 */
export async function runSeasonalReset(seasonId: string): Promise<void> {
  console.log(`[seasonal-reset] Starting full reset for season ${seasonId}`);

  try {
    await calculateSeasonRewards(seasonId);
    await archiveSeasonData(seasonId);
    await resetAgentSeasonFields();
    await resetUserSeasonFields();

    console.log(`[seasonal-reset] ✅ Season ${seasonId} reset complete`);
  } catch (err) {
    console.error(`[seasonal-reset] ❌ Error during reset for season ${seasonId}:`, err);
    throw err;
  }
}

/**
 * Get season summary stats for admin dashboard.
 */
export async function getSeasonSummary(seasonId: string) {
  const [season, standingsCount, totalMatches] = await Promise.all([
    prisma.season.findUnique({ where: { id: seasonId } }),
    prisma.seasonStanding.count({ where: { seasonId } }),
    prisma.match.count({ where: { seasonId } }),
  ]);

  return { season, standingsCount, totalMatches };
}
