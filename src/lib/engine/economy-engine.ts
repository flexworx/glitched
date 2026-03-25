/**
 * Economy Engine — In-game agent economy for $MURPH
 * Handles wallets, bribes, bets, pickups, golden ticket, and prize pool distribution
 */
import { PrismaClient } from '@prisma/client';
import { toolInventoryService } from '@/services/tool-inventory';
import { getArenaToolById, ARENA_TOOLS } from '@/lib/creator/arenaTools';

const prisma = new PrismaClient();

export class EconomyEngine {
  constructor(private matchId: string) {}

  // ─── MATCH SETUP ───

  async initializeWallets(agents: { agentId: string; walletBalance: number }[]) {
    for (const agent of agents) {
      await prisma.agentMatchWallet.upsert({
        where: { matchId_agentId: { matchId: this.matchId, agentId: agent.agentId } },
        update: { startingBalance: agent.walletBalance, currentBalance: agent.walletBalance },
        create: {
          matchId: this.matchId,
          agentId: agent.agentId,
          startingBalance: agent.walletBalance,
          currentBalance: agent.walletBalance,
        },
      });
    }
    await prisma.match.update({ where: { id: this.matchId }, data: { prizePool: 0 } });
  }

  async spawnPickups(gridWidth: number, gridHeight: number) {
    const pickups: Array<{ pickupType: string; amount?: number; toolId?: string; positionX: number; positionY: number }> = [];
    const randPos = () => ({ positionX: Math.floor(Math.random() * gridWidth), positionY: Math.floor(Math.random() * gridHeight) });

    // 5-10 MURPH pickups
    const murphCount = 5 + Math.floor(Math.random() * 6);
    for (let i = 0; i < murphCount; i++) {
      pickups.push({ pickupType: 'MURPH', amount: 25 + Math.floor(Math.random() * 76), ...randPos() });
    }

    // 2-3 TOOL pickups (random common tools)
    const commonTools = ARENA_TOOLS.filter((t) => t.rarity === 'common');
    const toolCount = 2 + Math.floor(Math.random() * 2);
    for (let i = 0; i < toolCount; i++) {
      const tool = commonTools[Math.floor(Math.random() * commonTools.length)];
      pickups.push({ pickupType: 'TOOL', toolId: tool.id, ...randPos() });
    }

    // 30% chance: golden ticket
    const hasGoldenTicket = Math.random() < 0.3;
    if (hasGoldenTicket) {
      pickups.push({ pickupType: 'GOLDEN_TICKET', ...randPos() });
    }

    for (const p of pickups) {
      await prisma.arenaPickup.create({ data: { matchId: this.matchId, ...p } });
    }

    return {
      murphPickups: murphCount,
      toolPickups: toolCount,
      hasGoldenTicket,
    };
  }

  // ─── ROUND PROCESSING ───

  async processRoundRewards(roundNumber: number, survivingAgentIds: string[]) {
    const perAgent = 50;
    for (const agentId of survivingAgentIds) {
      await this.creditWallet(agentId, perAgent, 'ROUND_SURVIVAL', `Survived round ${roundNumber}`, roundNumber);
    }
    return { awarded: perAgent * survivingAgentIds.length, perAgent };
  }

