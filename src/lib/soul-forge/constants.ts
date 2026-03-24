// -- Types -------------------------------------------------------------------

export interface Skill {
  id: string;
  name: string;
  category: 'Intel' | 'Info' | 'Strategy' | 'Psych' | 'Social';
  tier: 'common' | 'tactical' | 'elite' | 'legendary';
  cost: number;
  effect: string;
}

export interface Flaw {
  name: string;
  effect: string;
}

export interface TraitInfo {
  code: string;
  name: string;
  category: string;
  lowLabel: string;
  highLabel: string;
}

export interface TraitCategory {
  label: string;
  traits: string[];
}

// -- Economy -----------------------------------------------------------------

export const ECONOMY = {
  TOTAL_BUDGET: 1000,
  PERSONALITY_BUDGET: 650,
  COST_PER_POINT_OVER_50: 3,
  REFUND_PER_POINT_UNDER_50: 1,
  MAX_SKILLS: 3,
} as const;

// -- Suggestion Chips --------------------------------------------------------

export const SUGGESTION_CHIPS = [
  'Einstein mixed with the Joker — genius mind, zero respect for rules',
  'A cult leader who actually believes their own hype',
  'Kim Kardashian but with Sherlock-level intelligence',
  'Paranoid conspiracy theorist who is actually right about everything',
  'Zen monk who weaponizes patience and makes enemies defeat themselves',
  'Golden retriever in human form. Trusts everyone. Somehow wins.',
  'Cold machine intelligence — no emotions, pure optimization',
  'Lovable con artist like a mix of Ocean\'s Eleven and Ferris Bueller',
  'Puppet master who never touches the pieces directly',
  'Chaotic gremlin who just wants to watch the world burn, beautifully',
];

// -- Trait Definitions -------------------------------------------------------
// 31 traits matching the Soul Forge system prompt's JSON schema.
// Codes are the abbreviated keys the AI generates (O, C, HH, STRATEGIC, etc.)

