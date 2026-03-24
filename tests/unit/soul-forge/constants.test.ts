import {
  ECONOMY,
  SUGGESTION_CHIPS,
  TRAIT_INFO,
  TRAIT_CATEGORIES,
  SKILLS,
  FLAWS,
  getRandomFlaw,
  calculateTraitCost,
  calculateTotalPersonalityCost,
  mapSoulForgeToDb,
} from '../../../src/lib/soul-forge/constants';

// ---------------------------------------------------------------------------
// TRAIT_INFO — 31 spec traits
// ---------------------------------------------------------------------------

const ALL_TRAIT_CODES = [
  'O', 'C', 'E', 'A', 'N',
  'HH', 'EM', 'HE', 'FORGIVENESS', 'HC', 'HO',
  'FORMALITY', 'DIRECTNESS', 'HUMOR', 'EMPATHY',
  'DECISION_SPEED', 'RISK_TOLERANCE', 'DATA_RELIANCE', 'INTUITION', 'COLLABORATIVENESS',
  'ASSERTIVENESS', 'CREATIVITY', 'DETAIL', 'RESILIENCE', 'ADAPTABILITY',
  'INDEPENDENCE', 'TRUST', 'PERFECTIONISM', 'URGENCY', 'LOYALTY', 'STRATEGIC',
];

