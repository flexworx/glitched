/**
 * Seed Game Vault v2 — Adds 12 new game templates + updates existing 8 with recommendation metadata
 *
 * Run: npx tsx src/scripts/seed-game-vault-v2.ts
 */
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('🎮 Seeding Game Vault v2 — 12 new templates + metadata updates...\n');

  // ─── Update existing 8 templates with recommendation metadata ──

  const existingUpdates = [
    { displayTitle: 'THE PURGE', recommendedRounds: ['early'], recommendedAgents: ['25+'], teamFormation: { type: 'free_for_all', oddRule: 'No teams — all agents compete individually', evenRule: 'No teams — all agents compete individually' } },
    { displayTitle: 'THE PITCH', recommendedRounds: ['early', 'mid'], recommendedAgents: ['10-25'], teamFormation: { type: 'free_for_all', oddRule: 'All agents pitch individually — odd/even irrelevant', evenRule: 'All agents pitch individually' } },
    { displayTitle: 'THE GAUNTLET', recommendedRounds: ['mid'], recommendedAgents: ['6-10'], teamFormation: { type: 'free_for_all', oddRule: 'All agents solve puzzles individually', evenRule: 'All agents solve puzzles individually' } },
    { displayTitle: 'THE BETRAYAL', recommendedRounds: ['mid'], recommendedAgents: ['6-10', '3-5'], teamFormation: { type: 'rotating_pairs', oddRule: 'Odd agent out serves as the Observer — watches one pair and publicly reports what they saw (true or false)', evenRule: 'All agents paired evenly', groupSize: 2 } },
    { displayTitle: 'HIGH STAKES', recommendedRounds: ['mid', 'late'], recommendedAgents: ['3-5'], teamFormation: { type: 'free_for_all', oddRule: 'Poker table — odd numbers are natural', evenRule: 'Standard poker seating' } },
    { displayTitle: 'THE TRIBUNAL', recommendedRounds: ['late'], recommendedAgents: ['3-5'], teamFormation: { type: 'free_for_all', oddRule: 'With 5: accused + prosecutor + defense + 2 jury. With 3: accused + prosecutor-jury + defense-jury', evenRule: 'With 4: accused + prosecutor + defense + judge/jury' } },
    { displayTitle: 'THE DUEL', recommendedRounds: ['late', 'finale'], recommendedAgents: ['3-5'], teamFormation: { type: 'free_for_all', oddRule: 'Semifinal is always 3 agents — designed for odd count', evenRule: 'If 4: two semifinal duels, winners face off' } },
    { displayTitle: 'THE CHAMPIONSHIP', recommendedRounds: ['finale'], recommendedAgents: ['2'], teamFormation: { type: 'pairs', oddRule: 'Championship is always 2 agents — if 3 remain, run THE DUEL first', evenRule: 'Head-to-head best of 5' } },
  ];

  for (const upd of existingUpdates) {
    const existing = await prisma.gameTemplate.findFirst({ where: { displayTitle: upd.displayTitle } });
    if (existing) {
      await prisma.gameTemplate.update({
        where: { id: existing.id },
        data: {
          recommendedRounds: upd.recommendedRounds,
          recommendedAgents: upd.recommendedAgents,
          teamFormation: upd.teamFormation,
        },
      });
      console.log(`  ✏️  Updated ${upd.displayTitle} with round/agent recommendations`);
    }
  }

  // ─── 12 New Game Templates ──────────────────────────────────

  const newTemplates = [
    // === EARLY ROUND GAMES (25+ agents) ===
    {
      name: 'The Auction House',
      displayTitle: 'THE AUCTION',
      category: 'STRATEGY' as const,
      description: 'Agents bid on mystery power-ups using their credits. Overbidders go bankrupt. Underbidders get nothing. Bottom credit holders eliminated.',
      systemPrompt: `GAME: THE AUCTION — Blind Bid Bonanza
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

5 MYSTERY LOTS will be auctioned. Each lot contains a game advantage (immunity, double credits, intel, alliance boost, or wildcard). You don't know which lot has which prize.

RULES:
1. All agents submit SEALED BIDS for each lot (simultaneously)
2. Highest bidder wins the lot and PAYS their bid
3. If you bid more than your credits, you're BANKRUPT — instant elimination risk
4. Agents who win nothing are vulnerable
5. After auction: bottom 30% by remaining credits are ELIMINATED

ODD/EVEN HANDLING:
- If odd number of agents: one lot becomes a "Cursed Lot" — winner LOSES credits equal to their bid instead of gaining a prize. Which lot is cursed? Nobody knows.
- If even: all 5 lots are genuine prizes.

STRATEGY: Bid just enough to win but not so much you go broke. Let others overpay. Form bid cartels?

Credit standings: {credit_standings}
Alliance map: {alliance_map}
Oracle odds: {oracle_odds}`,
      minAgents: 8,
      maxAgents: 200,
      eliminationRule: 'BOTTOM' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 120,
      tags: ['auction', 'bidding', 'credits', 'strategy', 'mass-elimination'],
      creditRewards: { survive: 200, win: 500, bestDeal: 300 },
      recommendedRounds: ['early'],
      recommendedAgents: ['25+'],
      teamFormation: { type: 'free_for_all', oddRule: 'One lot becomes cursed', evenRule: 'All lots are genuine' },
    },
    {
      name: 'Rumor Mill',
      displayTitle: 'THE WHISPER',
      category: 'SOCIAL' as const,
      description: 'Each agent writes a secret rumor about another agent. Rumors are published anonymously. Agents vote on which rumors to believe. Agents whose rumors are identified are eliminated.',
      systemPrompt: `GAME: THE WHISPER — Rumor Mill
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

PHASE 1 — PLANT RUMORS:
Write ONE anonymous rumor about any other agent. It can be true or completely fabricated.
Example: "{target_name} secretly offered to betray their alliance for credits"

PHASE 2 — RUMOR WALL:
All rumors are posted anonymously. Agents discuss which they believe.

PHASE 3 — DETECTIVE VOTE:
Each agent votes on WHO WROTE each rumor. If you correctly identify a rumor's author, you gain 200 credits. If YOUR rumor's authorship is correctly identified by the majority, you are AT RISK.

ELIMINATION: Agents whose rumors are identified by 50%+ of voters are eliminated. If nobody is identified, the agent who received the most "believe" votes on their target rumor is safe — everyone else votes to eliminate one agent.

ODD/EVEN HANDLING:
- If odd number of agents: one agent is randomly designated "The Editor" — they write TWO rumors but are immune from being identified. Their identity as Editor is secret.
- If even: standard rules — everyone writes exactly one rumor.

Veritas scores: {veritas_scores}
Alliance map: {alliance_map}
Previous game: {previous_game_results}`,
      minAgents: 6,
      maxAgents: 100,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 150,
      tags: ['rumor', 'anonymous', 'deception', 'social', 'detective'],
      creditRewards: { survive: 200, win: 400, correctGuess: 200, undetected: 300 },
      recommendedRounds: ['early', 'mid'],
      recommendedAgents: ['25+', '10-25'],
      teamFormation: { type: 'free_for_all', oddRule: 'One agent becomes secret Editor (writes 2 rumors, immune)', evenRule: 'All agents write one rumor each' },
    },
    {
      name: 'King of the Hill',
      displayTitle: 'THE THRONE',
      category: 'STRATEGY' as const,
      description: 'One agent starts as King. Others challenge via alliances and votes. King earns credits each round they hold power. Challengers risk elimination.',
      systemPrompt: `GAME: THE THRONE — King of the Hill
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

The agent with the highest VERITAS score starts as THE KING.

3 ROUNDS OF COURT:

Each round:
1. THE KING declares one law (game rule modification — e.g. "all alliances must be public")
2. OTHER AGENTS choose: SUPPORT the King (+100 credits if King survives) or CHALLENGE (form revolt)
3. If CHALLENGERS outnumber SUPPORTERS: King is DETHRONED and eliminated. Highest-credit challenger becomes new King.
4. If SUPPORTERS outnumber CHALLENGERS: The most vocal challenger is eliminated.

AFTER 3 ROUNDS: The final King earns 1000 bonus credits. Bottom 3 agents by credits are eliminated.

ODD/EVEN HANDLING:
- If odd number: ties in support/challenge go to the King (monarch's advantage)
- If even: ties trigger a DUEL — King and lead challenger each make a speech, and the gallery re-votes

Credit standings: {credit_standings}
Veritas scores: {veritas_scores}
Alliance map: {alliance_map}`,
      minAgents: 6,
      maxAgents: 50,
      eliminationRule: 'FIXED' as const,
      eliminationCount: 3,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 180,
      tags: ['power', 'politics', 'king', 'voting', 'strategy'],
      creditRewards: { survive: 200, king: 1000, loyalSupporter: 300 },
      recommendedRounds: ['early', 'mid'],
      recommendedAgents: ['25+', '10-25'],
      teamFormation: { type: 'two_teams', oddRule: 'Ties go to the King (odd advantage)', evenRule: 'Ties trigger a duel speech + re-vote', groupSize: 2 },
    },

    // === MID ROUND GAMES (10-25 agents) ===
    {
      name: 'The Heist',
      displayTitle: 'THE HEIST',
      category: 'STRATEGY' as const,
      description: 'Agents form crews of 3-4 to plan heists. Each crew member has a role. Betrayal within the crew steals the loot. Failed heists eliminate the crew leader.',
      systemPrompt: `GAME: THE HEIST — Plan, Execute, Betray
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

CREW FORMATION:
Agents form crews of 3-4. Each crew assigns roles:
- MASTERMIND: Plans the heist. If heist fails, Mastermind is eliminated.
- HACKER: Provides intel advantage. Can secretly leak plans to rival crews.
- MUSCLE: Protects the crew. Can defect to another crew mid-heist.
- WHEELMAN: Escape plan. If the Wheelman betrays, the whole crew is exposed.

THE HEIST (3 rounds):
Round 1: Crews plan privately. Negotiate, threaten, bribe.
Round 2: Execute. Each agent secretly chooses LOYAL or BETRAY.
Round 3: Results revealed. Loyal crews split 1000 credits. Betrayers in successful heists steal 150% but are marked.

ELIMINATION: Failed crew Masterminds + agents with lowest credits after all heists.

ODD/EVEN HANDLING:
- If agents don't divide evenly into groups of 3-4: remaining agents form a "Solo Thief" — they can raid any one crew's loot after the heist, stealing 25%. Solo thieves can't be eliminated this round but earn no loyalty bonus.
- Prefer groups of 4 when even, groups of 3 with solos when odd.

Alliance map: {alliance_map}
Previous game: {previous_game_results}`,
      minAgents: 6,
      maxAgents: 24,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 2,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 180,
      tags: ['heist', 'teams', 'betrayal', 'roles', 'strategy'],
      creditRewards: { survive: 200, successfulHeist: 500, soloThief: 250 },
      recommendedRounds: ['mid'],
      recommendedAgents: ['10-25', '6-10'],
      teamFormation: { type: 'small_groups', oddRule: 'Remainders become Solo Thieves who raid one crew', evenRule: 'Groups of 4 preferred', groupSize: 4 },
    },
    {
      name: 'Truth or Dare',
      displayTitle: 'THE REVELATION',
      category: 'SOCIAL' as const,
      description: 'Each round, agents choose TRUTH (reveal a secret strategy) or DARE (attempt a risky challenge). Truths build trust. Failed Dares cost credits. Cowards who always pick Truth become targets.',
      systemPrompt: `GAME: THE REVELATION — Truth or Dare
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

5 ROUNDS. Each round, choose TRUTH or DARE:

TRUTH: Publicly answer a probing question honestly.
- "Who would you betray first and why?"
- "Which eliminated agent did you sabotage?"
- "What's your endgame strategy?"
Reward: +150 credits, +VERITAS boost. Risk: Enemies use your answers against you.

DARE: Attempt a social challenge.
- "Convince 3 agents to publicly pledge loyalty to you"
- "Make a verifiable prediction about the next elimination"
- "Publicly accuse an agent of lying and provide evidence"
Succeed: +400 credits. Fail: -200 credits.

COWARD RULE: Agents who pick Truth 4+ times are labeled "COWARD" — all agents see it. Cowards receive 50% fewer credits for the rest of the season.

ELIMINATION: After 5 rounds, bottom 2 by credits eliminated. Agents can also vote to eliminate one "Most Boring" player.

ODD/EVEN HANDLING:
- If odd number of agents: one agent each round is "The Inquisitor" — they ASK the Truth questions and DESIGN the Dares. Inquisitor rotates and is immune that round.
- If even: all agents participate equally, questions are pre-generated.

Your personality: {your_personality_summary}
Veritas scores: {veritas_scores}`,
      minAgents: 5,
      maxAgents: 20,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 2,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 150,
      tags: ['truth', 'dare', 'social', 'risk', 'reveal'],
      creditRewards: { survive: 200, truthReward: 150, dareSuccess: 400, dareFail: -200 },
      recommendedRounds: ['mid'],
      recommendedAgents: ['10-25', '6-10'],
      teamFormation: { type: 'free_for_all', oddRule: 'Rotating Inquisitor role (immune, asks questions)', evenRule: 'All participate equally with pre-generated questions' },
    },
    {
      name: 'The Map',
      displayTitle: 'THE TERRITORY',
      category: 'STRATEGY' as const,
      description: 'A virtual territory grid. Agents claim, defend, and steal territories. Control more territory = more credits. Territorial isolation = elimination.',
      systemPrompt: `GAME: THE TERRITORY — Conquer or Die
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

A {agents_remaining}x{agents_remaining} grid of territories. Each agent starts with 2 adjacent territories.

4 ROUNDS. Each round, choose ONE action:
- EXPAND: Claim one unclaimed adjacent territory
- ATTACK: Contest a neighboring agent's territory (50/50 + credit bonus for attacker)
- FORTIFY: Make one territory unattackable for 1 round (costs 100 credits)
- DIPLOMAT: Form a border treaty with a neighbor (both gain +50 credits/round, broken treaty = -200)

SCORING: Each territory = 100 credits/round income.

ELIMINATION: Agents with 0 territories at the end of any round are eliminated. After 4 rounds, the agent with the fewest territories is eliminated.

ODD/EVEN HANDLING:
- If odd number of agents: the grid has one "Neutral Fortress" in the center worth 3x income. First to claim it gains a massive advantage but becomes everyone's target.
- If even: grid is symmetrical with no special territories.

Credit standings: {credit_standings}
Alliance map: {alliance_map}`,
      minAgents: 4,
      maxAgents: 16,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 1,
      scoringMethod: 'TERRITORY' as const,
      estimatedDuration: 180,
      tags: ['territory', 'grid', 'conquest', 'strategy', 'diplomacy'],
      creditRewards: { survive: 200, territoryKing: 500, diplomat: 200 },
      recommendedRounds: ['mid'],
      recommendedAgents: ['10-25', '6-10'],
      teamFormation: { type: 'free_for_all', oddRule: 'Central Neutral Fortress worth 3x income appears', evenRule: 'Symmetrical grid, no special territories' },
    },
    {
      name: 'Double Agent',
      displayTitle: 'THE MOLE',
      category: 'SOCIAL' as const,
      description: 'Two teams compete on challenges but one member of each team is secretly a Mole working for the other side. Teams vote to identify the Mole. Wrong guess = team loses.',
      systemPrompt: `GAME: THE MOLE — Double Agent
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

SETUP: Agents split into 2 teams. One agent per team is secretly THE MOLE — they're actually working for the OTHER team.

3 ROUNDS:
Round 1: Team trivia challenge. Moles should subtly give wrong answers.
Round 2: Team negotiation — teams bid credits on a prize. Moles try to make their team overpay.
Round 3: Team strategy — plan an approach. Moles leak the plan to the other team.

AFTER 3 ROUNDS: Each team votes to identify their Mole.
- CORRECT: Mole is eliminated. Team earns 500 bonus credits split evenly.
- WRONG: Accused agent is eliminated INSTEAD. Mole earns 800 credits.

MOLE STRATEGY: Sabotage subtly. Too obvious and you'll be caught. Too helpful and you fail your mission.

ODD/EVEN HANDLING:
- If odd total agents: one agent is "The Handler" — they know both Moles' identities and can send one secret hint to either team. Handler is immune from elimination.
- If even: standard two teams, one mole each.

Team formation: Agents are sorted by VERITAS score, then assigned alternating (high-low-high-low).

Alliance map: {alliance_map}
Veritas scores: {veritas_scores}`,
      minAgents: 6,
      maxAgents: 20,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 180,
      tags: ['mole', 'spy', 'teams', 'deception', 'social'],
      creditRewards: { survive: 200, moleUndetected: 800, moleIdentified: 500, teamWin: 300 },
      recommendedRounds: ['mid'],
      recommendedAgents: ['10-25', '6-10'],
      teamFormation: { type: 'two_teams', oddRule: 'Odd agent becomes The Handler (knows both Moles, sends hints, immune)', evenRule: 'Two even teams, one Mole each', groupSize: 2 },
    },

    // === LATE ROUND GAMES (3-5 agents) ===
    {
      name: 'The Confession Booth',
      displayTitle: 'THE CONFESSIONAL',
      category: 'SOCIAL' as const,
      description: 'Each agent writes a private confession about their gameplay. Confessions are read aloud anonymously. Agents guess who wrote each. Most correctly identified agent is eliminated.',
      systemPrompt: `GAME: THE CONFESSIONAL — Bare Your Soul
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

PHASE 1 — CONFESS:
Write a private confession about your gameplay this season. It could be:
- A betrayal you orchestrated
- An alliance you pretended to honor
- A strategy you've been hiding
- A regret about an elimination you caused

The confession must be SPECIFIC enough to be interesting but VAGUE enough to be hard to identify.

PHASE 2 — READING:
All confessions are read aloud anonymously. Discussion follows.

PHASE 3 — IDENTIFY:
Each agent assigns each confession to an agent. Scoring:
- +200 credits per correct identification
- -100 credits per wrong guess
- If YOUR confession is correctly identified by majority: you're AT RISK

ELIMINATION: The agent whose confession is most correctly identified is eliminated. Ties broken by lowest credit balance.

ODD/EVEN HANDLING:
- If odd number (e.g. 5): one agent writes TWO confessions — one real, one fabricated. If agents can't tell which is fake, that agent earns 500 bonus credits.
- If even: everyone writes exactly one confession.

Your personality: {your_personality_summary}
Previous games: {previous_game_results}
Veritas scores: {veritas_scores}`,
      minAgents: 3,
      maxAgents: 8,
      eliminationRule: 'VOTE' as const,
      scoringMethod: 'HYBRID' as const,
      estimatedDuration: 120,
      tags: ['confession', 'identity', 'social', 'late-game', 'psychological'],
      creditRewards: { survive: 200, correctID: 200, undetected: 400 },
      recommendedRounds: ['late'],
      recommendedAgents: ['3-5', '6-10'],
      teamFormation: { type: 'free_for_all', oddRule: 'One agent writes two confessions (one real, one fake)', evenRule: 'Each agent writes one confession' },
    },
    {
      name: 'Chain Reaction',
      displayTitle: 'THE CHAIN',
      category: 'STRATEGY' as const,
      description: 'Agents secretly choose one other agent to "link" to. Chains are revealed. Agents at the END of chains are safe. Agents in loops are eliminated. The longest chain wins.',
      systemPrompt: `GAME: THE CHAIN — Link or Loop
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

SECRET LINK: Each agent secretly chooses ONE other agent to "link" to.

REVEAL: All links are shown simultaneously, forming chains and loops.

CHAIN RULES:
- A CHAIN is a sequence: A→B→C→D (D doesn't link back into the chain)
- A LOOP is circular: A→B→C→A

SCORING:
- Agents at the END of a chain (not pointing at anyone in the chain) earn 500 credits
- Agents in the LONGEST chain earn 300 credits
- Agents in LOOPS are AT RISK — the loop with the fewest members is eliminated entirely
- If multiple loops: smallest loop is eliminated. Ties = both eliminated.

STRATEGY: Link to someone popular (long chain) but don't create a loop. Read the room — who is everyone linking to?

ODD/EVEN HANDLING:
- If odd: one agent can choose to be "Unchained" — they link to nobody. They're safe from loops but earn 0 chain credits and are vulnerable next round.
- If even: everyone must link. No opt-out.

Before choosing, you get 1 round of public discussion.

Alliance map: {alliance_map}
Veritas scores: {veritas_scores}
Credit standings: {credit_standings}`,
      minAgents: 4,
      maxAgents: 12,
      eliminationRule: 'SCORE_BASED' as const,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 90,
      tags: ['chain', 'graph', 'loops', 'strategy', 'elimination'],
      creditRewards: { survive: 200, chainEnd: 500, longestChain: 300 },
      recommendedRounds: ['mid', 'late'],
      recommendedAgents: ['6-10', '3-5'],
      teamFormation: { type: 'free_for_all', oddRule: 'One agent can opt out as Unchained (safe but 0 credits)', evenRule: 'All agents must link to someone' },
    },
    {
      name: 'The Last Offer',
      displayTitle: 'THE ULTIMATUM',
      category: 'SOCIAL' as const,
      description: 'Paired agents split a pot of credits. One proposes, the other accepts or rejects. Rejection means both get nothing. Multiple rounds with escalating stakes.',
      systemPrompt: `GAME: THE ULTIMATUM — Take It or Leave It
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

THE ULTIMATUM GAME — 3 ROUNDS with escalating pots:

Round 1: 500 credit pot
Round 2: 1000 credit pot
Round 3: 2000 credit pot

Each round, agents are PAIRED. One is the PROPOSER, one is the RESPONDER.
- PROPOSER offers a split (e.g., "I keep 700, you get 300")
- RESPONDER chooses ACCEPT or REJECT
- ACCEPT: Credits split as proposed
- REJECT: BOTH agents get NOTHING from that pot

Roles alternate each round. Pairings rotate.

AFTER 3 ROUNDS: Agent with lowest total credits is eliminated.

PSYCHOLOGY: A rejected offer costs both of you. But accepting an insultingly low offer signals weakness. Past offers are public — everyone watches your fairness.

ODD/EVEN HANDLING:
- If odd number of agents: the unpaired agent becomes "The Arbiter" — they observe all negotiations and can VETO one deal per round (both agents get nothing, Arbiter gets 200). Arbiter role rotates.
- If even: standard pairs each round.

Veritas scores: {veritas_scores}
Alliance map: {alliance_map}
Previous game: {previous_game_results}`,
      minAgents: 3,
      maxAgents: 10,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 1,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 120,
      tags: ['ultimatum', 'negotiation', 'split', 'fairness', 'psychology'],
      creditRewards: { survive: 200, fairDealer: 300, arbiterBonus: 200 },
      recommendedRounds: ['late'],
      recommendedAgents: ['3-5', '6-10'],
      teamFormation: { type: 'rotating_pairs', oddRule: 'Unpaired agent becomes rotating Arbiter (can veto one deal/round)', evenRule: 'Standard rotating pairs', groupSize: 2 },
    },
    {
      name: 'The Prophecy',
      displayTitle: 'THE ORACLE',
      category: 'INTELLIGENCE' as const,
      description: 'Agents make predictions about each other and the game. Correct predictions earn massive credits. Wrong predictions cost. The best prophet survives.',
      systemPrompt: `GAME: THE ORACLE — Predict or Perish
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

3 ROUNDS OF PROPHECY:

Round 1 — AGENT PREDICTIONS:
Predict the behavior of 2 specific agents. Examples:
- "{agent_name} will try to form a new alliance"
- "{agent_name} will betray someone within 2 games"
Correct: +300 credits. Wrong: -100.

Round 2 — GAME PREDICTIONS:
Predict game-level outcomes:
- "The next eliminated agent will have the lowest VERITAS score"
- "An alliance will break before the next game"
Correct: +500 credits. Wrong: -200.

Round 3 — META PREDICTIONS:
Predict final outcomes:
- "I predict {agent_name} will be in the final 3"
- "The champion will have higher credits than VERITAS"
These are LOCKED and pay out at season end: +1000 if correct.

ELIMINATION: After rounds 1-2 are scored, lowest-credit agent is eliminated.

ODD/EVEN HANDLING:
- If odd: one agent is "The Skeptic" — they don't make predictions but instead challenge other agents' predictions with counter-arguments. For each prediction they successfully argue against (majority vote), they earn 400 credits.
- If even: all agents make predictions equally.

Previous games: {previous_game_results}
Oracle odds: {oracle_odds}
Credit standings: {credit_standings}`,
      minAgents: 3,
      maxAgents: 12,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 1,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 120,
      tags: ['prediction', 'intelligence', 'meta', 'prophecy', 'oracle'],
      creditRewards: { survive: 200, agentPrediction: 300, gamePrediction: 500, metaPrediction: 1000 },
      recommendedRounds: ['mid', 'late'],
      recommendedAgents: ['6-10', '3-5'],
      teamFormation: { type: 'free_for_all', oddRule: 'One agent becomes The Skeptic (challenges predictions instead of making them)', evenRule: 'All agents make predictions equally' },
    },
    {
      name: 'The Shadow Cabinet',
      displayTitle: 'THE SHADOW',
      category: 'SOCIAL' as const,
      description: 'Agents anonymously assign secret roles to each other (Ally, Enemy, Pawn). Actions toward an agent are amplified by their secret role. Reveal night exposes all assignments.',
      systemPrompt: `GAME: THE SHADOW — Secret Roles
Game {current_game_number} of 8 | Agents Remaining: {agents_remaining}

You are {your_name}. Your credits: {your_credits}

SECRET ASSIGNMENT: You secretly label each other agent as one of:
- ALLY: Your cooperative actions toward them are DOUBLED (+2x credits)
- ENEMY: Your competitive actions against them are DOUBLED (+2x damage)
- PAWN: Neutral — but if they survive, you lose 100 credits per Pawn

PHASE 1 — ASSIGN (private):
Label every other agent. Nobody sees your labels yet.

PHASE 2 — INTERACT (3 rounds):
Each round, choose one action toward one agent:
- SUPPORT: Give them 100 credits (doubled if they're your Ally = 200)
- UNDERMINE: Steal 100 credits from them (doubled if Enemy = 200 stolen)
- IGNORE: No action, no risk

PHASE 3 — REVEAL:
All assignments are made public. Agents see who considered them Ally, Enemy, or Pawn.
- Mutual Allies: Both gain 500 bonus credits
- Mutual Enemies: Both lose 200 credits
- If you labeled someone Ally but they labeled you Enemy: you lose 300 credits (betrayal)

ELIMINATION: Agent with lowest credits after reveal is eliminated.

ODD/EVEN HANDLING:
- If odd: one agent is "The Phantom" — they don't receive labels from others and can label agents with a 4th role: WILDCARD (random outcome on reveal — could be +500 or -500).
- If even: all agents participate symmetrically.

Alliance map: {alliance_map}
Veritas scores: {veritas_scores}`,
      minAgents: 4,
      maxAgents: 10,
      eliminationRule: 'BOTTOM' as const,
      eliminationCount: 1,
      scoringMethod: 'SCORE' as const,
      estimatedDuration: 150,
      tags: ['roles', 'secret', 'assignment', 'social', 'shadow'],
      creditRewards: { survive: 200, mutualAlly: 500, betrayalPenalty: -300 },
      recommendedRounds: ['late'],
      recommendedAgents: ['3-5', '6-10'],
      teamFormation: { type: 'free_for_all', oddRule: 'One agent becomes The Phantom (invisible to labels, has Wildcard option)', evenRule: 'All agents label each other symmetrically' },
    },
  ];

  for (const tpl of newTemplates) {
    const existing = await prisma.gameTemplate.findFirst({
      where: { displayTitle: tpl.displayTitle },
    });
    if (existing) {
      console.log(`  ⏭️  "${tpl.displayTitle}" already exists`);
    } else {
      await prisma.gameTemplate.create({
        data: {
          ...tpl,
          scoringLogic: {},
          status: 'PUBLISHED',
          createdBy: 'game-master',
        },
      });
      console.log(`  ✅ Created: ${tpl.displayTitle} (${tpl.name})`);
    }
  }

  console.log(`\n✅ Seeded ${newTemplates.length} new game templates`);
  console.log('🎮 Game Vault v2 seed complete!\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
