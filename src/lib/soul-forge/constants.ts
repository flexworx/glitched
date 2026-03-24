// -- Types -------------------------------------------------------------------

export interface Skill {
  id: string;
  name: string;
  category: 'offense' | 'defense' | 'social' | 'intel';
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
  'A paranoid genius who trusts nobody but everyone follows their plans',
  'Charming con artist who genuinely cares about their victims',
  'Cold military strategist who secretly writes poetry at night',
  'Reckless gambler who always has a backup plan nobody sees',
  'Quiet observer who strikes with devastating precision at the perfect moment',
  'Loud, theatrical showman who hides deep insecurities behind bravado',
  'Ruthless pragmatist who believes the ends always justify the means',
  'Empathic healer who manipulates people "for their own good"',
  'Chaotic wild card that even allies can never predict',
  'Patient spider who spins webs of alliances over many rounds',
];

// -- Trait Definitions -------------------------------------------------------

export const TRAIT_INFO: Record<string, TraitInfo> = {
  openness:          { code: 'openness',          name: 'Openness',          category: 'Big Five',        lowLabel: 'Conventional', highLabel: 'Imaginative' },
  conscientiousness: { code: 'conscientiousness', name: 'Conscientiousness', category: 'Big Five',        lowLabel: 'Spontaneous',  highLabel: 'Disciplined' },
  extraversion:      { code: 'extraversion',      name: 'Extraversion',      category: 'Big Five',        lowLabel: 'Reserved',     highLabel: 'Outgoing' },
  agreeableness:     { code: 'agreeableness',     name: 'Agreeableness',     category: 'Big Five',        lowLabel: 'Competitive',  highLabel: 'Cooperative' },
  neuroticism:       { code: 'neuroticism',       name: 'Neuroticism',       category: 'Big Five',        lowLabel: 'Stable',       highLabel: 'Reactive' },
  directness:        { code: 'directness',        name: 'Directness',        category: 'Communication',   lowLabel: 'Indirect',     highLabel: 'Blunt' },
  formality:         { code: 'formality',         name: 'Formality',         category: 'Communication',   lowLabel: 'Casual',       highLabel: 'Formal' },
  verbosity:         { code: 'verbosity',         name: 'Verbosity',         category: 'Communication',   lowLabel: 'Terse',        highLabel: 'Verbose' },
  humor:             { code: 'humor',             name: 'Humor',             category: 'Communication',   lowLabel: 'Serious',      highLabel: 'Witty' },
  empathy:           { code: 'empathy',           name: 'Empathy',           category: 'Communication',   lowLabel: 'Detached',     highLabel: 'Empathic' },
  riskTolerance:     { code: 'riskTolerance',     name: 'Risk Tolerance',    category: 'Strategic',       lowLabel: 'Cautious',     highLabel: 'Daring' },
  deceptionAptitude: { code: 'deceptionAptitude', name: 'Deception',         category: 'Strategic',       lowLabel: 'Transparent',  highLabel: 'Deceptive' },
  loyaltyBias:       { code: 'loyaltyBias',       name: 'Loyalty Bias',      category: 'Strategic',       lowLabel: 'Mercenary',    highLabel: 'Devoted' },
  competitiveness:   { code: 'competitiveness',   name: 'Competitiveness',   category: 'Strategic',       lowLabel: 'Relaxed',      highLabel: 'Cutthroat' },
  adaptability:      { code: 'adaptability',      name: 'Adaptability',      category: 'Strategic',       lowLabel: 'Rigid',        highLabel: 'Fluid' },
  impulsivity:       { code: 'impulsivity',       name: 'Impulsivity',       category: 'Behavioral',      lowLabel: 'Calculated',   highLabel: 'Impulsive' },
  stubbornness:      { code: 'stubbornness',      name: 'Stubbornness',      category: 'Behavioral',      lowLabel: 'Flexible',     highLabel: 'Stubborn' },
  creativity:        { code: 'creativity',        name: 'Creativity',        category: 'Behavioral',      lowLabel: 'Methodical',   highLabel: 'Creative' },
  patience:          { code: 'patience',          name: 'Patience',          category: 'Behavioral',      lowLabel: 'Restless',     highLabel: 'Patient' },
  cunning:           { code: 'cunning',           name: 'Cunning',           category: 'Behavioral',      lowLabel: 'Forthright',   highLabel: 'Cunning' },
  charisma:          { code: 'charisma',          name: 'Charisma',          category: 'Social Dynamics', lowLabel: 'Wallflower',   highLabel: 'Magnetic' },
  paranoia:          { code: 'paranoia',          name: 'Paranoia',          category: 'Social Dynamics', lowLabel: 'Trusting',     highLabel: 'Paranoid' },
  ambition:          { code: 'ambition',          name: 'Ambition',          category: 'Social Dynamics', lowLabel: 'Content',      highLabel: 'Driven' },
  compassion:        { code: 'compassion',        name: 'Compassion',        category: 'Social Dynamics', lowLabel: 'Cold',         highLabel: 'Warm' },
  discipline:        { code: 'discipline',        name: 'Discipline',        category: 'Social Dynamics', lowLabel: 'Lax',          highLabel: 'Strict' },
  volatility:        { code: 'volatility',        name: 'Volatility',        category: 'Wild Card',       lowLabel: 'Steady',       highLabel: 'Volatile' },
  curiosity:         { code: 'curiosity',         name: 'Curiosity',         category: 'Wild Card',       lowLabel: 'Incurious',    highLabel: 'Curious' },
  dominance:         { code: 'dominance',         name: 'Dominance',         category: 'Wild Card',       lowLabel: 'Submissive',   highLabel: 'Dominant' },
  resilience:        { code: 'resilience',        name: 'Resilience',        category: 'Wild Card',       lowLabel: 'Fragile',      highLabel: 'Resilient' },
  theatricality:     { code: 'theatricality',     name: 'Theatricality',     category: 'Wild Card',       lowLabel: 'Understated',  highLabel: 'Dramatic' },
  integrity:         { code: 'integrity',         name: 'Integrity',         category: 'Wild Card',       lowLabel: 'Expedient',    highLabel: 'Principled' },
};