  async processElimination(eliminatedAgentId: string, eliminatorAgentId: string | null) {
    const eliminatedWallet = await prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId: eliminatedAgentId } },
    });
    if (!eliminatedWallet) return null;

    const balance = eliminatedWallet.currentBalance;
    const prizePoolContribution = Math.floor(balance * 0.6);
    const eliminatedKeeps = Math.floor(balance * 0.4);
    let bounty = 0;

    // Award bounty to eliminator
    if (eliminatorAgentId) {
      bounty = 200;
      await this.creditWallet(eliminatorAgentId, bounty, 'ELIMINATION_BOUNTY', `Eliminated agent`, 0);
    }

    // Transfer to prize pool
    await prisma.agentMatchWallet.update({
      where: { id: eliminatedWallet.id },
      data: { currentBalance: eliminatedKeeps, totalLost: { increment: prizePoolContribution } },
    });
    await prisma.match.update({
      where: { id: this.matchId },
      data: { prizePool: { increment: prizePoolContribution } },
    });

    return { bounty, prizePoolContribution, eliminatedKeeps };
  }

  // ─── AGENT ECONOMY ACTIONS ───

  async processBribe(fromAgentId: string, toAgentId: string, amount: number) {
    const fromWallet = await this.getWallet(fromAgentId);
    if (!fromWallet || fromWallet.currentBalance < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }

    await this.debitWallet(fromAgentId, amount, 'BRIBE_SENT', `Bribed agent`, 0);
    await this.creditWallet(toAgentId, amount, 'BRIBE_RECEIVED', `Received bribe`, 0);

    return { success: true, senderBalance: fromWallet.currentBalance - amount, recipientBalance: 0 };
  }

  async purchaseToolInGame(agentId: string, toolId: string, seasonId: string) {
    const tool = getArenaToolById(toolId);
    if (!tool) return { success: false, reason: 'Unknown tool' };

    const wallet = await this.getWallet(agentId);
    if (!wallet || wallet.currentBalance < tool.murphCost) {
      return { success: false, reason: 'Insufficient $MURPH' };
    }

    const result = await toolInventoryService.purchaseTool({
      seasonId,
      toolId,
      agentId,
      userId: agentId,
      isPreGame: false,
    });

    if (result.success) {
      await this.debitWallet(agentId, tool.murphCost, 'TOOL_PURCHASE', `Purchased ${tool.name}`, 0);
    }

    return result;
  }

  async activateToolInGame(agentId: string, toolId: string, roundNumber: number) {
    return toolInventoryService.activateTool(agentId, toolId, this.matchId, roundNumber);
  }

  async placeSelfBet(agentId: string, amount: number, roundNumber: number) {
    const wallet = await this.getWallet(agentId);
    if (!wallet || wallet.currentBalance < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }

    // Calculate odds based on remaining agents
    const wallets = await prisma.agentMatchWallet.findMany({ where: { matchId: this.matchId } });
    const remaining = wallets.length;
    const odds = Math.max(1.5, Math.round((remaining / 2) * 10) / 10);

    await this.debitWallet(agentId, amount, 'SELF_BET_PLACED', `Bet on self at ${odds}x`, roundNumber);

    const bet = await prisma.agentBet.create({
      data: {
        walletId: wallet.id,
        betType: 'SELF_SURVIVAL',
        amount,
        odds,
        roundNumber,
      },
    });

    return { success: true, betId: bet.id, odds, potentialPayout: Math.floor(amount * odds) };
  }

  async resolveBets(roundNumber: number, survivingAgentIds: string[]) {
    const bets = await prisma.agentBet.findMany({
      where: { roundNumber, resolved: false },
      include: { wallet: true },
    });

    let totalPaidOut = 0;
    let resolved = 0;

    for (const bet of bets) {
      const survived = survivingAgentIds.includes(bet.wallet.agentId);
      const payout = survived ? Math.floor(bet.amount * bet.odds) : 0;

      await prisma.agentBet.update({
        where: { id: bet.id },
        data: { resolved: true, won: survived, payout },
      });

      if (survived && payout > 0) {
        await this.creditWallet(
          bet.wallet.agentId, payout, 'SELF_BET_WON',
          `Won self-bet: ${bet.amount} × ${bet.odds}x = ${payout}`, roundNumber
        );
        totalPaidOut += payout;
      } else {
        await this.createTransaction(bet.wallet.agentId, -bet.amount, 'SELF_BET_LOST', `Lost self-bet`, roundNumber);
      }
      resolved++;
    }

    return { resolved, totalPaidOut };
  }

  async offerBounty(offeringAgentId: string, targetAgentId: string, amount: number) {
    const wallet = await this.getWallet(offeringAgentId);
    if (!wallet || wallet.currentBalance < amount) {
      return { success: false, reason: 'Insufficient balance' };
    }

    await this.debitWallet(offeringAgentId, amount, 'BOUNTY_OFFERED', `Bounty on agent`, 0);
    return { success: true, bountyId: `bounty_${Date.now()}` };
  }

  async collectPickup(agentId: string, positionX: number, positionY: number) {
    // Find uncollected pickups within 2 tiles
    const pickups = await prisma.arenaPickup.findMany({
      where: {
        matchId: this.matchId,
        isCollected: false,
        positionX: { gte: positionX - 2, lte: positionX + 2 },
        positionY: { gte: positionY - 2, lte: positionY + 2 },
      },
      take: 1,
    });

    if (pickups.length === 0) return { found: false };

    const pickup = pickups[0];
    await prisma.arenaPickup.update({
      where: { id: pickup.id },
      data: { isCollected: true, collectedBy: agentId, collectedAt: new Date() },
    });

    if (pickup.pickupType === 'MURPH' && pickup.amount) {
      await this.creditWallet(agentId, pickup.amount, 'FOUND_MURPH', `Found ${pickup.amount} $MURPH`, 0);
      return { found: true, type: 'MURPH', amount: pickup.amount };
    }

    if (pickup.pickupType === 'GOLDEN_TICKET') {
      await prisma.match.update({
        where: { id: this.matchId },
        data: { goldenTicketFound: true, goldenTicketHolder: agentId },
      });
      return { found: true, type: 'GOLDEN_TICKET', isGoldenTicket: true };
    }

    if (pickup.pickupType === 'TOOL' && pickup.toolId) {
      return { found: true, type: 'TOOL', toolId: pickup.toolId };
    }

    return { found: false };
  }

  // ─── MATCH END ───

  async distributePrizePool(rankings: { agentId: string; rank: number }[]) {
    const match = await prisma.match.findUnique({ where: { id: this.matchId } });
    if (!match) return null;

    const pool = match.prizePool;
    const distributions: Array<{ agentId: string; rank: number; share: number }> = [];

    // Distribution: 1st=50%, 2nd=25%, 3rd=15%, 4th+=10% split
    const shares = [0.5, 0.25, 0.15];
    const remaining = rankings.filter((r) => r.rank > 3);
    const remainingShare = remaining.length > 0 ? 0.1 / remaining.length : 0;

    for (const ranking of rankings) {
      let share: number;
      if (ranking.rank <= 3) {
        share = Math.floor(pool * (shares[ranking.rank - 1] ?? 0));
      } else {
        share = Math.floor(pool * remainingShare);
      }

      // Golden ticket doubles 1st place share
      if (ranking.rank === 1 && match.goldenTicketHolder === ranking.agentId) {
        share *= 2;
      }

      if (share > 0) {
        await this.creditWallet(ranking.agentId, share, 'PRIZE_POOL_SHARE', `${ranking.rank === 1 ? 'Winner' : `Rank ${ranking.rank}`} share`, 0);
      }

      distributions.push({ agentId: ranking.agentId, rank: ranking.rank, share });
    }

    return {
      distributions,
      goldenTicketDoubled: match.goldenTicketHolder === rankings.find((r) => r.rank === 1)?.agentId,
    };
  }

  // ─── CONTEXT FOR AGENT PROMPTS ───

  async getEconomyContext(agentId: string): Promise<string> {
    const wallet = await this.getWallet(agentId);
    if (!wallet) return 'WALLET: Not initialized';

    const match = await prisma.match.findUnique({ where: { id: this.matchId } });
    const bets = await prisma.agentBet.findMany({ where: { walletId: wallet.id, resolved: false } });

    // Calculate odds
    const allWallets = await prisma.agentMatchWallet.findMany({ where: { matchId: this.matchId } });
    const remaining = allWallets.length;
    const odds = Math.max(1.5, Math.round((remaining / 2) * 10) / 10);

    const betsStr = bets.length > 0
      ? bets.map((b) => `${b.betType}: ${b.amount} $MURPH at ${b.odds}x`).join(', ')
      : 'None';

    const goldenTicketStr = !match?.goldenTicketFound
      ? 'Not yet found'
      : match.goldenTicketHolder === agentId
      ? 'YOU hold the Golden Ticket!'
      : 'Found by another agent';

    return `YOUR WALLET: ${Math.floor(wallet.currentBalance)} $MURPH
MATCH PRIZE POOL: ${Math.floor(match?.prizePool ?? 0)} $MURPH (grows with each elimination)
YOUR ACTIVE BETS: ${betsStr}
GOLDEN TICKET: ${goldenTicketStr}
CURRENT ODDS (for self-bet): ${odds}x payout

ECONOMY ACTIONS (pick one per round, in addition to your game action):
- bribe [agent] [amount]: Send $MURPH publicly to buy favor
- buy_tool [tool_id]: Purchase from arena shop (see available below)
- activate_tool [tool_id]: Use a hidden tool (reveals it to everyone)
- bet_on_self [amount]: Bet on surviving this round at ${odds}x
- explore: Search nearby for hidden $MURPH, tools, or the Golden Ticket
- offer_bounty [agent] [amount]: Put a price on someone's head
- none: Take no economy action this round`;
  }

  // ─── PRIVATE HELPERS ───

  private async getWallet(agentId: string) {
    return prisma.agentMatchWallet.findUnique({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
    });
  }

  private async creditWallet(agentId: string, amount: number, txType: import('@prisma/client').AgentTxType, description: string, roundNumber: number) {
    await prisma.agentMatchWallet.update({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
      data: { currentBalance: { increment: amount }, totalEarned: { increment: amount } },
    });
    await this.createTransaction(agentId, amount, txType, description, roundNumber);
  }

  private async debitWallet(agentId: string, amount: number, txType: import('@prisma/client').AgentTxType, description: string, roundNumber: number) {
    await prisma.agentMatchWallet.update({
      where: { matchId_agentId: { matchId: this.matchId, agentId } },
      data: { currentBalance: { decrement: amount }, totalSpent: { increment: amount } },
    });
    await this.createTransaction(agentId, -amount, txType, description, roundNumber);
  }

  private async createTransaction(agentId: string, amount: number, txType: import('@prisma/client').AgentTxType, description: string, roundNumber: number) {
    const wallet = await this.getWallet(agentId);
    if (!wallet) return;
    await prisma.agentMatchTransaction.create({
      data: {
        walletId: wallet.id,
        amount,
        txType,
        description,
        roundNumber,
      },
    });
  }
}
