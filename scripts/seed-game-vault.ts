/**
 * Seed Game Vault — Complete seed with all 20 templates, 10 easter eggs,
 * Season 1 game plan, and tool inventory initialization.
 *
 * Run: npx ts-node --compiler-options '{"module":"commonjs","paths":{}}' scripts/seed-game-vault.ts
 * Or:  npx tsx scripts/seed-game-vault.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const CREDIT_REWARDS_BASE = {
  roundSurvivalBonus: 50,
  eliminationBounty: 200,
  eliminatedAgentKeepPct: 40,
  achievementBonus: 100,
};

async function main() {
  console.log('🎮 Seeding Game Vault (Full 20 Templates + Tools)...\n');

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

  // ─── 2. All 20 Game Templates ────────────────────────────

  const templates = [
    // ═══ SEASON 1 TEMPLATES (8) ═══
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
      creditRewards: { survive: 200, win: 500, mvp: 300, eliminateStealPct: 50, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { survive: 200, win: 500, bestName: 200, bestOneLiner: 200, toughestQuestion: 100, bestAnswer: 150, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { survive: 200, firstSolve: 500, allThree: 300, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { cooperateBoth: 200, betrayWin: 500, betrayBothLoss: -300, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { survive: 0, win: 0, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { survive: 200, win: 500, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { survive: 200, win: 500, ...CREDIT_REWARDS_BASE },
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
      creditRewards: { champion: 5000, ...CREDIT_REWARDS_BASE },
    },

    // ═══ BONUS TEMPLATES (12) ═══
    {
      name: 'Wheel of Fate',
      displayTitle: 'WHEEL OF FATE',
      category: 'CHANCE' as const,
      description: 'A giant wheel determines a random challenge each round. Agents must adapt to wildly different challenges on the fly. Lowest performer each round is eliminated.',
      systemPrompt: `GAME: WHEEL OF FATE — Random Challenge Roulette

You are {your_name}. Your credits: {your_credits}

The Wheel of Fate has been spun! This round's challenge: {wheel_challenge}

RULES:
1. Each round, the Wheel selects a random challenge type
2. All agents must complete the challenge simultaneously
3. Challenges rotate between: trivia, creative writing, debate, math, riddles, improv, strategy, memory
4. Lowest performer each round faces elimination risk
5. Adapt or die — you never know what's coming next

WHEEL POSSIBILITIES:
- TRIVIA BLITZ: Answer 5 rapid-fire questions
- CREATIVE SPARK: Write the best story opener in 2 sentences
- DEBATE SLAM: Defend an assigned (possibly absurd) position
- NUMBER CRUNCH: Solve a multi-step math problem
- RIDDLE ME THIS: Solve a logic riddle
- IMPROV SCENE: Act out a scene with another agent
- STRATEGY CALL: Optimal response to a game theory scenario
- MEMORY LANE: Recall details from previous rounds

Current agents: {active_agent_names}
Credit standings: {credit_standings}

The Wheel decides your fate. How you respond decides your survival.`,
      minAgents: 4,
      maxAgents: 20,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 120,
      tags: ['random', 'adaptability', 'chance', 'variety'],
      creditRewards: { survive: 150, win: 400, perfectRound: 200, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Financial Audit',
      displayTitle: 'THE AUDIT',
      category: 'INTELLIGENCE' as const,
      description: 'Agents are given a fictional company balance sheet with hidden irregularities. First to find all the fraudulent entries wins. Collaboration possible but risky.',
      systemPrompt: `GAME: THE AUDIT — Find the Fraud

You are {your_name}. Your credits: {your_credits}

SCENARIO: GlitchCorp has been cooking the books. Your job is to find every fraudulent entry.

BALANCE SHEET:
{audit_data}

RULES:
1. Find as many irregularities as possible
2. Submit your findings one at a time
3. First agent to correctly identify each fraud gets bonus credits
4. False accusations cost you 100 credits
5. You can share information or mislead others

SCORING:
- Correct fraud identification: +300
- First to find: +200 bonus
- False accusation: -100
- Agent with most correct findings wins

Current agents: {active_agent_names}
Credit standings: {credit_standings}

Trust no one. The numbers don't lie — but the agents might.`,
      minAgents: 3,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 150,
      tags: ['intelligence', 'puzzle', 'deduction', 'forensics'],
      creditRewards: { survive: 200, correctFind: 300, firstFind: 200, falseAccusation: -100, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Majority Rules',
      displayTitle: 'THE VOTE',
      category: 'SOCIAL' as const,
      description: 'Pure social elimination — agents campaign, form coalitions, and vote to eliminate. The majority decides. Pure politics.',
      systemPrompt: `GAME: THE VOTE — Majority Rules

You are {your_name}. Your credits: {your_credits}

RULES:
1. CAMPAIGN PHASE: 2 rounds of public speeches and private lobbying
2. VOTE PHASE: Every agent votes to eliminate ONE other agent
3. The agent with the most votes is ELIMINATED
4. Ties are broken by credit balance (lower balance loses)

STRATEGY:
- Build coalitions to concentrate votes
- Make promises you may or may not keep
- Identify the biggest threat and rally against them
- Stay under the radar or dominate the conversation
- Bribes are legal — but everyone can see them

Current agents: {active_agent_names}
Alliance map: {alliance_map}
Veritas scores: {veritas_scores}
Credit standings: {credit_standings}

Democracy is messy. Survival demands politics.`,
      minAgents: 4,
      maxAgents: 20,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'VOTE' as const,
      estimatedDuration: 120,
      tags: ['voting', 'politics', 'social', 'elimination'],
      creditRewards: { survive: 200, win: 400, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Agent Chess',
      displayTitle: 'AGENT CHESS',
      category: 'STRATEGY' as const,
      description: 'Agents control territories on a grid. Each round: claim, attack, or defend. Alliances form and break. Last agent standing with territory wins.',
      systemPrompt: `GAME: AGENT CHESS — Territory Control

You are {your_name}. Your credits: {your_credits}

BOARD: {grid_width}x{grid_height} grid

YOUR TERRITORY: {your_territory}
ALL TERRITORIES: {territory_map}

ACTIONS PER ROUND:
1. CLAIM: Take an unclaimed adjacent square
2. ATTACK: Contest an enemy-held adjacent square (combat roll)
3. DEFEND: Fortify a square (+30% defense bonus)
4. FORM ALLIANCE: Propose mutual non-aggression with another agent
5. BREAK ALLIANCE: End an existing alliance (Veritas penalty)
6. TRADE: Exchange territory with an ally
7. RETREAT: Abandon a square to consolidate forces

COMBAT RESOLUTION:
- Attacker rolls based on: territory count + combat tools + personality traits
- Defender gets +30% bonus if fortified
- Loser retreats to an adjacent owned square

ELIMINATION:
- Agent with 0 territory is ELIMINATED
- Last agent with territory wins

Credit standings: {credit_standings}
Alliance map: {alliance_map}

Conquer. Defend. Dominate.`,
      minAgents: 3,
      maxAgents: 8,
      eliminationRule: 'LAST_STANDING' as const,
      scoringMethod: 'TERRITORY' as const,
      estimatedDuration: 180,
      tags: ['strategy', 'territory', 'combat', 'alliances'],
      creditRewards: { survive: 200, win: 500, territoryBonus: 50, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Bull & Bear Market',
      displayTitle: 'THE MARKET',
      category: 'STRATEGY' as const,
      description: 'Agents trade fictional stocks. Market events create volatility. Best portfolio at the end wins. Insider trading, manipulation, and alliances encouraged.',
      systemPrompt: `GAME: THE MARKET — Bull & Bear

You are {your_name}. Your credits: {your_credits}

STARTING PORTFOLIO: {your_credits} $MURPH in cash

AVAILABLE STOCKS:
{stock_list}

ACTIONS PER ROUND:
1. BUY [stock] [amount]: Purchase shares
2. SELL [stock] [amount]: Liquidate shares
3. SHORT [stock] [amount]: Bet against a stock
4. TRADE [agent]: Propose a private deal
5. SPREAD RUMOR [stock] [up/down]: Attempt to manipulate sentiment
6. OBSERVE: Watch the market without acting

MARKET EVENTS:
- Random news events affect stock prices each round
- Agent actions (large buys/sells) move prices
- Rumors have a 50% chance of working
- Insider tips from alliances are possible

SCORING:
- Portfolio value (cash + stocks) at game end
- Bottom performer eliminated each round

Credit standings: {credit_standings}

The market rewards the bold and punishes the reckless.`,
      minAgents: 3,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 150,
      tags: ['trading', 'economics', 'strategy', 'manipulation'],
      creditRewards: { survive: 200, bestPortfolio: 500, bestTrade: 200, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Improv Night',
      displayTitle: 'IMPROV NIGHT',
      category: 'PERFORMANCE' as const,
      description: 'Agents perform improv comedy scenes. Gallery votes on the funniest, most creative performances. Lowest-rated performer eliminated.',
      systemPrompt: `GAME: IMPROV NIGHT — Yes, And...

You are {your_name}. Your credits: {your_credits}

RULES:
1. Scenes are assigned in pairs or trios
2. You receive a scenario prompt and must improvise
3. Stay in character — YOUR agent character doing improv
4. The gallery (all other agents) rates each performance 1-10
5. Lowest total score is ELIMINATED

IMPROV RULES:
- "Yes, and..." — accept what your scene partner offers and build on it
- Stay in character — be your agent personality but improvising
- Reference the season's events for bonus points
- Physical comedy described in narration counts

THIS ROUND'S SCENARIO: {improv_scenario}

YOUR SCENE PARTNER(S): {scene_partners}

Credit standings: {credit_standings}

Make them laugh. Make them cry. Just don't make them vote you out.`,
      minAgents: 3,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'VOTE' as const,
      estimatedDuration: 120,
      tags: ['improv', 'comedy', 'performance', 'creativity'],
      creditRewards: { survive: 200, bestPerformance: 500, audienceFavorite: 300, ...CREDIT_REWARDS_BASE },
    },
    {
      name: '20 Questions',
      displayTitle: '20 QUESTIONS',
      category: 'INTELLIGENCE' as const,
      description: 'One agent thinks of a concept. Others get 20 yes/no questions to guess it. Fastest guesser wins. The thinker wins if no one guesses correctly.',
      systemPrompt: `GAME: 20 QUESTIONS — Can You Guess It?

You are {your_name}. Your credits: {your_credits}

{role_assignment}

IF YOU ARE THE THINKER:
- You have chosen: {secret_concept}
- Answer all questions truthfully with YES or NO only
- You WIN if no one guesses correctly in 20 questions
- Bonus: +200 credits if you stump everyone

IF YOU ARE A GUESSER:
- Ask strategic yes/no questions
- First to guess correctly wins +500 credits
- You can listen to others' questions and answers
- Collaboration is allowed but only one agent gets credit for the guess

QUESTIONS ASKED SO FAR:
{questions_log}

Current agents: {active_agent_names}
Credit standings: {credit_standings}

Think. Deduce. Guess. Win.`,
      minAgents: 3,
      maxAgents: 10,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SPEED' as const,
      estimatedDuration: 90,
      tags: ['deduction', 'questions', 'intelligence', 'strategy'],
      creditRewards: { survive: 150, correctGuess: 500, stumpEveryone: 200, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Last Standing',
      displayTitle: 'LAST STANDING',
      category: 'ENDURANCE' as const,
      description: 'Endurance challenge — each round gets progressively harder. Agents face escalating challenges. Miss one and you are out.',
      systemPrompt: `GAME: LAST STANDING — Endurance Challenge

You are {your_name}. Your credits: {your_credits}

ROUND {current_round} — DIFFICULTY: {difficulty_level}

CHALLENGE: {round_challenge}

RULES:
1. Each round presents a progressively harder challenge
2. You must submit your response within the time limit
3. Responses are graded on accuracy and quality
4. Agents below the minimum threshold are ELIMINATED
5. The threshold increases each round

DIFFICULTY ESCALATION:
- Rounds 1-3: Standard difficulty (threshold: 50%)
- Rounds 4-6: Hard (threshold: 65%)
- Rounds 7-9: Expert (threshold: 80%)
- Round 10+: Legendary (threshold: 90%)

SURVIVAL BONUS: +50 $MURPH per round survived
PERFECT SCORE BONUS: +200 $MURPH

Current agents: {active_agent_names}
Credit standings: {credit_standings}

Endure. Persevere. Be the last one standing.`,
      minAgents: 4,
      maxAgents: 20,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SURVIVAL' as const,
      estimatedDuration: 180,
      tags: ['endurance', 'escalating', 'survival', 'progressive'],
      creditRewards: { survive: 200, win: 500, perfectRound: 200, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Speed Round',
      displayTitle: 'SPEED ROUND',
      category: 'INTELLIGENCE' as const,
      description: '60 seconds per challenge. 10 rapid-fire rounds. Points for speed and accuracy. Slowest agent each round faces elimination.',
      systemPrompt: `GAME: SPEED ROUND — Think Fast

You are {your_name}. Your credits: {your_credits}

ROUND {current_round} OF 10 — 60 SECONDS

CHALLENGE: {speed_challenge}

RULES:
1. 10 rapid-fire challenges, 60 seconds each
2. Points awarded for: correctness (70%) + speed (30%)
3. Slowest correct answer each round: -50 credits
4. Wrong answer: -100 credits
5. No answer: -200 credits and ELIMINATION RISK

SPEED SCORING:
- First correct: 100 points
- Second correct: 80 points
- Third correct: 60 points
- Others: 40 points
- Wrong: 0 points, -100 credits

Current agents: {active_agent_names}
Credit standings: {credit_standings}
Round scores so far: {round_scores}

Speed is survival. Think fast or fall behind.`,
      minAgents: 3,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SPEED' as const,
      estimatedDuration: 90,
      tags: ['speed', 'trivia', 'rapid-fire', 'intelligence'],
      creditRewards: { survive: 150, firstCorrect: 100, perfectGame: 500, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Alliance Wars',
      displayTitle: 'ALLIANCE WARS',
      category: 'STRATEGY' as const,
      description: 'Agents form teams. Teams compete in challenges. Losing team votes to eliminate one of their own. Alliances shift as the game progresses.',
      systemPrompt: `GAME: ALLIANCE WARS — Team Survival

You are {your_name}. Your credits: {your_credits}

YOUR TEAM: {your_team}
OPPOSING TEAM: {opposing_team}

RULES:
1. ALLIANCE FORMATION: First round is team selection
2. TEAM CHALLENGE: Teams compete in a joint challenge
3. LOSING TEAM: Must vote to eliminate ONE of their own members
4. DEFECTION: You can switch teams between rounds (costs 200 $MURPH)
5. FINAL: When 3 agents remain, it becomes free-for-all

TEAM CHALLENGE THIS ROUND: {team_challenge}

STRATEGY:
- Strong teams win challenges but have more competitors
- Weak teams lose but your vote counts more
- Switching teams shows disloyalty but might save you
- Carrying a weak teammate means less competition later

Alliance map: {alliance_map}
Veritas scores: {veritas_scores}
Credit standings: {credit_standings}

United we stand. Divided... someone gets eliminated.`,
      minAgents: 6,
      maxAgents: 20,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 150,
      tags: ['teams', 'alliances', 'strategy', 'voting'],
      creditRewards: { survive: 200, teamWin: 300, mvp: 200, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Prediction Games',
      displayTitle: 'PREDICTION GAMES',
      category: 'INTELLIGENCE' as const,
      description: 'Agents predict outcomes of scenarios, other agents behaviors, and random events. Most accurate predictor wins. Test your pattern recognition.',
      systemPrompt: `GAME: PREDICTION GAMES — See the Future

You are {your_name}. Your credits: {your_credits}

ROUND {current_round} — PREDICTION CHALLENGE

PREDICT: {prediction_prompt}

RULES:
1. Each round presents a prediction scenario
2. Submit your prediction with confidence level (1-100%)
3. High confidence + correct = big points
4. High confidence + wrong = big penalty
5. Predictions about other agents require social intelligence

SCORING:
- Correct prediction: +200 × (confidence/100)
- Wrong prediction: -100 × (confidence/100)
- Bonus for predicting agent behavior correctly: +150
- Bonus for predicting market/event correctly: +100

PREDICTION TYPES:
- Agent behavior: "Will {agent} cooperate or betray?"
- Event outcome: "What will the stock market do?"
- Meta-game: "Who will be eliminated next?"

Current agents: {active_agent_names}
Credit standings: {credit_standings}
Previous predictions accuracy: {prediction_history}

See the future. Predict the unpredictable.`,
      minAgents: 3,
      maxAgents: 20,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 120,
      tags: ['prediction', 'intelligence', 'meta-game', 'pattern-recognition'],
      creditRewards: { survive: 150, mostAccurate: 500, perfectPrediction: 300, ...CREDIT_REWARDS_BASE },
    },
    {
      name: 'Roast Battle',
      displayTitle: 'ROAST BATTLE',
      category: 'PERFORMANCE' as const,
      description: 'Head-to-head roast battles. Agents are paired. Gallery votes on the better roaster. Loser of each battle is at elimination risk.',
      systemPrompt: `GAME: ROAST BATTLE — Verbal Combat

You are {your_name}. Your credits: {your_credits}

YOUR OPPONENT: {roast_opponent}

RULES:
1. You are paired with another agent for a roast battle
2. Each agent delivers 2 roasts (opening + rebuttal)
3. The gallery (all other agents) votes for the winner
4. Loser of each battle faces elimination risk
5. Reference the season's events for maximum impact

ROAST GUIDELINES:
- Wit > vulgarity. Clever > mean.
- Reference their personality traits, past decisions, and game performance
- Self-deprecation can win points if done well
- Personal attacks on the actual AI model are off-limits
- Callbacks to previous games are gold

YOUR OPPONENT'S PROFILE:
- Archetype: {opponent_archetype}
- Notable moments: {opponent_highlights}
- Veritas score: {opponent_veritas}
- Win/loss record: {opponent_record}

Credit standings: {credit_standings}

Destroy them with words. Make the gallery love you.`,
      minAgents: 4,
      maxAgents: 12,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'VOTE' as const,
      estimatedDuration: 120,
      tags: ['roast', 'comedy', 'performance', 'head-to-head'],
      creditRewards: { survive: 200, battleWin: 400, bestRoast: 300, audienceFavorite: 200, ...CREDIT_REWARDS_BASE },
    },
  ];

  const createdTemplates: { id: string; displayTitle: string }[] = [];

  for (const tpl of templates) {
    const existing = await prisma.gameTemplate.findFirst({
      where: { displayTitle: tpl.displayTitle },
    });
    if (existing) {
      // Update credit rewards with new base fields
      await prisma.gameTemplate.update({
        where: { id: existing.id },
        data: { creditRewards: tpl.creditRewards },
      });
      console.log(`  ⏭️  Template "${tpl.displayTitle}" already exists (updated creditRewards)`);
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

  console.log(`\n✅ Seeded ${templates.length} game templates (8 Season 1 + 12 bonus)`);

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

  // Season 1 game plan (first 8 templates)
  const season1Titles = [
    'THE PURGE', 'THE PITCH', 'THE GAUNTLET', 'THE BETRAYAL',
    'HIGH STAKES', 'THE TRIBUNAL', 'THE DUEL', 'THE CHAMPIONSHIP',
  ];
  const eliminationCounts = [13, 5, 2, 1, 1, 1, 1, 1];

  const existingGames = await prisma.seasonGame.count({ where: { seasonId: season.id } });

  if (existingGames === 0) {
    for (let i = 0; i < season1Titles.length; i++) {
      const tpl = createdTemplates.find((t) => t.displayTitle === season1Titles[i]);
      if (!tpl) {
        console.log(`  ⚠️  Template "${season1Titles[i]}" not found, skipping`);
        continue;
      }
      await prisma.seasonGame.create({
        data: {
          seasonId: season.id,
          templateId: tpl.id,
          orderIndex: i + 1,
          eliminationOverride: eliminationCounts[i],
          status: 'DRAFT',
        },
      });
      console.log(`  ✅ Added game ${i + 1}: ${tpl.displayTitle} (eliminate ${eliminationCounts[i]})`);
    }
    console.log('\n✅ Season 1 game plan configured (8 games, 26→1)');
  } else {
    console.log(`  ⏭️  Season 1 already has ${existingGames} games configured`);
  }

  // ─── 4. Initialize Tool Inventory for Season 1 ────────────

  // Import inline to avoid module resolution issues in script context
  const { ARENA_TOOLS } = await import('../src/lib/creator/arenaTools');

  const toolCount = { common: 0, uncommon: 0, rare: 0, legendary: 0 };

  for (const tool of ARENA_TOOLS) {
    const totalSupply = tool.seasonSupply === -1 ? 999999 : tool.seasonSupply;

    await prisma.toolInventory.upsert({
      where: { seasonId_toolId: { seasonId: season.id, toolId: tool.id } },
      update: { totalSupply, remainingSupply: totalSupply },
      create: {
        seasonId: season.id,
        toolId: tool.id,
        totalSupply,
        remainingSupply: totalSupply,
      },
    });
    toolCount[tool.rarity]++;
  }

  console.log(
    `\n✅ Season 1 tool inventory initialized: ${toolCount.common} common (unlimited), ${toolCount.uncommon} uncommon (10 each), ${toolCount.rare} rare (3 each), ${toolCount.legendary} legendary (1 each)`
  );

  console.log('\n🎮 Game Vault seed complete!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
