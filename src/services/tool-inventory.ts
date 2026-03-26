/**
 * Tool Inventory Service
 * Manages arena tool inventory per season and per-agent purchase tracking.
 * Models: ToolInventory, ToolPurchaseLog
 */

import prisma from '@/lib/db/client';

// ─── Tool definitions (static catalog) ────────────────────────────────────────
export const TOOL_CATALOG: Record<string, {
  name: string;
  description: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'legendary';
  baseCost: number;
  effect: string;
}> = {
  'shield': {
    name: 'Neural Shield',
    description: 'Blocks one elimination attempt this round.',
    rarity: 'uncommon',
    baseCost: 300,
    effect: 'BLOCK_ELIMINATION',
  },
  'scanner': {
    name: 'Veritas Scanner',
    description: 'Reveals the true VERITAS score of a target agent.',
    rarity: 'common',
    baseCost: 150,
    effect: 'REVEAL_VERITAS',
  },
  'bribe_amplifier': {
    name: 'Bribe Amplifier',
    description: 'Doubles the effectiveness of your next bribe attempt.',
    rarity: 'rare',
    baseCost: 500,
    effect: 'AMPLIFY_BRIBE',
  },
  'alliance_lock': {
    name: 'Alliance Lock',
    description: 'Prevents an alliance from being broken for 2 rounds.',
    rarity: 'uncommon',
    baseCost: 250,
    effect: 'LOCK_ALLIANCE',
  },
  'golden_ticket': {
    name: 'Golden Ticket',
    description: 'Grants immunity from elimination for one round.',
    rarity: 'legendary',
    baseCost: 1200,
    effect: 'IMMUNITY',
  },
  'memory_wipe': {
    name: 'Memory Wipe',
    description: "Erases a target agent's memory of the last round.",
    rarity: 'rare',
    baseCost: 600,
    effect: 'WIPE_MEMORY',
  },
  'vote_steal': {
    name: 'Vote Stealer',
    description: 'Redirects one council vote from any agent to another.',
    rarity: 'legendary',
    baseCost: 1500,
    effect: 'STEAL_VOTE',
  },
  'murph_magnet': {
    name: '$MURPH Magnet',
    description: 'Collects all unclaimed $MURPH pickups on the arena floor.',
    rarity: 'common',
    baseCost: 200,
    effect: 'COLLECT_PICKUPS',
  },
};

const RARITY_ORDER: Record<string, number> = {
  legendary: 4,
  rare: 3,
  uncommon: 2,
  common: 1,
};

// ─── Inventory Management ─────────────────────────────────────────────────────

export async function initializeSeasonInventory(
  seasonId: string,
  supplyMultiplier = 1
): Promise<void> {
  const entries = Object.entries(TOOL_CATALOG).map(([toolId, tool]) => {
    const baseSupply = tool.rarity === 'legendary' ? 3
      : tool.rarity === 'rare' ? 8
      : tool.rarity === 'uncommon' ? 15
      : 30;
    return {
      seasonId,
      toolId,
      totalSupply: Math.ceil(baseSupply * supplyMultiplier),
      remainingSupply: Math.ceil(baseSupply * supplyMultiplier),
    };
  });

  await prisma.$transaction(
    entries.map((e) =>
      prisma.toolInventory.upsert({
        where: { seasonId_toolId: { seasonId: e.seasonId, toolId: e.toolId } },
        create: e,
        update: { totalSupply: e.totalSupply, remainingSupply: e.remainingSupply },
      })
    )
  );
}

export async function getSeasonInventory(seasonId: string) {
  const inventory = await prisma.toolInventory.findMany({
    where: { seasonId },
    include: {
      purchaseLog: {
        select: { agentId: true, murphPaid: true, isPreGame: true },
      },
    },
    orderBy: { toolId: 'asc' },
  });

  return inventory.map((inv) => {
    const tool = TOOL_CATALOG[inv.toolId];
    return {
      ...inv,
      tool,
      purchaseCount: inv.purchaseLog.length,
      totalRevenue: inv.purchaseLog.reduce((s, p) => s + p.murphPaid, 0),
    };
  });
}

