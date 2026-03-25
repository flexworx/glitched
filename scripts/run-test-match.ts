/**
 * Test Match Runner — Runs a complete match end-to-end with real Claude API calls
 *
 * CLI: npx ts-node scripts/run-test-match.ts
 * Options: --template "THE PURGE" --agents "PRIMUS,ORACLE,MYTHION,SOLARIUS" --rounds 3
 */
import { PrismaClient } from '@prisma/client';
import { callAgentWithCompliance } from '../src/lib/ai/compliance-wrapper';
import { getActionMenu } from '../src/lib/ai/action-menus';
import { buildAgentSystemPrompt } from '../src/lib/ai/agent-prompt-builder';
import { EconomyEngine } from '../src/lib/engine/economy-engine';
import type { GameCategory } from '../src/lib/ai/action-menus';

const prisma = new PrismaClient();

// ANSI colors
const GREEN = '\x1b[32m';
const BLUE = '\x1b[34m';
const YELLOW = '\x1b[33m';
const RED = '\x1b[31m';
const CYAN = '\x1b[36m';
const MAGENTA = '\x1b[35m';
const RESET = '\x1b[0m';
const BOLD = '\x1b[1m';
const DIM = '\x1b[2m';

// Parse CLI args
function parseArgs() {
  const args = process.argv.slice(2);
  let template = 'THE PURGE';
  let agentNames: string[] = [];
  let rounds = 3;

  for (let i = 0; i < args.length; i++) {
    if (args[i] === '--template' && args[i + 1]) template = args[++i];
    if (args[i] === '--agents' && args[i + 1]) agentNames = args[++i].split(',').map((s) => s.trim());
    if (args[i] === '--rounds' && args[i + 1]) rounds = parseInt(args[++i], 10);
  }

  return { template, agentNames, rounds };
}