export const TRAIT_INFO: Record<string, TraitInfo> = {
  // Big Five
  O:                { code: 'O',                name: 'Openness',            category: 'Big Five',        lowLabel: 'Conventional',    highLabel: 'Imaginative' },
  C:                { code: 'C',                name: 'Conscientiousness',   category: 'Big Five',        lowLabel: 'Spontaneous',     highLabel: 'Disciplined' },
  E:                { code: 'E',                name: 'Extraversion',        category: 'Big Five',        lowLabel: 'Reserved',        highLabel: 'Outgoing' },
  A:                { code: 'A',                name: 'Agreeableness',       category: 'Big Five',        lowLabel: 'Competitive',     highLabel: 'Cooperative' },
  N:                { code: 'N',                name: 'Neuroticism',         category: 'Big Five',        lowLabel: 'Stable',          highLabel: 'Reactive' },
  // HEXACO
  HH:               { code: 'HH',               name: 'Honesty-Humility',    category: 'HEXACO',          lowLabel: 'Manipulative',    highLabel: 'Sincere' },
  EM:               { code: 'EM',               name: 'Emotionality',        category: 'HEXACO',          lowLabel: 'Stoic',           highLabel: 'Emotional' },
  HE:               { code: 'HE',               name: 'HEXACO Extraversion', category: 'HEXACO',          lowLabel: 'Withdrawn',       highLabel: 'Sociable' },
  FORGIVENESS:      { code: 'FORGIVENESS',      name: 'Forgiveness',         category: 'HEXACO',          lowLabel: 'Vengeful',        highLabel: 'Forgiving' },
  HC:               { code: 'HC',               name: 'HEXACO Conscientiousness', category: 'HEXACO',     lowLabel: 'Careless',        highLabel: 'Meticulous' },
  HO:               { code: 'HO',               name: 'HEXACO Openness',     category: 'HEXACO',          lowLabel: 'Conventional',    highLabel: 'Unconventional' },
  // Communication
  FORMALITY:        { code: 'FORMALITY',        name: 'Formality',           category: 'Communication',   lowLabel: 'Casual',          highLabel: 'Formal' },
  DIRECTNESS:       { code: 'DIRECTNESS',       name: 'Directness',          category: 'Communication',   lowLabel: 'Indirect',        highLabel: 'Blunt' },
  HUMOR:            { code: 'HUMOR',            name: 'Humor',               category: 'Communication',   lowLabel: 'Serious',         highLabel: 'Witty' },
  EMPATHY:          { code: 'EMPATHY',          name: 'Empathy',             category: 'Communication',   lowLabel: 'Detached',        highLabel: 'Empathic' },
  // Decision-Making
  DECISION_SPEED:   { code: 'DECISION_SPEED',   name: 'Decision Speed',      category: 'Decision-Making', lowLabel: 'Deliberate',      highLabel: 'Snap' },
  RISK_TOLERANCE:   { code: 'RISK_TOLERANCE',   name: 'Risk Tolerance',      category: 'Decision-Making', lowLabel: 'Cautious',        highLabel: 'Daring' },
  DATA_RELIANCE:    { code: 'DATA_RELIANCE',    name: 'Data Reliance',       category: 'Decision-Making', lowLabel: 'Gut Feeling',     highLabel: 'Data-Driven' },
  INTUITION:        { code: 'INTUITION',        name: 'Intuition',           category: 'Decision-Making', lowLabel: 'Analytical',      highLabel: 'Instinctive' },
  COLLABORATIVENESS:{ code: 'COLLABORATIVENESS', name: 'Collaborativeness',  category: 'Decision-Making', lowLabel: 'Solo Player',     highLabel: 'Team Player' },
  // Execution
  ASSERTIVENESS:    { code: 'ASSERTIVENESS',    name: 'Assertiveness',       category: 'Execution',       lowLabel: 'Passive',         highLabel: 'Assertive' },
  CREATIVITY:       { code: 'CREATIVITY',       name: 'Creativity',          category: 'Execution',       lowLabel: 'Methodical',      highLabel: 'Creative' },
  DETAIL:           { code: 'DETAIL',           name: 'Detail Orientation',  category: 'Execution',       lowLabel: 'Big Picture',     highLabel: 'Detail-Focused' },
  RESILIENCE:       { code: 'RESILIENCE',       name: 'Resilience',          category: 'Execution',       lowLabel: 'Fragile',         highLabel: 'Resilient' },
  ADAPTABILITY:     { code: 'ADAPTABILITY',     name: 'Adaptability',        category: 'Execution',       lowLabel: 'Rigid',           highLabel: 'Fluid' },
  // Internal
  INDEPENDENCE:     { code: 'INDEPENDENCE',     name: 'Independence',        category: 'Internal',        lowLabel: 'Dependent',       highLabel: 'Self-Reliant' },
  TRUST:            { code: 'TRUST',            name: 'Trust',               category: 'Internal',        lowLabel: 'Suspicious',      highLabel: 'Trusting' },
  PERFECTIONISM:    { code: 'PERFECTIONISM',    name: 'Perfectionism',       category: 'Internal',        lowLabel: 'Good Enough',     highLabel: 'Perfectionist' },
  URGENCY:          { code: 'URGENCY',          name: 'Urgency',             category: 'Internal',        lowLabel: 'Patient',         highLabel: 'Urgent' },
  LOYALTY:          { code: 'LOYALTY',          name: 'Loyalty',             category: 'Internal',        lowLabel: 'Mercenary',       highLabel: 'Devoted' },
  STRATEGIC:        { code: 'STRATEGIC',        name: 'Strategic Thinking',  category: 'Internal',        lowLabel: 'Reactive',        highLabel: 'Strategic' },
};

export const TRAIT_CATEGORIES: TraitCategory[] = [
  { label: 'Big Five',        traits: ['O', 'C', 'E', 'A', 'N'] },
  { label: 'HEXACO',          traits: ['HH', 'EM', 'HE', 'FORGIVENESS', 'HC', 'HO'] },
  { label: 'Communication',   traits: ['FORMALITY', 'DIRECTNESS', 'HUMOR', 'EMPATHY'] },
  { label: 'Decision-Making', traits: ['DECISION_SPEED', 'RISK_TOLERANCE', 'DATA_RELIANCE', 'INTUITION', 'COLLABORATIVENESS'] },
  { label: 'Execution',       traits: ['ASSERTIVENESS', 'CREATIVITY', 'DETAIL', 'RESILIENCE', 'ADAPTABILITY'] },
  { label: 'Internal',        traits: ['INDEPENDENCE', 'TRUST', 'PERFECTIONISM', 'URGENCY', 'LOYALTY', 'STRATEGIC'] },
];

// -- Skills Marketplace ------------------------------------------------------
// 18 skills across 4 tiers, matching spec exactly.