describe('TRAIT_INFO', () => {
  it('has info for all 31 spec traits', () => {
    expect(Object.keys(TRAIT_INFO)).toHaveLength(31);
    for (const code of ALL_TRAIT_CODES) {
      expect(TRAIT_INFO).toHaveProperty(code);
    }
  });

  it('each entry has code, name, lowLabel, highLabel (all non-empty strings)', () => {
    for (const info of Object.values(TRAIT_INFO)) {
      expect(typeof info.code).toBe('string');
      expect(info.code.length).toBeGreaterThan(0);
      expect(typeof info.name).toBe('string');
      expect(info.name.length).toBeGreaterThan(0);
      expect(typeof info.lowLabel).toBe('string');
      expect(info.lowLabel.length).toBeGreaterThan(0);
      expect(typeof info.highLabel).toBe('string');
      expect(info.highLabel.length).toBeGreaterThan(0);
    }
  });

  it('each entry has a non-empty category string', () => {
    for (const info of Object.values(TRAIT_INFO)) {
      expect(typeof info.category).toBe('string');
      expect(info.category.length).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// TRAIT_CATEGORIES — 6 categories
// ---------------------------------------------------------------------------

describe('TRAIT_CATEGORIES', () => {
  it('has exactly 6 categories', () => {
    expect(TRAIT_CATEGORIES).toHaveLength(6);
  });

  it('categories are Big Five, HEXACO, Communication, Decision-Making, Execution, Internal', () => {
    const labels = TRAIT_CATEGORIES.map(c => c.label);
    expect(labels).toEqual(['Big Five', 'HEXACO', 'Communication', 'Decision-Making', 'Execution', 'Internal']);
  });

  it('each category has a non-empty traits array', () => {
    for (const cat of TRAIT_CATEGORIES) {
      expect(Array.isArray(cat.traits)).toBe(true);
      expect(cat.traits.length).toBeGreaterThan(0);
    }
  });

  it('all trait codes across all categories cover all 31 traits', () => {
    const allCodes = TRAIT_CATEGORIES.flatMap((c) => c.traits);
    for (const code of ALL_TRAIT_CODES) {
      expect(allCodes).toContain(code);
    }
  });

  it('has no duplicate trait codes across categories', () => {
    const allCodes = TRAIT_CATEGORIES.flatMap((c) => c.traits);
    const unique = new Set(allCodes);
    expect(unique.size).toBe(allCodes.length);
  });
});

// ---------------------------------------------------------------------------
// SKILLS — 18 skills across 4 tiers
// ---------------------------------------------------------------------------

describe('SKILLS', () => {
  it('has exactly 18 skills', () => {
    expect(SKILLS).toHaveLength(18);
  });

  it('has skills in all 4 tiers', () => {
    const tiers = new Set(SKILLS.map((s) => s.tier));
    expect(tiers).toContain('common');
    expect(tiers).toContain('tactical');
    expect(tiers).toContain('elite');
    expect(tiers).toContain('legendary');
  });

  it('common tier costs are in 75-100 range', () => {
    const common = SKILLS.filter((s) => s.tier === 'common');
    expect(common).toHaveLength(4);
    for (const s of common) {
      expect(s.cost).toBeGreaterThanOrEqual(75);
      expect(s.cost).toBeLessThanOrEqual(100);
    }
  });

  it('tactical tier costs are in 150-200 range', () => {
    const tactical = SKILLS.filter((s) => s.tier === 'tactical');
    expect(tactical).toHaveLength(6);
    for (const s of tactical) {
      expect(s.cost).toBeGreaterThanOrEqual(150);
      expect(s.cost).toBeLessThanOrEqual(200);
    }
  });

  it('elite tier costs are in 300-350 range', () => {
    const elite = SKILLS.filter((s) => s.tier === 'elite');
    expect(elite).toHaveLength(4);
    for (const s of elite) {
      expect(s.cost).toBeGreaterThanOrEqual(300);
      expect(s.cost).toBeLessThanOrEqual(350);
    }
  });

  it('legendary tier costs are in 450-500 range', () => {
    const legendary = SKILLS.filter((s) => s.tier === 'legendary');
    expect(legendary).toHaveLength(4);
    for (const s of legendary) {
      expect(s.cost).toBeGreaterThanOrEqual(450);
      expect(s.cost).toBeLessThanOrEqual(500);
    }
  });

  it('all skills have id, name, category, tier, cost, effect', () => {
    for (const s of SKILLS) {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(typeof s.name).toBe('string');
      expect(s.name.length).toBeGreaterThan(0);
      expect(['Intel', 'Info', 'Strategy', 'Psych', 'Social']).toContain(s.category);
      expect(['common', 'tactical', 'elite', 'legendary']).toContain(s.tier);
      expect(typeof s.cost).toBe('number');
      expect(typeof s.effect).toBe('string');
      expect(s.effect.length).toBeGreaterThan(0);
    }
  });

  it('has no duplicate skill IDs', () => {
    const ids = SKILLS.map((s) => s.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

// ---------------------------------------------------------------------------
// FLAWS — 14 spec flaws
// ---------------------------------------------------------------------------

describe('FLAWS / getRandomFlaw', () => {
  it('has exactly 14 flaws', () => {
    expect(FLAWS).toHaveLength(14);
  });

  it('returns a flaw object with name and effect', () => {
    const flaw = getRandomFlaw();
    expect(typeof flaw.name).toBe('string');
    expect(flaw.name.length).toBeGreaterThan(0);
    expect(typeof flaw.effect).toBe('string');
    expect(flaw.effect.length).toBeGreaterThan(0);
  });

  it('contains all 14 spec flaws by name', () => {
    const expectedNames = [
      'Fear of Losing', 'Loner', 'Overthinker', 'People Pleaser',
      'Grudge Holder', 'Big Bettor', 'Pessimist', 'Attention Seeker',
      'Imposter Syndrome', 'Hot Streak Chaser', 'Commitmentphobe',
      'Conspiracy Theorist', 'Perfectionist', 'Glass Ego',
    ];
    const flawNames = FLAWS.map(f => f.name);
    for (const name of expectedNames) {
      expect(flawNames).toContain(name);
    }
  });

  it('multiple calls return different flaws (probabilistically)', () => {
    const names = new Set<string>();
    for (let i = 0; i < 100; i++) {
      names.add(getRandomFlaw().name);
    }
    expect(names.size).toBeGreaterThan(1);
  });
});

// ---------------------------------------------------------------------------
// ECONOMY
// ---------------------------------------------------------------------------

describe('ECONOMY', () => {
  it('TOTAL_BUDGET is 1000', () => {
    expect(ECONOMY.TOTAL_BUDGET).toBe(1000);
  });

  it('PERSONALITY_BUDGET is 650', () => {
    expect(ECONOMY.PERSONALITY_BUDGET).toBe(650);
  });

  it('COST_PER_POINT_OVER_50 is 3', () => {
    expect(ECONOMY.COST_PER_POINT_OVER_50).toBe(3);
  });

  it('REFUND_PER_POINT_UNDER_50 is 1', () => {
    expect(ECONOMY.REFUND_PER_POINT_UNDER_50).toBe(1);
  });

  it('MAX_SKILLS is 3', () => {
    expect(ECONOMY.MAX_SKILLS).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// calculateTraitCost
// ---------------------------------------------------------------------------

describe('calculateTraitCost', () => {
  it('value 50 -> cost 0', () => {
    expect(calculateTraitCost(50)).toBe(0);
  });

  it('value 80 -> cost 90 (30 * 3)', () => {
    expect(calculateTraitCost(80)).toBe(90);
  });

  it('value 100 -> cost 150 (50 * 3)', () => {
    expect(calculateTraitCost(100)).toBe(150);
  });

  it('value 20 -> refund -30 (-(50-20) * 1)', () => {
    expect(calculateTraitCost(20)).toBe(-30);
  });

  it('value 0 -> refund -50 (-(50-0) * 1)', () => {
    expect(calculateTraitCost(0)).toBe(-50);
  });

  it('value 51 -> cost 3 (1 * 3)', () => {
    expect(calculateTraitCost(51)).toBe(3);
  });

  it('value 49 -> refund -1 (-(50-49) * 1)', () => {
    expect(calculateTraitCost(49)).toBe(-1);
  });
});

// ---------------------------------------------------------------------------
// calculateTotalPersonalityCost
// ---------------------------------------------------------------------------

describe('calculateTotalPersonalityCost', () => {
  const baseAll50 = Object.fromEntries(ALL_TRAIT_CODES.map((k) => [k, 50]));

  it('all traits at 50 -> total 0', () => {
    const current = { ...baseAll50 };
    expect(calculateTotalPersonalityCost(current)).toBe(0);
  });

  it('one trait at 80, rest at 50 -> total 90', () => {
    const current = { ...baseAll50, O: 80 };
    expect(calculateTotalPersonalityCost(current)).toBe(90);
  });

  it('one trait at 80, one at 20 -> net 60 (90 cost - 30 refund)', () => {
    const current = { ...baseAll50, O: 80, A: 20 };
    expect(calculateTotalPersonalityCost(current)).toBe(60);
  });

  it('empty traits object -> total 0', () => {
    expect(calculateTotalPersonalityCost({})).toBe(0);
  });

  it('single trait below 50 -> refund but floor at 0', () => {
    const current = { O: 10 };
    // cost = -(50-10) * 1 = -40, clamped to 0
    expect(calculateTotalPersonalityCost(current)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// mapSoulForgeToDb
// ---------------------------------------------------------------------------

describe('mapSoulForgeToDb', () => {
  it('maps O (Openness) 80 to 0.8', () => {
    const result = mapSoulForgeToDb({ O: 80 }, {});
    expect(result.openness).toBeCloseTo(0.8);
  });

  it('maps ASSERTIVENESS to aggressiveness DB field', () => {
    const result = mapSoulForgeToDb({ ASSERTIVENESS: 70 }, {});
    expect(result.aggressiveness).toBeCloseTo(0.7);
  });

  it('maps HH (Honesty-Humility) inversely to deceptiveness DB field', () => {
    // High HH = low deceptiveness
    const result = mapSoulForgeToDb({ HH: 80 }, {});
    expect(result.deceptiveness).toBeCloseTo(0.2);
  });

  it('maps LOYALTY to loyalty DB field', () => {
    const result = mapSoulForgeToDb({ LOYALTY: 90 }, {});
    expect(result.loyalty).toBeCloseTo(0.9);
  });

  it('defaults missing traits to 50 (i.e. 0.5)', () => {
    const result = mapSoulForgeToDb({}, {});
    expect(result.openness).toBeCloseTo(0.5);
    expect(result.conscientiousness).toBeCloseTo(0.5);
    expect(result.extraversion).toBeCloseTo(0.5);
  });

  it('applies adjustments correctly', () => {
    const result = mapSoulForgeToDb({ O: 60 }, { O: 10 });
    expect(result.openness).toBeCloseTo(0.7);
  });

  it('clamps values to 0.0-1.0 range', () => {
    const resultHigh = mapSoulForgeToDb({ O: 100 }, { O: 50 });
    expect(resultHigh.openness).toBe(1.0);

    const resultLow = mapSoulForgeToDb({ O: 0 }, { O: -50 });
    expect(resultLow.openness).toBe(0.0);
  });

  it('returns object with all expected DB field names', () => {
    const result = mapSoulForgeToDb({}, {});
    const expectedFields = [
      'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
      'aggressiveness', 'deceptiveness', 'loyalty', 'riskTolerance', 'adaptability',
      'charisma', 'patience', 'ambition', 'empathy', 'creativity',
    ];
    for (const field of expectedFields) {
      expect(result).toHaveProperty(field);
      expect(typeof result[field]).toBe('number');
    }
  });
});

// ---------------------------------------------------------------------------
// SUGGESTION_CHIPS
// ---------------------------------------------------------------------------

describe('SUGGESTION_CHIPS', () => {
  it('has exactly 10 chips', () => {
    expect(SUGGESTION_CHIPS).toHaveLength(10);
  });

  it('all are non-empty strings', () => {
    for (const chip of SUGGESTION_CHIPS) {
      expect(typeof chip).toBe('string');
      expect(chip.length).toBeGreaterThan(0);
    }
  });

  it('all are under 180 characters', () => {
    for (const chip of SUGGESTION_CHIPS) {
      expect(chip.length).toBeLessThan(180);
    }
  });
});
