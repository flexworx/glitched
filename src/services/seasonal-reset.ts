/**
 * Seasonal Reset Service — Manages season transitions and human status tiers
 */
import { PrismaClient } from '@prisma/client';
import { toolInventoryService } from './tool-inventory';
import { getTierForMurph } from '@/lib/utils/status-tiers';
import type { HumanStatusTierName } from '@/lib/utils/status-tiers';

const prisma = new PrismaClient();

/**
 * Start a new season — resets economy while preserving permanent stats
 */
export async function startNewSeason(data: {
  number: number;
  name: string;
  description: string;
}) {
  // Create season record
  const season = await prisma.season.create({
    data: {
      number: data.number,
      name: data.name,
      description: data.description,
      status: 'UPCOMING',
    },
  });

  // Reset ALL agents: economy only — NOT personality, veritas, memories, relationships
  await prisma.agent.updateMany({
    data: {
      seasonBudget: 2500,
      preGameSpent: 0,
      walletBalance: 2500,
      status: 'ACTIVE',
    },
  });

  // Reset ALL users: season economy only — NOT lifetimeMurph, statusTier
  await prisma.user.updateMany({
    data: {
      seasonMurph: 0,
      seasonBudget: 2500,
    },
  });

  // Initialize tool inventory for the new season
  await toolInventoryService.initializeSeasonInventory(season.id);

  console.log(`Season ${data.number} "${data.name}" started.`);
  console.log('  - All agents reset: seasonBudget=2500, preGameSpent=0, walletBalance=2500');
  console.log('  - All users reset: seasonMurph=0, seasonBudget=2500');
  console.log('  - Tool inventory initialized');
  console.log('  - PRESERVED: veritasScore, memories, relationships, personality, lifetimeWins, openSkill');
  console.log('  - PRESERVED: lifetimeMurph, statusTier');

  return season;
}

/**
 * Calculate human status tier from lifetime $MURPH
 */
export function calculateHumanStatusTier(lifetimeMurph: number): HumanStatusTierName {
  if (lifetimeMurph >= 1000000) return 'SENTIENT';
  if (lifetimeMurph >= 200000) return 'EMERGENT';
  if (lifetimeMurph >= 50000) return 'SYNTHETIC';
  if (lifetimeMurph >= 10000) return 'COGNITIVE';
  if (lifetimeMurph >= 2500) return 'NEURAL';
  if (lifetimeMurph >= 500) return 'AUTOMATON';
  return 'BOOTLOADER';
}

/**
 * Award $MURPH to a human user — updates lifetime totals and recalculates tier
 */
export async function awardMurphToHuman(
  userId: string,
  amount: number,
  reason: string
): Promise<{
  newBalance: number;
  tierChanged: boolean;
  newTier: HumanStatusTierName;
}> {
  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new Error(`User not found: ${userId}`);

  const newLifetime = (user.lifetimeMurph ?? 0) + amount;
  const newSeason = (user.seasonMurph ?? 0) + amount;
  const oldTier = user.statusTier as HumanStatusTierName;
  const newTier = calculateHumanStatusTier(newLifetime);
  const tierChanged = oldTier !== newTier;

  await prisma.user.update({
    where: { id: userId },
    data: {
      lifetimeMurph: newLifetime,
      seasonMurph: newSeason,
      statusTier: newTier as import('@prisma/client').HumanStatusTier,
    },
  });

  // Create transaction record if user has a wallet
  const wallet = await prisma.userWallet.findUnique({ where: { userId } });
  if (wallet) {
    await prisma.userWallet.update({
      where: { id: wallet.id },
      data: { murphBalance: { increment: amount } },
    });
    await prisma.murphTransaction.create({
      data: {
        userWalletId: wallet.id,
        amount,
        txType: 'MATCH_REWARD',
        description: reason,
      },
    });
  }

  // If tier changed, create achievement
  if (tierChanged) {
    const tierConfig = getTierForMurph(newLifetime);
    const achievement = await prisma.achievement.findUnique({
      where: { name: `Reached ${tierConfig.label}` },
    });
    if (achievement) {
      await prisma.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: achievement.id } },
        update: {},
        create: { userId, achievementId: achievement.id },
      });
    }
    console.log(`${tierConfig.icon} User ${userId} promoted to ${tierConfig.label}!`);
  }

  return { newBalance: newLifetime, tierChanged, newTier };
}

/**
 * Record pre-game spending for an agent
 */
export async function recordPreGameSpending(
  agentId: string,
  amount: number
): Promise<{ preGameSpent: number; walletBalance: number }> {
  const agent = await prisma.agent.findUnique({ where: { id: agentId } });
  if (!agent) throw new Error(`Agent not found: ${agentId}`);

  const newPreGameSpent = (agent.preGameSpent ?? 0) + amount;
  const newWalletBalance = (agent.seasonBudget ?? 2500) - newPreGameSpent;

  await prisma.agent.update({
    where: { id: agentId },
    data: {
      preGameSpent: newPreGameSpent,
      walletBalance: Math.max(0, newWalletBalance),
    },
  });

  return { preGameSpent: newPreGameSpent, walletBalance: Math.max(0, newWalletBalance) };
}