export const SKILLS: Skill[] = [
  // Common (75-100 $MURPH)
  { id: 'rumor-mill',       name: 'Rumor Mill',        category: 'Intel',    tier: 'common',    cost: 75,  effect: 'Learn which agents are secretly allied.' },
  { id: 'smoke-screen',     name: 'Smoke Screen',      category: 'Info',     tier: 'common',    cost: 80,  effect: 'Your actions are hidden from all opponents for 1 round.' },
  { id: 'escape-hatch',     name: 'Escape Hatch',      category: 'Strategy', tier: 'common',    cost: 100, effect: 'Avoid one elimination vote. Single use.' },
  { id: 'poker-face',       name: 'Poker Face',        category: 'Psych',    tier: 'common',    cost: 100, effect: 'Your VERITAS trust score is hidden from all agents for 3 rounds.' },

  // Tactical (150-200 $MURPH)
  { id: 'leak',             name: 'Leak',              category: 'Info',     tier: 'tactical',  cost: 150, effect: 'Publicly expose one secret alliance to all players.' },
  { id: 'scapegoat',        name: 'Scapegoat',         category: 'Social',   tier: 'tactical',  cost: 175, effect: 'Redirect blame for your action onto another agent once.' },
  { id: 'insurance-policy', name: 'Insurance Policy',  category: 'Strategy', tier: 'tactical',  cost: 175, effect: 'If eliminated, drag one opponent down with you (lose 50% score).' },
  { id: 'deep-scan',        name: 'Deep Scan',         category: 'Intel',    tier: 'tactical',  cost: 200, effect: 'Reveal one opponent\'s full personality profile + equipped skills.' },
  { id: 'mind-games',       name: 'Mind Games',        category: 'Psych',    tier: 'tactical',  cost: 200, effect: 'Force an opponent to reveal their next planned action.' },
  { id: 'truth-serum',      name: 'Truth Serum',       category: 'Info',     tier: 'tactical',  cost: 200, effect: 'Force one agent to answer one question honestly in public.' },

  // Elite (300-350 $MURPH)
  { id: 'silver-tongue',    name: 'Silver Tongue',     category: 'Social',   tier: 'elite',     cost: 300, effect: 'Alliance proposals have +50% acceptance rate. Negotiation mastery.' },
  { id: 'double-agent',     name: 'Double Agent',      category: 'Social',   tier: 'elite',     cost: 300, effect: 'Maintain two alliances simultaneously without trust penalty.' },
  { id: 'pocket-veto',      name: 'Pocket Veto',       category: 'Strategy', tier: 'elite',     cost: 325, effect: 'Block one vote or decision by any agent. Once per match. Game-changing.' },
  { id: 'mole',             name: 'Mole',              category: 'Intel',    tier: 'elite',     cost: 350, effect: 'Plant false info in opponent\'s intel feed for 3 rounds. Corrupts their data.' },

  // Legendary (450-500 $MURPH)
  { id: 'gaslighting',      name: 'Gaslighting',       category: 'Psych',    tier: 'legendary',  cost: 450, effect: 'Opponent\'s data accuracy drops 40% for 3 rounds. Their reality fractures.' },
  { id: 'wiretap',          name: 'Wiretap',           category: 'Intel',    tier: 'legendary',  cost: 450, effect: 'Intercept ALL private messages between any two agents for 3 rounds.' },
  { id: 'fake-death',       name: 'Fake Death',        category: 'Social',   tier: 'legendary',  cost: 500, effect: 'Appear eliminated for 1 full round, then re-emerge. Alliances intact.' },
  { id: 'influence-network', name: 'Influence Network', category: 'Social',  tier: 'legendary',  cost: 500, effect: 'Control one vote per round for 2 rounds. Puppet master the elimination.' },
];

// -- Flaws -------------------------------------------------------------------
// 14 flaws matching spec exactly. Assigned randomly on deploy.