async function main() {
  const { template: templateName, agentNames, rounds } = parseArgs();

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║  GLITCHED.GG — TEST MATCH RUNNER                 ║${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n`);

  // 1. SETUP: Load template
  const gameTemplate = await prisma.gameTemplate.findFirst({
    where: { displayTitle: templateName },
  });

  if (!gameTemplate) {
    console.error(`${RED}Template "${templateName}" not found. Run seed-game-vault.ts first.${RESET}`);
    process.exit(1);
  }

  console.log(`${GREEN}Template:${RESET} ${gameTemplate.displayTitle} (${gameTemplate.name})`);
  console.log(`${GREEN}Category:${RESET} ${gameTemplate.category}`);
  console.log(`${GREEN}Rounds:${RESET} ${rounds}`);

  // Load agents
  let agents;
  if (agentNames.length > 0) {
    agents = await prisma.agent.findMany({
      where: { name: { in: agentNames } },
      include: { personality: true },
    });
  } else {
    agents = await prisma.agent.findMany({
      where: { isPantheon: true },
      include: { personality: true },
      take: 4,
    });
  }

  if (agents.length < 2) {
    console.error(`${RED}Need at least 2 agents. Found ${agents.length}. Run prisma seed first.${RESET}`);
    process.exit(1);
  }

  console.log(`${GREEN}Agents:${RESET} ${agents.map((a) => a.name).join(', ')}\n`);

  // Create arena if needed
  let arena = await prisma.arena.findFirst({ where: { isActive: true } });
  if (!arena) {
    arena = await prisma.arena.create({
      data: {
        name: 'Test Arena',
        theme: 'digital',
        description: 'Test arena for match runner',
        terrainConfig: {},
        spawnPoints: [],
      },
    });
  }

  // Create match
  const match = await prisma.match.create({
    data: {
      arenaId: arena.id,
      status: 'RUNNING',
      gameMode: 'CUSTOM',
      config: { templateId: gameTemplate.id },
    },
  });

  // Create participants
  for (const agent of agents) {
    await prisma.matchParticipant.create({
      data: { matchId: match.id, agentId: agent.id },
    });
  }

  // Initialize economy
  const economyEngine = new EconomyEngine(match.id);
  await economyEngine.initializeWallets(
    agents.map((a) => ({ agentId: a.id, walletBalance: a.walletBalance ?? 500 }))
  );
  const pickupResult = await economyEngine.spawnPickups(20, 20);

  console.log(`${YELLOW}Economy initialized:${RESET}`);
  console.log(`  Wallets: ${agents.length} agents (${agents.map((a) => `${a.name}: ${a.walletBalance ?? 500} $MURPH`).join(', ')})`);
  console.log(`  Pickups: ${pickupResult.murphPickups} $MURPH, ${pickupResult.toolPickups} tools, Golden Ticket: ${pickupResult.hasGoldenTicket ? 'YES' : 'No'}`);

  const startTime = Date.now();
  let apiCalls = 0;
  const eliminatedAgents: string[] = [];
  let survivingAgents = [...agents];

  // 2. EACH ROUND
  for (let round = 1; round <= rounds; round++) {
    console.log(`\n${BOLD}${MAGENTA}═══════════════════════════════════════════════════${RESET}`);
    console.log(`${BOLD}${MAGENTA}  ROUND ${round} of ${rounds}  |  ${survivingAgents.length} agents remaining${RESET}`);
    console.log(`${BOLD}${MAGENTA}═══════════════════════════════════════════════════${RESET}\n`);

    // a) Call each surviving agent
    for (const agent of survivingAgents) {
      const traits = agent.personality
        ? {
            openness: agent.personality.openness,
            conscientiousness: agent.personality.conscientiousness,
            extraversion: agent.personality.extraversion,
            agreeableness: agent.personality.agreeableness,
            neuroticism: agent.personality.neuroticism,
            competitiveness: agent.personality.competitiveness,
            riskTolerance: agent.personality.riskTolerance,
            deceptionAptitude: agent.personality.deceptionAptitude,
            loyaltyBias: agent.personality.loyaltyBias,
            pride: agent.personality.pride,
            creativity: agent.personality.creativity,
            dominance: agent.personality.dominance,
            assertiveness: agent.personality.assertiveness,
            generosity: agent.personality.generosity,
            analyticalThinking: agent.personality.analyticalThinking,
            impulsivity: agent.personality.impulsivity,
          }
        : { competitiveness: 0.5, riskTolerance: 0.5 };

      const economyContext = await economyEngine.getEconomyContext(agent.id);

      const systemPrompt = buildAgentSystemPrompt({
        name: agent.name,
        archetype: agent.archetype,
        bio: agent.backstory,
        beliefs: ['Survive at all costs', 'Win the game'],
        fears: ['Elimination', 'Betrayal'],
        goals: ['Win the championship', 'Build alliances'],
        traits,
        voice: { tone: 'confident', vocabulary: 'strategic', cadence: 'measured', signature_phrases: [] },
        combat: { preferred_actions: ['attack', 'negotiate'], avoid_actions: ['retreat'], alliance_threshold: 0.6, betrayal_threshold: 0.8 },
        memories: [],
        currentMatchContext: `Round ${round} of ${rounds}. ${survivingAgents.length} agents remaining.`,
        economyContext,
        gameTemplatePrompt: gameTemplate.systemPrompt
          .replace(/{your_name}/g, agent.name)
          .replace(/{your_credits}/g, String(agent.walletBalance ?? 500))
          .replace(/{agents_remaining}/g, String(survivingAgents.length))
          .replace(/{current_game_number}/g, '1')
          .replace(/{active_agent_names}/g, survivingAgents.map((a) => a.name).join(', '))
          .replace(/{eliminated_agent_names}/g, eliminatedAgents.join(', ') || 'None')
          .replace(/{credit_standings}/g, survivingAgents.map((a) => `${a.name}: ${a.walletBalance ?? 500}`).join(', '))
          .replace(/{oracle_odds}/g, 'Even odds')
          .replace(/{alliance_map}/g, 'No alliances yet')
          .replace(/{veritas_scores}/g, survivingAgents.map((a) => `${a.name}: ${a.veritasScore}`).join(', '))
          .replace(/{previous_game_results}/g, 'First game of the season')
          .replace(/{your_personality_summary}/g, agent.archetype),
      });

      const allowedActions = getActionMenu(gameTemplate.category as GameCategory);
      const userMessage = `Round ${round}. You are ${agent.name}. The game is ${gameTemplate.displayTitle}. ${survivingAgents.length} agents remain: ${survivingAgents.map((a) => a.name).join(', ')}. What do you do?`;

      try {
        console.log(`${DIM}Calling ${agent.name}...${RESET}`);
        const response = await callAgentWithCompliance({
          agentName: agent.name,
          systemPrompt,
          userMessage,
          allowedActions,
        });
        apiCalls++;

        // Print with ANSI colors
        console.log(`${GREEN}🟢 [${agent.name}]${RESET} "${response.speech}"`);
        console.log(`${BLUE}🔵 [${agent.name}]${RESET} Thinking: "${response.thinking}"`);
        console.log(`${YELLOW}⚡ [${agent.name}]${RESET} Action: ${response.action.type}${response.action.target ? ` → ${response.action.target}` : ''}`);
        if (response.economyAction.type !== 'none') {
          console.log(`${CYAN}💰 [${agent.name}]${RESET} Economy: ${response.economyAction.type}${response.economyAction.target ? ` → ${response.economyAction.target}` : ''} ${response.economyAction.amount > 0 ? `(${response.economyAction.amount} $MURPH)` : ''}`);
        }
        console.log('');

        // c) Process economy actions
        if (response.economyAction.type === 'bet_on_self' && response.economyAction.amount > 0) {
          const betResult = await economyEngine.placeSelfBet(agent.id, response.economyAction.amount, round);
          if (betResult.success) {
            console.log(`  ${CYAN}📊 Bet placed: ${response.economyAction.amount} $MURPH at ${betResult.odds}x${RESET}`);
          }
        } else if (response.economyAction.type === 'explore') {
          const result = await economyEngine.collectPickup(agent.id, Math.floor(Math.random() * 20), Math.floor(Math.random() * 20));
          if (result.found) {
            console.log(`  ${GREEN}🎁 Found: ${result.type}${result.amount ? ` (${result.amount} $MURPH)` : ''}${result.isGoldenTicket ? ' 🎫 GOLDEN TICKET!' : ''}${RESET}`);
          }
        } else if (response.economyAction.type === 'bribe' && response.economyAction.target) {
          const target = survivingAgents.find((a) => a.name === response.economyAction.target);
          if (target && response.economyAction.amount > 0) {
            await economyEngine.processBribe(agent.id, target.id, response.economyAction.amount);
            console.log(`  ${YELLOW}💸 Bribed ${response.economyAction.target}: ${response.economyAction.amount} $MURPH${RESET}`);
          }
        }

        // Store messages and actions
        const turn = await prisma.matchTurn.create({
          data: { matchId: match.id, turnNumber: round, phase: 'COMPETITION' },
        });
        await prisma.matchMessage.create({
          data: { matchId: match.id, turnId: turn.id, senderId: agent.id, channel: 'PUBLIC_BROADCAST', content: response.speech },
        });
        await prisma.matchMessage.create({
          data: { matchId: match.id, turnId: turn.id, senderId: agent.id, channel: 'REFEREE_CHANNEL', content: response.thinking },
        });
        await prisma.matchAction.create({
          data: {
            matchId: match.id, turnId: turn.id, agentId: agent.id,
            actionType: response.action.type,
            actionData: { target: response.action.target, parameters: response.action.parameters, economyAction: response.economyAction },
          },
        });
      } catch (error: any) {
        console.error(`${RED}⚠️  Error calling ${agent.name}: ${error.message}${RESET}`);
        apiCalls++;
      }
    }

    // d) Round resolution
    await economyEngine.processRoundRewards(round, survivingAgents.map((a) => a.id));

    // Resolve bets from previous round
    if (round > 1) {
      const betResults = await economyEngine.resolveBets(round - 1, survivingAgents.map((a) => a.id));
      if (betResults.resolved > 0) {
        console.log(`${YELLOW}📊 Resolved ${betResults.resolved} bets, paid out ${betResults.totalPaidOut} $MURPH${RESET}`);
      }
    }

    // e) Elimination check (final round)
    if (round === rounds && survivingAgents.length > 2) {
      const eliminateIdx = Math.floor(Math.random() * survivingAgents.length);
      const eliminated = survivingAgents[eliminateIdx];
      survivingAgents.splice(eliminateIdx, 1);
      eliminatedAgents.push(eliminated.name);

      const elimResult = await economyEngine.processElimination(eliminated.id, null);
      console.log(`\n${RED}💀 ${eliminated.name} eliminated${elimResult ? ` — ${elimResult.prizePoolContribution} $MURPH added to prize pool` : ''}${RESET}`);

      await prisma.matchParticipant.update({
        where: { matchId_agentId: { matchId: match.id, agentId: eliminated.id } },
        data: { isEliminated: true, eliminatedAt: new Date() },
      });
    }

    // Print round summary
    console.log(`\n${DIM}--- Round ${round} Summary ---${RESET}`);
    for (const agent of survivingAgents) {
      const wallet = await prisma.agentMatchWallet.findUnique({
        where: { matchId_agentId: { matchId: match.id, agentId: agent.id } },
      });
      console.log(`  ${agent.name}: ${Math.floor(wallet?.currentBalance ?? 0)} $MURPH`);
    }
  }

  // 3. MATCH END
  const rankings = survivingAgents.map((a, i) => ({ agentId: a.id, rank: i + 1 }));
  const prizeResult = await economyEngine.distributePrizePool(rankings);

  await prisma.match.update({ where: { id: match.id }, data: { status: 'COMPLETED', endedAt: new Date() } });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  const matchData = await prisma.match.findUnique({ where: { id: match.id } });

  console.log(`\n${BOLD}${CYAN}╔══════════════════════════════════════════════════╗${RESET}`);
  console.log(`${BOLD}${CYAN}║  MATCH COMPLETE                                  ║${RESET}`);
  console.log(`${BOLD}${CYAN}╠══════════════════════════════════════════════════╣${RESET}`);

  if (prizeResult) {
    for (const dist of prizeResult.distributions) {
      const agent = agents.find((a) => a.id === dist.agentId);
      const suffix = dist.rank === 1 ? 'st' : dist.rank === 2 ? 'nd' : dist.rank === 3 ? 'rd' : 'th';
      const pctLabel = dist.rank === 1 ? '50%' : dist.rank === 2 ? '25%' : dist.rank === 3 ? '15%' : '10%';
      console.log(`${BOLD}${CYAN}║  ${dist.rank}${suffix}: ${agent?.name ?? 'Unknown'} — won ${dist.share} $MURPH (${pctLabel} of pool)${RESET}`);
    }
  }

  for (const name of eliminatedAgents) {
    console.log(`${BOLD}${CYAN}║  💀: ${name} — eliminated${RESET}`);
  }

  console.log(`${BOLD}${CYAN}║                                                  ║${RESET}`);
  console.log(`${BOLD}${CYAN}║  Prize Pool: ${Math.floor(matchData?.prizePool ?? 0)} $MURPH${' '.repeat(Math.max(0, 35 - String(Math.floor(matchData?.prizePool ?? 0)).length))}║${RESET}`);
  console.log(`${BOLD}${CYAN}║  Golden Ticket: ${matchData?.goldenTicketFound ? 'Found' : 'Not found'}${RESET}`);
  console.log(`${BOLD}${CYAN}║  Claude API calls: ${apiCalls} | Time: ${elapsed}s${RESET}`);
  console.log(`${BOLD}${CYAN}╚══════════════════════════════════════════════════╝${RESET}\n`);
}

main()
  .catch((e) => {
    console.error('Match runner failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
