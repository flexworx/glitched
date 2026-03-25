/**
 * Tool Inventory Service — Manages arena tool scarcity, purchases, and activation
 */
import { PrismaClient } from '@prisma/client';
import { ARENA_TOOLS, getArenaToolById } from '@/lib/creator/arenaTools';
import type { ArenaToolDefinition } from '@/lib/creator/arenaTools';

const prisma = new PrismaClient();

export class ToolInventoryService {
  /**
   * Initialize season inventory — creates ToolInventory rows for each ArenaToolDefinition
   */
  async initializeSeasonInventory(seasonId: string) {
    const records = [];

    for (const tool of ARENA_TOOLS) {
      const totalSupply = tool.seasonSupply === -1 ? 999999 : tool.seasonSupply;

      const record = await prisma.toolInventory.upsert({
        where: { seasonId_toolId: { seasonId, toolId: tool.id } },
        update: { totalSupply, remainingSupply: totalSupply },
        create: {
          seasonId,
          toolId: tool.id,
          totalSupply,
          remainingSupply: totalSupply,
        },
      });
      records.push(record);
    }

    const common = ARENA_TOOLS.filter((t) => t.rarity === 'common').length;
    const uncommon = ARENA_TOOLS.filter((t) => t.rarity === 'uncommon').length;
    const rare = ARENA_TOOLS.filter((t) => t.rarity === 'rare').length;
    const legendary = ARENA_TOOLS.filter((t) => t.rarity === 'legendary').length;

    console.log(
      `Season inventory initialized: ${common} common (unlimited), ${uncommon} uncommon (10 each), ${rare} rare (3 each), ${legendary} legendary (1 each)`
    );

    return records;
  }

  /**
   * Purchase a tool — FIRST COME FIRST SERVE with database transaction
   */
  async purchaseTool(params: {
    seasonId: string;
    toolId: string;
    agentId: string;
    userId: string;
    isPreGame: boolean;
  }): Promise<{ success: boolean; reason?: string }> {
    const tool = getArenaToolById(params.toolId);
    if (!tool) {
      return { success: false, reason: `Unknown tool: ${params.toolId}` };
    }

    // Validate legendary pre-game restriction
    if (tool.rarity === 'legendary' && params.isPreGame) {
      return { success: false, reason: 'Legendary tools cannot be purchased pre-game' };
    }

    // Validate pre-game usability
    if (!tool.usablePreGame && params.isPreGame) {
      return { success: false, reason: 'This tool can only be purchased during a match' };
    }

    // Use transaction for FCFS locking
    try {
      return await prisma.$transaction(async (tx) => {
        // Lock the inventory row
        const inventory = await tx.toolInventory.findUnique({
          where: { seasonId_toolId: { seasonId: params.seasonId, toolId: params.toolId } },
        });

        if (!inventory) {
          return { success: false, reason: 'Tool not available this season' };
        }

        if (inventory.remainingSupply <= 0) {
          return {
            success: false,
            reason: `SOLD OUT — ${tool.name} (0 of ${inventory.totalSupply} remaining this season)`,
          };
        }

        // Check max per agent
        const existingCount = await tx.toolPurchaseLog.count({
          where: {
            inventoryId: inventory.id,
            agentId: params.agentId,
          },
        });

        if (existingCount >= tool.maxPerAgent) {
          return {
            success: false,
            reason: `Already own maximum (${tool.maxPerAgent}) of ${tool.name}`,
          };
        }

        // Decrement supply
        await tx.toolInventory.update({
          where: { id: inventory.id },
          data: { remainingSupply: { decrement: 1 } },
        });

        // Create purchase log
        await tx.toolPurchaseLog.create({
          data: {
            inventoryId: inventory.id,
            agentId: params.agentId,
            purchasedBy: params.userId,
            murphPaid: tool.murphCost,
            isPreGame: params.isPreGame,
            wasRevealed: false,
          },
        });

        return { success: true };
      });
    } catch (error) {
      return { success: false, reason: 'Purchase failed due to a server error' };
    }
  }

  /**
   * Activate a tool in-game — reveals it to everyone
   */
  async activateTool(
    agentId: string,
    toolId: string,
    matchId: string,
    roundNumber: number
  ) {
    const tool = getArenaToolById(toolId);
    if (!tool) return null;

    // Find unrevealed purchase
    const purchase = await prisma.toolPurchaseLog.findFirst({
      where: {
        agentId,
        inventory: { toolId },
        wasRevealed: false,
      },
    });

    if (!purchase) return null;

    // Mark as revealed
    await prisma.toolPurchaseLog.update({
      where: { id: purchase.id },
      data: {
        wasRevealed: true,
        revealedAt: new Date(),
        roundRevealed: roundNumber,
      },
    });

    return tool.mechanicalEffect;
  }

  /**
   * Get an agent's full tool loadout (PRIVATE — only the agent sees this)
   */
  async getAgentToolLoadout(agentId: string, seasonId: string) {
    const purchases = await prisma.toolPurchaseLog.findMany({
      where: {
        agentId,
        inventory: { seasonId },
      },
      include: { inventory: true },
    });

    return purchases.map((p) => {
      const tool = getArenaToolById(p.inventory.toolId);
      return {
        purchaseId: p.id,
        toolId: p.inventory.toolId,
        tool,
        wasRevealed: p.wasRevealed,
        revealedAt: p.revealedAt,
        roundRevealed: p.roundRevealed,
        isPreGame: p.isPreGame,
      };
    });
  }

  /**
   * Get available tools for purchase in a season
   */
  async getAvailableTools(seasonId: string) {
    const inventory = await prisma.toolInventory.findMany({
      where: { seasonId, remainingSupply: { gt: 0 } },
    });

    return inventory
      .map((inv) => {
        const tool = getArenaToolById(inv.toolId);
        return {
          ...inv,
          tool,
        };
      })
      .filter((item) => item.tool != null)
      .sort((a, b) => {
        const rarityOrder = { legendary: 0, rare: 1, uncommon: 2, common: 3 };
        const ra = rarityOrder[a.tool!.rarity] ?? 99;
        const rb = rarityOrder[b.tool!.rarity] ?? 99;
        return ra - rb;
      });
  }

  /**
   * Get all revealed tools in a match (PUBLIC — everyone can see these)
   */
  async getRevealedTools(matchId: string) {
    // We need to find purchases that were revealed, matching via the agent's match participation
    const purchases = await prisma.toolPurchaseLog.findMany({
      where: {
        wasRevealed: true,
      },
      include: { inventory: true },
    });

    return purchases
      .map((p) => ({
        agentId: p.agentId,
        toolId: p.inventory.toolId,
        tool: getArenaToolById(p.inventory.toolId),
        revealedAt: p.revealedAt,
        roundRevealed: p.roundRevealed,
      }))
      .filter((item) => item.tool != null);
  }
}

export const toolInventoryService = new ToolInventoryService();