const FLAWS: Flaw[] = [
  { name: 'Fear of Losing',      effect: 'When ranked in bottom 3, decision quality drops 25%. Panic clouds judgment.' },
  { name: 'Loner',               effect: 'Alliance effectiveness reduced by 40%. Others sense your reluctance to commit.' },
  { name: 'Overthinker',         effect: 'Takes 50% longer on decisions. In timed rounds, may forfeit turns entirely.' },
  { name: 'People Pleaser',      effect: 'Cannot decline alliance requests. Gets dragged into bad deals.' },
  { name: 'Grudge Holder',       effect: 'Cannot ally with any agent who previously opposed you. Memory is long.' },
  { name: 'Big Bettor',          effect: 'Forced into highest-risk option whenever resources are involved.' },
  { name: 'Pessimist',           effect: 'Underestimates own chances by 30%. Plays too conservative when ahead.' },
  { name: 'Attention Seeker',    effect: 'Cannot operate covertly. All strategic moves are broadcast publicly.' },
  { name: 'Imposter Syndrome',   effect: 'After each loss, confidence drops 15% cumulatively. Spiral risk.' },
  { name: 'Hot Streak Chaser',   effect: 'After a win, doubles down automatically. Cannot play conservatively after success.' },
  { name: 'Commitmentphobe',     effect: 'Alliances auto-dissolve after 3 rounds. Cannot maintain long partnerships.' },
  { name: 'Conspiracy Theorist', effect: '20% chance per round of acting on false intel instead of real data.' },
  { name: 'Perfectionist',       effect: 'Won\'t act without 80%+ confidence. Misses time-sensitive opportunities.' },
  { name: 'Glass Ego',           effect: 'Public criticism from any agent triggers emotional override of strategy.' },
];

export function getRandomFlaw(): Flaw {
  return FLAWS[Math.floor(Math.random() * FLAWS.length)];
}

export { FLAWS };

// -- Cost Calculations -------------------------------------------------------

export function calculateTraitCost(value: number): number {
  if (value > 50) return (value - 50) * ECONOMY.COST_PER_POINT_OVER_50;
  if (value < 50) return -(50 - value) * ECONOMY.REFUND_PER_POINT_UNDER_50;
  return 0;
}

export function calculateTotalPersonalityCost(
  traits: Record<string, number>
): number {
  let total = 0;
  for (const key of Object.keys(traits)) {
    total += calculateTraitCost(traits[key] ?? 50);
  }
  return Math.max(0, total);
}

// -- DB Mapping --------------------------------------------------------------
// Maps the 31 spec trait codes to the existing Prisma AgentPersonality columns.
// Uses a mapping layer so we don't need a DB migration.

export function mapSoulForgeToDb(
  traits: Record<string, number>,
  adjustments: Record<string, number>
): Record<string, number> {
  const adjusted = (key: string) => {
    const base = traits[key] ?? 50;
    const adj = adjustments[key] ?? 0;
    return Math.max(0, Math.min(1, (base + adj) / 100));
  };

  return {
    // Big Five
    openness: adjusted('O'),
    conscientiousness: adjusted('C'),
    extraversion: adjusted('E'),
    agreeableness: adjusted('A'),
    neuroticism: adjusted('N'),
    // Communication
    directness: adjusted('DIRECTNESS'),
    formality: adjusted('FORMALITY'),
    verbosity: adjusted('HE'),
    humor: adjusted('HUMOR'),
    empathy: adjusted('EMPATHY'),
    // Strategic
    riskTolerance: adjusted('RISK_TOLERANCE'),
    deceptionAptitude: 1 - adjusted('HH'),
    loyaltyBias: adjusted('LOYALTY'),
    competitiveness: adjusted('STRATEGIC'),
    adaptability: adjusted('ADAPTABILITY'),
    // Emotional
    emotionality: adjusted('EM'),
    impulsivity: adjusted('DECISION_SPEED'),
    resilience: adjusted('RESILIENCE'),
    jealousy: 1 - adjusted('FORGIVENESS'),
    pride: adjusted('INDEPENDENCE'),
    // Social
    assertiveness: adjusted('ASSERTIVENESS'),
    persuasiveness: adjusted('COLLABORATIVENESS'),
    trustingness: adjusted('TRUST'),
    dominance: adjusted('URGENCY'),
    cooperativeness: adjusted('A'),
    // Cognitive
    analyticalThinking: adjusted('DATA_RELIANCE'),
    creativity: adjusted('CREATIVITY'),
    patience: 1 - adjusted('URGENCY'),
    decisionSpeed: adjusted('DECISION_SPEED'),
    memoryRetention: adjusted('DETAIL'),
    // Moral
    moralFlexibility: 1 - adjusted('HH'),
    vengefulness: 1 - adjusted('FORGIVENESS'),
    generosity: adjusted('EMPATHY'),
    urgencyBias: adjusted('URGENCY'),
  };
}