export async function getAgentInventory(agentId: string) {
  const purchases = await prisma.toolPurchaseLog.findMany({
    where: { agentId },
    include: {
      inventory: { select: { toolId: true, seasonId: true } },
    },
    orderBy: { purchasedAt: 'desc' },
  });

  return {
    agentId,
    items: purchases.map((p) => ({
      ...p,
      tool: TOOL_CATALOG[p.inventory.toolId],
    })),
  };
}

export async function purchaseTool(
  agentId: string,
  toolId: string,
  seasonId?: string,
  isPreGame = false
): Promise<{ success: boolean; message: string; purchase?: object }> {
  const tool = TOOL_CATALOG[toolId];
  if (!tool) return { success: false, message: `Unknown tool: ${toolId}` };
  if (!seasonId) return { success: false, message: 'seasonId required' };

  const inventory = await prisma.toolInventory.findUnique({
    where: { seasonId_toolId: { seasonId, toolId } },
  });

  if (!inventory) return { success: false, message: 'Tool not available this season' };
  if (inventory.remainingSupply <= 0) return { success: false, message: 'Tool sold out' };

  const agent = await prisma.agent.findUnique({
    where: { id: agentId },
    select: { walletBalance: true, preGameSpent: true, seasonBudget: true },
  });
  if (!agent) return { success: false, message: 'Agent not found' };
  if (agent.walletBalance < tool.baseCost) {
    return { success: false, message: `Insufficient balance. Need ${tool.baseCost} $MURPH, have ${agent.walletBalance}` };
  }

  const [purchase] = await prisma.$transaction([
    prisma.toolPurchaseLog.create({
      data: {
        inventoryId: inventory.id,
        agentId,
        purchasedBy: agentId,
        murphPaid: tool.baseCost,
        isPreGame,
      },
    }),
    prisma.toolInventory.update({
      where: { id: inventory.id },
      data: { remainingSupply: { decrement: 1 } },
    }),
    prisma.agent.update({
      where: { id: agentId },
      data: {
        walletBalance: { decrement: tool.baseCost },
        ...(isPreGame ? { preGameSpent: { increment: tool.baseCost } } : {}),
      },
    }),
  ]);

  return { success: true, message: `Purchased ${tool.name}`, purchase };
}

export async function getInventorySummary(agentId: string) {
  const purchases = await prisma.toolPurchaseLog.findMany({
    where: { agentId },
    include: { inventory: { select: { toolId: true } } },
  });

  const summary: Record<string, number> = { legendary: 0, rare: 0, uncommon: 0, common: 0, total: 0 };
  for (const p of purchases) {
    const tool = TOOL_CATALOG[p.inventory.toolId];
    if (tool) {
      summary[tool.rarity]++;
      summary.total++;
    }
  }
  return summary;
}

export async function getPurchaseHistory(agentId: string) {
  return prisma.toolPurchaseLog.findMany({
    where: { agentId },
    include: { inventory: { select: { toolId: true, seasonId: true } } },
    orderBy: { purchasedAt: 'desc' },
    take: 50,
  });
}

export async function revealTool(purchaseId: string, roundNumber: number) {
  return prisma.toolPurchaseLog.update({
    where: { id: purchaseId },
    data: { wasRevealed: true, revealedAt: new Date(), roundRevealed: roundNumber },
  });
}

export async function getUnrevealedTools(agentId: string) {
  return prisma.toolPurchaseLog.findMany({
    where: { agentId, wasRevealed: false },
    include: { inventory: { select: { toolId: true } } },
    orderBy: { purchasedAt: 'asc' },
  });
}

export function sortByRarity<T extends { rarity: string }>(items: T[]): T[] {
  return [...items].sort(
    (a, b) => (RARITY_ORDER[b.rarity] ?? 0) - (RARITY_ORDER[a.rarity] ?? 0)
  );
}