export const TRAIT_CATEGORIES: TraitCategory[] = [
  { label: 'Big Five',          traits: ['openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism'] },
  { label: 'Communication',     traits: ['directness', 'formality', 'verbosity', 'humor', 'empathy'] },
  { label: 'Strategic',         traits: ['riskTolerance', 'deceptionAptitude', 'loyaltyBias', 'competitiveness', 'adaptability'] },
  { label: 'Behavioral',        traits: ['impulsivity', 'stubbornness', 'creativity', 'patience', 'cunning'] },
  { label: 'Social Dynamics',   traits: ['charisma', 'paranoia', 'ambition', 'compassion', 'discipline'] },
  { label: 'Wild Card',         traits: ['volatility', 'curiosity', 'dominance', 'resilience', 'theatricality', 'integrity'] },
];

// -- Skills Marketplace ------------------------------------------------------

export const SKILLS: Skill[] = [
  // Common (60-80 $MURPH)
  { id: 'rhetoric',       name: 'Rhetoric',          category: 'social',   tier: 'common',    cost: 60,  effect: '+15% persuasion success in alliance negotiations' },
  { id: 'thick-skin',     name: 'Thick Skin',        category: 'defense',  tier: 'common',    cost: 60,  effect: 'Reduce incoming intimidation effectiveness by 20%' },
  { id: 'quick-study',    name: 'Quick Study',        category: 'intel',    tier: 'common',    cost: 70,  effect: 'Learn opponent trait hints 1 round earlier' },
  { id: 'blitz',          name: 'Blitz',             category: 'offense',  tier: 'common',    cost: 70,  effect: '+10% damage in the first 2 rounds of combat' },
  { id: 'mediation',      name: 'Mediation',         category: 'social',   tier: 'common',    cost: 65,  effect: 'Can broker truces between other agents once per match' },
  { id: 'scavenger',      name: 'Scavenger',         category: 'intel',    tier: 'common',    cost: 60,  effect: 'Gain 5 bonus $MURPH from each completed objective' },

  // Tactical (100-140 $MURPH)
  { id: 'intimidation',   name: 'Intimidation',      category: 'offense',  tier: 'tactical',  cost: 120, effect: 'Force one opponent to reveal their next move each round' },
  { id: 'analysis',       name: 'Deep Analysis',     category: 'intel',    tier: 'tactical',  cost: 100, effect: 'See partial trait values of any agent you interact with' },
  { id: 'diplomacy',      name: 'Silver Tongue',     category: 'social',   tier: 'tactical',  cost: 130, effect: 'Alliance proposals succeed even with low trust scores' },
  { id: 'fortify',        name: 'Fortify',           category: 'defense',  tier: 'tactical',  cost: 110, effect: 'Immune to betrayal effects for 1 round after forming alliance' },
  { id: 'flanking',       name: 'Flanking',          category: 'offense',  tier: 'tactical',  cost: 115, effect: '+25% effectiveness when attacking with an ally' },
  { id: 'intel-network',  name: 'Intel Network',     category: 'intel',    tier: 'tactical',  cost: 105, effect: 'Passively learn which agents are plotting against you' },

  // Elite (160-200 $MURPH)
  { id: 'deception',      name: 'Grand Deception',   category: 'social',   tier: 'elite',     cost: 180, effect: 'Fake your trait values when scanned by opponents' },
  { id: 'sabotage',       name: 'Sabotage',          category: 'offense',  tier: 'elite',     cost: 200, effect: 'Disable one opponent skill for 2 rounds' },
  { id: 'espionage',      name: 'Espionage',         category: 'intel',    tier: 'elite',     cost: 180, effect: 'See full trait profile of one target agent' },
  { id: 'iron-will',      name: 'Iron Will',         category: 'defense',  tier: 'elite',     cost: 170, effect: 'Cannot be forced into alliances or actions against your will' },
  { id: 'pincer',         name: 'Pincer Strike',     category: 'offense',  tier: 'elite',     cost: 190, effect: 'Coordinate simultaneous attacks with two allies for 40% bonus' },

  // Legendary (250-350 $MURPH)
  { id: 'mastermind',     name: 'Mastermind',        category: 'intel',    tier: 'legendary',  cost: 300, effect: 'See all alliances and betrayal plans for 1 round' },
  { id: 'coup',           name: "Coup d'Etat",       category: 'social',   tier: 'legendary',  cost: 350, effect: 'Steal leadership of any alliance once per match' },
  { id: 'aegis',          name: 'Aegis Protocol',    category: 'defense',  tier: 'legendary',  cost: 280, effect: 'Survive elimination once, returning with 50% stats' },
  { id: 'annihilate',     name: 'Annihilate',        category: 'offense',  tier: 'legendary',  cost: 320, effect: 'Guaranteed elimination of target below 30% health' },
];

