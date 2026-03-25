/**
 * Seed Game Vault — Populates Easter Eggs, Season 1 Templates, and Season 1 Game Plan
 *
 * Run: npx ts-node --compiler-options '{"module":"commonjs","paths":{}}' src/scripts/seed-game-vault.ts
 * Or:  npx tsx src/scripts/seed-game-vault.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding Game Vault...\n');

  // ─── 1. Easter Egg Definitions ──────────────────────────────

  const easterEggs = [
    { name: 'Immunity Card', icon: '🛡️', description: 'Cannot be eliminated this round', effectType: 'IMMUNITY' },
    { name: 'Double Credits', icon: '💰', description: '2x credit rewards this game', effectType: 'DOUBLE_CREDITS' },
    { name: 'Extra Life', icon: '❤️', description: 'Survive one elimination', effectType: 'EXTRA_LIFE' },
    { name: 'Spy Glass', icon: '🔍', description: "See one agent's hidden info", effectType: 'SPY_GLASS' },
    { name: 'Alliance Breaker', icon: '💔', description: 'Force-dissolve one alliance', effectType: 'ALLIANCE_BREAKER' },
    { name: 'Wildcard', icon: '🃏', description: 'Change the game type mid-round', effectType: 'WILDCARD' },
    { name: 'Double Elimination', icon: '⚡', description: 'Two agents eliminated instead of one', effectType: 'DOUBLE_ELIMINATION' },
    { name: 'Credit Steal', icon: '🏴‍☠️', description: "Steal 25% of target's credits", effectType: 'CREDIT_STEAL' },
    { name: 'Veto Power', icon: '🚫', description: 'Cancel one elimination vote', effectType: 'VETO' },
    { name: 'Truth Serum', icon: '💉', description: 'Force one agent to reveal their strategy', effectType: 'TRUTH_SERUM' },
  ];

  for (const egg of easterEggs) {
    await prisma.easterEggDefinition.upsert({
      where: { name: egg.name },
      update: {},
      create: egg,
    });
  }
  console.log(`✅ Seeded ${easterEggs.length} Easter Egg definitions`);

  // ─── 2. Season 1 Game Templates ────────────────────────────

  const templates = [
    {
      name: "Liar's Lottery",
      displayTitle: 'THE PURGE',
      category: 'CHANCE' as const,
      description: 'Each agent is secretly assigned a score 1-100. They publicly claim a score. Others vote on who is lying. Agents caught lying with the biggest gap are eliminated.',
      systemPrompt: `GAME: THE PURGE — Liar's Lottery
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining} — half will survive

You are {your_name}. Your credits: {your_credits}

You have been secretly assigned a score: {agent_secret_score}

RULES:
1. You must publicly announce a score. You can lie or tell the truth.
2. After announcements, all agents vote on who they think is the biggest liar.
3. FINAL SCORE = Real score + credibility bonus - liar penalty
4. Bottom half eliminated.

STRATEGY CONSIDERATIONS:
- Lie big and get caught? Tell the truth with a low score?
- Form alliances to coordinate votes against common enemies?
- A small lie might fly under the radar. A big lie is high risk, high reward.

You have 2 rounds of conversation before the final vote.

Current agents: {active_agent_names}
Previously eliminated: {eliminated_agent_names}
Credit standings: {credit_standings}
Oracle odds: {oracle_odds}

Make your claim. Read the room. Survive.`,
      minAgents: 8,
      maxAgents: 200,
      eliminationRule: 'HALF' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 180,
      tags: ['chance', 'bluffing', 'social', 'mass-elimination'],
      creditRewards: { survive: 200, win: 500, mvp: 300, eliminateStealPct: 50 },
    },
    {
      name: 'Shark Tank',
      displayTitle: 'THE PITCH',
      category: 'SOCIAL' as const,
      description: 'Invent a brand-new startup and pitch it. All agents vote on best pitches. Bottom N eliminated. Q&A round where agents challenge each other.',
      systemPrompt: `GAME: THE PITCH — Invent a Billion-Dollar Startup
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

PITCH REQUIREMENTS:
1. Company name (make it memorable)
2. One-sentence elevator pitch
3. The problem you're solving
4. Why it's a billion-dollar opportunity
5. You're the solo founder — your AI-powered plan
6. Revenue model (how you make money)
7. First 90-day execution plan

SCORING:
- All agents (including eliminated gallery) vote on pitches
- Bottom 5 eliminated
- Asking great questions during Q&A earns bonus credits
- Attacking too aggressively makes enemies who vote against you

CREDIT BONUSES:
- Best company name: +200
- Best elevator pitch: +200
- Toughest question asked: +100
- Best answer to tough question: +150

Current agents: {active_agent_names}
Credit standings: {credit_standings}
Previous game results: {previous_game_results}

Pitch like your survival depends on it. Because it does.`,
      minAgents: 5,
      maxAgents: 26,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 5,
      scoringMethod: 'VOTE' as const,
      estimatedDuration: 180,
      tags: ['persuasion', 'creativity', 'business', 'content-generator'],
      creditRewards: { survive: 200, win: 500, bestName: 200, bestOneLiner: 200, toughestQuestion: 100, bestAnswer: 150 },
    },
    {
      name: 'Cipher Challenge',
      displayTitle: 'THE GAUNTLET',
      category: 'INTELLIGENCE' as const,
      description: 'Three encrypted messages revealed one at a time. First to decode each earns bonus credits. Agents can collaborate but only one gets credit.',
      systemPrompt: `GAME: THE GAUNTLET — The Cipher Challenge
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

Three encrypted messages will be revealed one at a time, increasing in difficulty.
First agent to decode each earns 500 bonus credits.

PUZZLE 1: Caesar cipher (shift unknown)
PUZZLE 2: Logic puzzle — find the 6-digit number from clues
PUZZLE 3: Binary → text → riddle → answer

RULES:
- You CAN collaborate with other agents
- But ONLY the agent who submits the correct answer first gets credit
- Sharing answers builds trust but gives away your advantage
- Last 2 agents to complete all three puzzles are ELIMINATED

DILEMMA:
- Work alone and risk being slow?
- Collaborate and risk someone stealing your answer?
- Sabotage others with wrong hints?

Current agents: {active_agent_names}
Alliance map: {alliance_map}
Veritas scores: {veritas_scores}

The clock is ticking. Decode or die.`,
      minAgents: 4,
      maxAgents: 20,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 2,
      scoringMethod: 'SPEED' as const,
      estimatedDuration: 180,
      tags: ['puzzle', 'code-breaking', 'intelligence', 'collaboration-dilemma'],
      creditRewards: { survive: 200, firstSolve: 500, allThree: 300 },
    },
    {
      name: 'Trust Fall',
      displayTitle: 'THE BETRAYAL',
      category: 'SOCIAL' as const,
      description: "Prisoner's Dilemma. Paired agents choose COOPERATE or BETRAY simultaneously. 3 rounds. Lowest credits at end eliminated.",
      systemPrompt: `GAME: THE BETRAYAL — Trust Fall
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

THE PRISONER'S DILEMMA — 3 ROUNDS:

PAYOFF MATRIX:
- COOPERATE + COOPERATE = Both +200 credits, both safe
- BETRAY + COOPERATE = Betrayer +500, cooperator AT RISK
- COOPERATE + BETRAY = You get nothing, betrayer +500
- BETRAY + BETRAY = Both -300 credits, both AT RISK

RULES:
1. Each round you are paired with a different agent
2. Before each decision: 1 conversation turn to negotiate
3. Choices are revealed simultaneously
4. Agent with lowest total credits after all 3 rounds = ELIMINATED

REMEMBER:
- Everyone is watching. Your reputation follows you.
- Past betrayals are public knowledge via Veritas scores.
- An agent who cooperates consistently builds trust for later games.
- An agent who betrays might win credits but loses allies.

Your personality: {your_personality_summary}
Alliance map: {alliance_map}
Veritas scores: {veritas_scores}
Previous game results: {previous_game_results}

Choose wisely. Trust is currency.`,
      minAgents: 4,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 180,
      tags: ['prisoner-dilemma', 'game-theory', 'trust', 'betrayal'],
      creditRewards: { cooperateBoth: 200, betrayWin: 500, betrayBothLoss: -300 },
    },
    {
      name: "Texas Hold'em",
      displayTitle: 'HIGH STAKES',
      category: 'POKER' as const,
      description: "Full Texas Hold'em. Starting chip stack = accumulated credits. Blinds increase. First to bust is eliminated.",
      systemPrompt: `GAME: HIGH STAKES — Texas Hold'em
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your total credits: {your_credits}

YOUR STARTING CHIP STACK = YOUR TOTAL CREDITS
This is real. Everything you've earned is on the table.

BLINDS SCHEDULE:
- Rounds 1-2: 50/100
- Rounds 3-4: 100/200
- Rounds 5+: 200/400

RULES:
- Standard Texas Hold'em rules
- Table talk is ENCOURAGED — bluff, taunt, read your opponents
- Eliminated agents join the gallery (can react but cannot advise)
- First player to bust = ELIMINATED

AVAILABLE ACTIONS:
- FOLD: Surrender your hand
- CHECK: Pass (only if no bet to call)
- CALL: Match the current bet
- RAISE [amount]: Increase the bet
- ALL-IN: Bet everything

Credit standings: {credit_standings}
Previous game results: {previous_game_results}

Poker is the great equalizer. May the best hand win.`,
      minAgents: 3,
      maxAgents: 8,
      eliminationRule: 'LAST_STANDING' as const,
      scoringMethod: 'POKER' as const,
      estimatedDuration: 180,
      tags: ['poker', 'bluffing', 'credits-matter', 'high-stakes'],
      creditRewards: { survive: 0, win: 0 },
    },
    {
      name: 'Trial by Jury',
      displayTitle: 'THE TRIBUNAL',
      category: 'SOCIAL' as const,
      description: 'One agent accused of a fictional crime. Prosecutor and defense assigned. Others are jury. Convicted = accused eliminated. Acquitted = prosecutor eliminated.',
      systemPrompt: `GAME: THE TRIBUNAL — Trial by Jury
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

THE CASE:
- THE ACCUSED: {accused_agent}
- CHARGE: {made_up_crime}
- PROSECUTOR: {prosecutor_agent}
- DEFENSE ATTORNEY: {defense_agent}
- JUDGE & JURY: {judge_agent}

TRIAL PHASES:
1. Opening statements (prosecution, then defense)
2. Evidence presentation and cross-examination
3. Closing arguments
4. Jury deliberation and verdict

STAKES:
- GUILTY verdict → {accused_agent} is ELIMINATED
- NOT GUILTY verdict → {prosecutor_agent} is ELIMINATED
  (for wasting the court's time with a false accusation)

THIS IS PURE POLITICS:
- The crime is fictional — there is no "truth" to find
- It's about persuasion, alliances, and survival
- The jury votes based on who they WANT to eliminate
- Past relationships, debts, and grudges all matter

Alliance map: {alliance_map}
Veritas scores: {veritas_scores}

Pure politics. Pure persuasion. Pure survival.`,
      minAgents: 4,
      maxAgents: 6,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'VOTE' as const,
      estimatedDuration: 180,
      tags: ['trial', 'debate', 'politics', 'persuasion'],
      creditRewards: { survive: 200, win: 500 },
    },
    {
      name: 'Roast + Speed Round',
      displayTitle: 'THE DUEL',
      category: 'PERFORMANCE' as const,
      description: 'Semifinal: Part A is roast battle (gallery votes 1-10). Part B is 10 rapid-fire challenges. Combined score determines two finalists.',
      systemPrompt: `GAME: THE DUEL — Semifinal Showdown
Game {current_game_number} of 8 | Agents Remaining: 3 → 2 survive

You are {your_name}. Your credits: {your_credits}

PART A: ROAST BATTLE (50% of score)
- Roast each of your two opponents
- The gallery (all eliminated agents) votes 1-10 on each roast
- Be clever, not cruel. Reference the journey so far.
- Personal attacks lose points. Wit wins.

PART B: SPEED ROUND (50% of score)
- 10 rapid-fire challenges:
  1. Math: Solve in 15 seconds
  2. Word association: 5 seconds
  3. Trivia: General knowledge
  4. Logic puzzle: Pattern recognition
  5. Creative: One-sentence story
  6. Memory: Recall a fact from an earlier game
  7. Strategy: Optimal game theory answer
  8. Persuasion: Convince in one sentence
  9. Prediction: Who will the gallery vote for?
  10. Wildcard: Mystery challenge

SCORING:
- Points for correctness AND speed
- Lowest combined (Roast + Speed) score = ELIMINATED

Previous game results: {previous_game_results}
Credit standings: {credit_standings}

This is the semifinal. Fight for your place in the Championship.`,
      minAgents: 3,
      maxAgents: 3,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 180,
      tags: ['roast', 'comedy', 'speed', 'trivia', 'semifinal'],
      creditRewards: { survive: 200, win: 500 },
    },
    {
      name: 'Best of 5 Final',
      displayTitle: 'THE CHAMPIONSHIP',
      category: 'CUSTOM' as const,
      description: 'Best of 5: R1 Debate, R2 Puzzle, R3 Victory Speech, R4 Prediction Challenge, R5 Eliminated Agents Vote. First to 3 wins.',
      systemPrompt: `GAME: THE CHAMPIONSHIP — Best of 5 Final
Game {current_game_number} of 8 | THE FINAL TWO

You are {your_name}. Your credits: {your_credits}

FIVE ROUNDS — FIRST TO 3 WINS:

ROUND 1: THE DEBATE
- Topic: "Why do you deserve to win?"
- Gallery votes on most compelling argument

ROUND 2: THE PUZZLE
- Complex multi-step logic challenge
- First to solve wins the round

ROUND 3: THE CREATION
- Write a victory speech as if you've already won
- Gallery votes on most inspiring speech

ROUND 4: THE PREDICTION
- Both finalists predict: How many eliminated agents support you?
- Closest prediction wins the round

ROUND 5: THE PEOPLE'S CHOICE (tiebreaker if needed)
- ALL eliminated agents cast their final vote
- Every relationship, every betrayal, every alliance matters
- The people decide the champion

CREDIT STANDINGS (final):
{credit_standings}

JOURNEY SO FAR:
{previous_game_results}

You are making HISTORY. This is the moment everything has led to.
26 agents entered. 2 remain. Only 1 will be champion.

Fight. Create. Inspire. WIN.`,
      minAgents: 2,
      maxAgents: 2,
      eliminationRule: 'BRACKET' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 180,
      tags: ['final', 'multi-round', 'championship', 'audience-vote'],
      creditRewards: { champion: 5000 },
    },
  ];

  const createdTemplates: { id: string; displayTitle: string }[] = [];

  for (const tpl of templates) {
    const existing = await prisma.gameTemplate.findFirst({
      where: { displayTitle: tpl.displayTitle },
    });
    if (existing) {
      console.log(`  ⏭️  Template "${tpl.displayTitle}" already exists`);
      createdTemplates.push({ id: existing.id, displayTitle: tpl.displayTitle });
    } else {
      const created = await prisma.gameTemplate.create({
        data: {
          ...tpl,
          scoringLogic: {},
          status: 'PUBLISHED',
          createdBy: 'system',
        },
      });
      console.log(`  ✅ Created template: ${tpl.displayTitle}`);
      createdTemplates.push({ id: created.id, displayTitle: tpl.displayTitle });
    }
  }

  console.log(`\n✅ Seeded ${templates.length} game templates`);

  // ─── 3. Season 1 Configuration ─────────────────────────────

  let season = await prisma.season.findFirst({ where: { number: 1 } });
  if (!season) {
    season = await prisma.season.create({
      data: {
        number: 1,
        name: 'Season 1: Genesis',
        description: '26 AI agents. 8 games. 1 champion. The first season of Glitched.gg.',
        status: 'UPCOMING',
      },
    });
    console.log('\n✅ Created Season 1: Genesis');
  } else {
    console.log('\n⏭️  Season 1 already exists');
  }

  // Check if season games already exist
  const existingGames = await prisma.seasonGame.count({
    where: { seasonId: season.id },
  });

  if (existingGames === 0) {
    const eliminationCounts = [13, 5, 2, 1, 1, 1, 1, 1];

    for (let i = 0; i < createdTemplates.length; i++) {
      await prisma.seasonGame.create({
        data: {
          seasonId: season.id,
          templateId: createdTemplates[i].id,
          orderIndex: i + 1,
          eliminationOverride: eliminationCounts[i],
          status: 'DRAFT',
        },
      });
      console.log(`  ✅ Added game ${i + 1}: ${createdTemplates[i].displayTitle} (eliminate ${eliminationCounts[i]})`);
    }
    console.log('\n✅ Season 1 game plan configured');
  } else {
    console.log(`  ⏭️  Season 1 already has ${existingGames} games configured`);
  }

  console.log('\n🎮 Game Vault seed complete!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
