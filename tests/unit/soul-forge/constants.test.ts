import {
  ECONOMY,
  SUGGESTION_CHIPS,
  TRAIT_INFO,
  TRAIT_CATEGORIES,
  SKILLS,
  getRandomFlaw,
  calculateTraitCost,
  calculateTotalPersonalityCost,
  mapSoulForgeToDb,
} from '../../../src/lib/soul-forge/constants';
import type { TraitInfo, Skill, Flaw } from '../../../src/lib/soul-forge/constants';

// ---------------------------------------------------------------------------
// TRAIT_INFO
// ---------------------------------------------------------------------------

const ALL_TRAIT_CODES = [
  'openness', 'conscientiousness', 'extraversion', 'agreeableness', 'neuroticism',
  'directness', 'formality', 'verbosity', 'humor', 'empathy',
  'riskTolerance', 'deceptionAptitude', 'loyaltyBias', 'competitiveness', 'adaptability',
  'impulsivity', 'stubbornness', 'creativity', 'patience', 'cunning',
  'charisma', 'paranoia', 'ambition', 'compassion', 'discipline',
  'volatility', 'curiosity', 'dominance', 'resilience', 'theatricality', 'integrity',
];

describe('TRAIT_INFO', () => {
  it('has info for all 31 numeric traits', () => {
    expect(Object.keys(TRAIT_INFO)).toHaveLength(31);
    for (const code of ALL_TRAIT_CODES) {
      expect(TRAIT_INFO).toHaveProperty(code);
    }
  });

  it('each entry has code, name, lowLabel, highLabel (all non-empty strings)', () => {
    for (const [key, info] of Object.entries(TRAIT_INFO)) {
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
// TRAIT_CATEGORIES
// ---------------------------------------------------------------------------

describe('TRAIT_CATEGORIES', () => {
  it('has exactly 6 categories', () => {
    expect(TRAIT_CATEGORIES).toHaveLength(6);
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
// SKILLS
// ---------------------------------------------------------------------------

describe('SKILLS', () => {
  it('has skills in all 4 tiers', () => {
    const tiers = new Set(SKILLS.map((s) => s.tier));
    expect(tiers).toContain('common');
    expect(tiers).toContain('tactical');
    expect(tiers).toContain('elite');
    expect(tiers).toContain('legendary');
  });

  it('common tier costs are in 60-80 range', () => {
    const common = SKILLS.filter((s) => s.tier === 'common');
    expect(common.length).toBeGreaterThan(0);
    for (const s of common) {
      expect(s.cost).toBeGreaterThanOrEqual(60);
      expect(s.cost).toBeLessThanOrEqual(80);
    }
  });

  it('tactical tier costs are in 100-140 range', () => {
    const tactical = SKILLS.filter((s) => s.tier === 'tactical');
    expect(tactical.length).toBeGreaterThan(0);
    for (const s of tactical) {
      expect(s.cost).toBeGreaterThanOrEqual(100);
      expect(s.cost).toBeLessThanOrEqual(140);
    }
  });

  it('elite tier costs are in 160-200 range', () => {
    const elite = SKILLS.filter((s) => s.tier === 'elite');
    expect(elite.length).toBeGreaterThan(0);
    for (const s of elite) {
      expect(s.cost).toBeGreaterThanOrEqual(160);
      expect(s.cost).toBeLessThanOrEqual(200);
    }
  });

  it('legendary tier costs are in 250-350 range', () => {
    const legendary = SKILLS.filter((s) => s.tier === 'legendary');
    expect(legendary.length).toBeGreaterThan(0);
    for (const s of legendary) {
      expect(s.cost).toBeGreaterThanOrEqual(250);
      expect(s.cost).toBeLessThanOrEqual(350);
    }
  });

  it('all skills have id, name, category, tier, cost, effect', () => {
    for (const s of SKILLS) {
      expect(typeof s.id).toBe('string');
      expect(s.id.length).toBeGreaterThan(0);
      expect(typeof s.name).toBe('string');
      expect(s.name.length).toBeGreaterThan(0);
      expect(['offense', 'defense', 'social', 'intel']).toContain(s.category);
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
// FLAWS (via getRandomFlaw)
// ---------------------------------------------------------------------------

describe('FLAWS / getRandomFlaw', () => {
  it('returns a flaw object with name and effect', () => {
    const flaw = getRandomFlaw();
    expect(typeof flaw.name).toBe('string');
    expect(flaw.name.length).toBeGreaterThan(0);
    expect(typeof flaw.effect).toBe('string');
    expect(flaw.effect.length).toBeGreaterThan(0);
  });

  it('has at least 12 distinct flaws (call 100 times and check uniqueness > 1)', () => {
    const names = new Set<string>();
    for (let i = 0; i < 200; i++) {
      names.add(getRandomFlaw().name);
    }
    // With 12 flaws and 200 draws, probability of seeing fewer than 12 is negligible
    expect(names.size).toBeGreaterThanOrEqual(12);
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
  const base = 50;

  it('value 50 (no change) -> cost 0', () => {
    // diff=0, enters else branch: 0 * 1 * -1 = -0
    expect(calculateTraitCost(base, 50) + 0).toBe(0);
  });

  it('value 80 -> cost 90 (30 * 3)', () => {
    expect(calculateTraitCost(base, 80)).toBe(90);
  });

  it('value 100 -> cost 150 (50 * 3)', () => {
    expect(calculateTraitCost(base, 100)).toBe(150);
  });

  it('value 20 -> cost 30 (negative diff flipped: -30 * 1 * -1 = 30)', () => {
    expect(calculateTraitCost(base, 20)).toBe(30);
  });

  it('value 0 -> cost 50 (negative diff flipped: -50 * 1 * -1 = 50)', () => {
    expect(calculateTraitCost(base, 0)).toBe(50);
  });

  it('value 51 -> cost 3 (1 * 3)', () => {
    expect(calculateTraitCost(base, 51)).toBe(3);
  });

  it('value 49 -> cost 1 (negative diff flipped: -1 * 1 * -1 = 1)', () => {
    expect(calculateTraitCost(base, 49)).toBe(1);
  });
});

// ---------------------------------------------------------------------------
// calculateTotalPersonalityCost
// ---------------------------------------------------------------------------

describe('calculateTotalPersonalityCost', () => {
  const baseAll50 = Object.fromEntries(ALL_TRAIT_CODES.map((k) => [k, 50]));

  it('all traits at 50 -> total 0', () => {
    const current = { ...baseAll50 };
    expect(calculateTotalPersonalityCost(baseAll50, current)).toBe(0);
  });

  it('one trait at 80, rest at 50 -> total 90', () => {
    const current = { ...baseAll50, openness: 80 };
    expect(calculateTotalPersonalityCost(baseAll50, current)).toBe(90);
  });

  it('one trait at 80, one at 20 -> total 120 (90 + 30, both directions cost)', () => {
    const current = { ...baseAll50, openness: 80, agreeableness: 20 };
    expect(calculateTotalPersonalityCost(baseAll50, current)).toBe(120);
  });

  it('empty traits object -> total 0', () => {
    expect(calculateTotalPersonalityCost({}, {})).toBe(0);
  });

  it('single trait below base still costs (deviation in either direction)', () => {
    const current = { openness: 10 };
    // diff = 10 - 50 = -40, cost = -40 * 1 * -1 = 40
    expect(calculateTotalPersonalityCost(baseAll50, current)).toBe(40);
  });
});

// ---------------------------------------------------------------------------
// mapSoulForgeToDb
// ---------------------------------------------------------------------------

describe('mapSoulForgeToDb', () => {
  it('maps openness 80 to 0.8', () => {
    const result = mapSoulForgeToDb({ openness: 80 }, {});
    expect(result.openness).toBeCloseTo(0.8);
  });

  it('maps competitiveness to aggressiveness DB field', () => {
    const result = mapSoulForgeToDb({ competitiveness: 70 }, {});
    expect(result.aggressiveness).toBeCloseTo(0.7);
  });

  it('maps deceptionAptitude to deceptiveness DB field', () => {
    const result = mapSoulForgeToDb({ deceptionAptitude: 60 }, {});
    expect(result.deceptiveness).toBeCloseTo(0.6);
  });

  it('maps loyaltyBias to loyalty DB field', () => {
    const result = mapSoulForgeToDb({ loyaltyBias: 90 }, {});
    expect(result.loyalty).toBeCloseTo(0.9);
  });

  it('defaults missing traits to 50 (i.e. 0.5)', () => {
    const result = mapSoulForgeToDb({}, {});
    expect(result.openness).toBeCloseTo(0.5);
    expect(result.conscientiousness).toBeCloseTo(0.5);
    expect(result.extraversion).toBeCloseTo(0.5);
  });

  it('applies adjustments correctly', () => {
    const result = mapSoulForgeToDb({ openness: 60 }, { openness: 10 });
    expect(result.openness).toBeCloseTo(0.7);
  });

  it('clamps values to 0.0-1.0 range', () => {
    const resultHigh = mapSoulForgeToDb({ openness: 100 }, { openness: 50 });
    expect(resultHigh.openness).toBe(1.0);

    const resultLow = mapSoulForgeToDb({ openness: 0 }, { openness: -50 });
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