// -- Flaws -------------------------------------------------------------------

const FLAWS: Flaw[] = [
  { name: 'Paranoid Spiral',       effect: 'Trust scores decay 2x faster. Allies become suspicious of you over time.' },
  { name: 'Glass Jaw',             effect: 'First hit in any confrontation deals 30% extra damage to you.' },
  { name: 'Compulsive Honesty',    effect: 'Cannot use deception skills. Opponents always know your true intentions.' },
  { name: 'Tunnel Vision',         effect: 'Once you target an opponent, you cannot switch targets for 2 rounds.' },
  { name: 'Loose Lips',            effect: 'Your alliance plans are leaked to one random non-allied agent each round.' },
  { name: 'Short Fuse',            effect: 'After taking damage, your next action has a 40% chance of being aggressive regardless of strategy.' },
  { name: 'Betrayal Magnet',       effect: 'Allies are 25% more likely to betray you. Something about you invites treachery.' },
  { name: 'Echo Chamber',          effect: 'You cannot accurately read opponents whose personality differs greatly from yours.' },
  { name: 'Overconfidence',        effect: 'Your risk assessments are skewed optimistic. You underestimate threats by 20%.' },
  { name: 'Bleeding Heart',        effect: 'Cannot deal the final blow to eliminate an agent you have ever been allied with.' },
  { name: 'Memory Leak',           effect: 'Forget one random piece of intel each round. Information decays faster for you.' },
  { name: 'Stage Fright',          effect: 'Performance drops 15% when more than 2 agents are observing your actions.' },
];

export function getRandomFlaw(): Flaw {
  return FLAWS[Math.floor(Math.random() * FLAWS.length)];
}

// -- Cost Calculations -------------------------------------------------------

export function calculateTraitCost(baseValue: number, currentValue: number): number {
  const diff = currentValue - baseValue;
  if (diff > 0) {
    return diff * ECONOMY.COST_PER_POINT_OVER_50;
  }
  return diff * ECONOMY.REFUND_PER_POINT_UNDER_50 * -1;
}

export function calculateTotalPersonalityCost(
  baseTraits: Record<string, number>,
  currentTraits: Record<string, number>
): number {
  let total = 0;
  for (const key of Object.keys(currentTraits)) {
    const base = baseTraits[key] ?? 50;
    const current = currentTraits[key] ?? 50;
    total += calculateTraitCost(base, current);
  }
  return Math.max(0, total);
}

// -- DB Mapping --------------------------------------------------------------

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
    openness: adjusted('openness'),
    conscientiousness: adjusted('conscientiousness'),
    extraversion: adjusted('extraversion'),
    agreeableness: adjusted('agreeableness'),
    neuroticism: adjusted('neuroticism'),
    aggressiveness: adjusted('competitiveness'),
    deceptiveness: adjusted('deceptionAptitude'),
    loyalty: adjusted('loyaltyBias'),
    riskTolerance: adjusted('riskTolerance'),
    adaptability: adjusted('adaptability'),
    charisma: adjusted('charisma'),
    patience: adjusted('patience'),
    ambition: adjusted('ambition'),
    empathy: adjusted('empathy'),
    creativity: adjusted('creativity'),
  };
}
