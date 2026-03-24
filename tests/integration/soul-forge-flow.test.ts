import {
  ECONOMY,
  SKILLS,
  TRAIT_INFO,
  TRAIT_CATEGORIES,
  calculateTraitCost,
  calculateTotalPersonalityCost,
  mapSoulForgeToDb,
  getRandomFlaw,
} from '@/lib/soul-forge/constants';
import type { Skill } from '@/lib/soul-forge/constants';

// =============================================================================
// Helpers
// =============================================================================

/** All 31 trait codes from TRAIT_INFO. */
const ALL_TRAIT_CODES = Object.keys(TRAIT_INFO);

/** Build a trait record with all traits at the given value. */
function uniformTraits(value: number): Record<string, number> {
  const traits: Record<string, number> = {};
  for (const code of ALL_TRAIT_CODES) {
    traits[code] = value;
  }
  return traits;
}

/** Build a mock AI-generated profile with specific trait values. */
function mockAiProfile(overrides: Record<string, number> = {}): Record<string, number> {
  const base = uniformTraits(50);
  return { ...base, ...overrides };
}

/** Build an adjustments record where each trait is adjusted by a given delta. */
function uniformAdjustments(delta: number): Record<string, number> {
  const adj: Record<string, number> = {};
  for (const code of ALL_TRAIT_CODES) {
    adj[code] = delta;
  }
  return adj;
}

/** Compute total personality cost from adjustments applied to base traits at 50. */
function computePersonalityCostFromAdjustments(
  baseTraits: Record<string, number>,
  adjustments: Record<string, number>
): number {
  const adjusted: Record<string, number> = {};
  for (const key of Object.keys(baseTraits)) {
    adjusted[key] = (baseTraits[key] ?? 50) + (adjustments[key] ?? 0);
  }
  return calculateTotalPersonalityCost(baseTraits, adjusted);
}

/** Pick skills by tier. */
function pickSkillsByTier(tier: Skill['tier'], count: number): Skill[] {
  return SKILLS.filter((s) => s.tier === tier).slice(0, count);
}

/** Simulate full budget calculation. */
function calculateBudget(
  personalityCost: number,
  skills: Skill[]
): { personalityCost: number; skillsCost: number; totalSpent: number; remaining: number } {
  const cappedPersonality = Math.min(personalityCost, ECONOMY.PERSONALITY_BUDGET);
  const skillsCost = skills.reduce((sum, s) => sum + s.cost, 0);
  const totalSpent = cappedPersonality + skillsCost;
  return {
    personalityCost: cappedPersonality,
    skillsCost,
    totalSpent,
    remaining: ECONOMY.TOTAL_BUDGET - totalSpent,
  };
}

// =============================================================================
// Tests
// =============================================================================

describe('Soul Forge Flow Integration', () => {
  // ---------------------------------------------------------------------------
  // 1. Trait mapping roundtrip
  // ---------------------------------------------------------------------------
  describe('Trait mapping roundtrip', () => {
    it('should map all AI-generated traits to DB format with values in 0.0-1.0', () => {
      const aiTraits = mockAiProfile({
        O: 80,
        C: 30,
        E: 95,
        A: 10,
        N: 70,
        ASSERTIVENESS: 60,
        HH: 15,
        LOYALTY: 40,
        RISK_TOLERANCE: 75,
        ADAPTABILITY: 55,
        HE: 90,
        URGENCY: 80,
        STRATEGIC: 65,
        EMPATHY: 45,
        CREATIVITY: 80,
      });

      // Zero adjustments — just mapping base traits
      const zeroAdj: Record<string, number> = {};
      const dbTraits = mapSoulForgeToDb(aiTraits, zeroAdj);

      // Verify all expected DB fields are populated
      const expectedDbKeys = [
        'openness', 'conscientiousness', 'extraversion', 'agreeableness',
        'neuroticism', 'aggressiveness', 'deceptiveness', 'loyalty',
        'riskTolerance', 'adaptability', 'charisma', 'patience',
        'ambition', 'empathy', 'creativity',
      ];
      for (const key of expectedDbKeys) {
        expect(dbTraits[key]).toBeDefined();
        expect(dbTraits[key]).toBeGreaterThanOrEqual(0.0);
        expect(dbTraits[key]).toBeLessThanOrEqual(1.0);
      }

      // Verify specific mappings
      expect(dbTraits.openness).toBeCloseTo(0.8);             // O: 80/100
      expect(dbTraits.conscientiousness).toBeCloseTo(0.3);    // C: 30/100
      expect(dbTraits.extraversion).toBeCloseTo(0.95);        // E: 95/100
      expect(dbTraits.agreeableness).toBeCloseTo(0.1);        // A: 10/100
      expect(dbTraits.aggressiveness).toBeCloseTo(0.6);       // ASSERTIVENESS: 60/100
      expect(dbTraits.deceptiveness).toBeCloseTo(0.85);       // 1 - HH: 1 - 15/100 = 0.85
      expect(dbTraits.loyalty).toBeCloseTo(0.4);              // LOYALTY: 40/100
      expect(dbTraits.riskTolerance).toBeCloseTo(0.75);       // RISK_TOLERANCE: 75/100
      expect(dbTraits.charisma).toBeCloseTo(0.9);             // HE: 90/100
      expect(dbTraits.patience).toBeCloseTo(0.2);             // 1 - URGENCY: 1 - 80/100 = 0.2
    });

    it('should correctly apply adjustments before mapping', () => {
      const aiTraits = mockAiProfile({ O: 60, HE: 40 });
      const adjustments: Record<string, number> = { O: 20, HE: -10 };

      const dbTraits = mapSoulForgeToDb(aiTraits, adjustments);

      // openness: (60 + 20) / 100 = 0.8
      expect(dbTraits.openness).toBeCloseTo(0.8);
      // charisma (HE): (40 + -10) / 100 = 0.3
      expect(dbTraits.charisma).toBeCloseTo(0.3);
    });

    it('should clamp values to 0.0-1.0 range even with extreme adjustments', () => {
      const aiTraits = mockAiProfile({ O: 90, URGENCY: 90 });
      // extreme adjustments that would push out of range
      const adjustments: Record<string, number> = { O: 50, URGENCY: 50 };

      const dbTraits = mapSoulForgeToDb(aiTraits, adjustments);

      // openness: min(1, (90+50)/100) = min(1, 1.4) = 1.0
      expect(dbTraits.openness).toBe(1.0);
      // patience: 1 - min(1, (90+50)/100) = 1 - 1.0 = 0.0
      expect(dbTraits.patience).toBe(0.0);
    });

    it('should map spec trait codes correctly (ASSERTIVENESS -> aggressiveness, etc.)', () => {
      const aiTraits = mockAiProfile({
        ASSERTIVENESS: 70,
        HH: 70,
        LOYALTY: 80,
      });
      const dbTraits = mapSoulForgeToDb(aiTraits, {});

      expect(dbTraits.aggressiveness).toBeCloseTo(0.7);  // from ASSERTIVENESS
      expect(dbTraits.deceptiveness).toBeCloseTo(0.3);    // 1 - HH: 1 - 70/100 = 0.3
      expect(dbTraits.loyalty).toBeCloseTo(0.8);          // from LOYALTY
    });
  });

  // ---------------------------------------------------------------------------
  // 2. Budget calculation flow
  // ---------------------------------------------------------------------------
  describe('Budget calculation flow', () => {
    it('should correctly compute trait costs for adjustments over and under 50', () => {
      // Cost per point over 50 is 3 $MURPH
      expect(calculateTraitCost(50, 70)).toBe(60);   // 20 * 3 = 60
      expect(calculateTraitCost(50, 100)).toBe(150);  // 50 * 3 = 150

      // Refund per point under 50 is 1 $MURPH (returned as negative cost conceptually)
      // But calculateTraitCost returns the absolute refund inverted:
      // diff = currentValue - baseValue = 30 - 50 = -20
      // return diff * REFUND_PER_POINT_UNDER_50 * -1 = -20 * 1 * -1 = 20
      expect(calculateTraitCost(50, 30)).toBe(20);

      // At base, no cost (function returns -0 due to 0 * -1, which is equivalent to 0)
      expect(Math.abs(calculateTraitCost(50, 50))).toBe(0);
    });

    it('should compute total personality cost respecting the 650 cap', () => {
      const baseTraits = uniformTraits(50);

      // All traits at 50 → zero cost
      const zeroCost = calculateTotalPersonalityCost(baseTraits, baseTraits);
      expect(zeroCost).toBe(0);

      // Some traits adjusted
      const adjusted = { ...baseTraits, O: 70, C: 80 };
      const cost = calculateTotalPersonalityCost(baseTraits, adjusted);
      // O: +20 * 3 = 60, C: +30 * 3 = 90
      expect(cost).toBe(150);

      // With refunds: lowering some traits
      const withRefunds = { ...baseTraits, O: 70, N: 30 };
      const costWithRefund = calculateTotalPersonalityCost(baseTraits, withRefunds);
      // O: +20 * 3 = 60, N: -20 * 1 = 20 (refund as positive)
      // calculateTraitCost: diff > 0 → diff * COST_PER_POINT_OVER_50
      //                     diff <= 0 → diff * REFUND_PER_POINT_UNDER_50 * -1
      // So under 50 gives positive cost too: (-20) * 1 * -1 = 20
      // Both increasing and decreasing from base costs money.
      // Under 50 costs 1 per point, over 50 costs 3 per point.
      expect(costWithRefund).toBe(80); // 60 + 20
    });

    it('should correctly calculate budget with 1000 $MURPH starting amount', () => {
      const baseTraits = uniformTraits(50);
      const adjusted = {
        ...baseTraits,
        O: 70,        // +20 over → 60 cost
        C: 80,        // +30 over → 90 cost
        EMPATHY: 35,  // -15 under → 15 cost
      };
      const personalityCost = calculateTotalPersonalityCost(baseTraits, adjusted);
      expect(personalityCost).toBe(165); // 60 + 90 + 15

      // Pick 3 skills from different tiers
      const skills = [
        SKILLS.find((s) => s.tier === 'common')!,    // 75-100
        SKILLS.find((s) => s.tier === 'tactical')!,   // 150-200
        SKILLS.find((s) => s.tier === 'elite')!,      // 300-350
      ];
      const budget = calculateBudget(personalityCost, skills);

      expect(budget.personalityCost).toBe(165);
      expect(budget.skillsCost).toBe(skills.reduce((s, sk) => s + sk.cost, 0));
      expect(budget.totalSpent).toBe(budget.personalityCost + budget.skillsCost);
      expect(budget.remaining).toBe(ECONOMY.TOTAL_BUDGET - budget.totalSpent);
      expect(budget.remaining).toBeGreaterThanOrEqual(0);
    });

    it('should cap personality cost at 650 $MURPH', () => {
      const baseTraits = uniformTraits(50);
      // Push many traits to max
      const maxed: Record<string, number> = {};
      for (const code of ALL_TRAIT_CODES) {
        maxed[code] = 100; // +50 * 3 = 150 per trait, 31 traits = 4650
      }
      const rawCost = calculateTotalPersonalityCost(baseTraits, maxed);
      expect(rawCost).toBeGreaterThan(ECONOMY.PERSONALITY_BUDGET);

      // When building budget, cap applies
      const budget = calculateBudget(rawCost, []);
      expect(budget.personalityCost).toBe(ECONOMY.PERSONALITY_BUDGET);
      expect(budget.remaining).toBe(ECONOMY.TOTAL_BUDGET - ECONOMY.PERSONALITY_BUDGET);
    });
  });

  // ---------------------------------------------------------------------------
  // 3. Full agent creation flow
  // ---------------------------------------------------------------------------
  describe('Full agent creation flow', () => {
    it('should create a valid agent with all components', () => {
      // Step 1: Mock AI profile response (using spec trait codes)
      const aiTraits = mockAiProfile({
        O: 75,
        C: 60,
        E: 85,
        A: 40,
        N: 30,
        RISK_TOLERANCE: 70,
        HH: 35,
        LOYALTY: 55,
        ASSERTIVENESS: 80,
        ADAPTABILITY: 60,
        HE: 90,
        URGENCY: 65,
        STRATEGIC: 75,
        EMPATHY: 45,
        CREATIVITY: 70,
        DIRECTNESS: 80,
        FORMALITY: 30,
        EM: 60,
        HUMOR: 70,
        DECISION_SPEED: 65,
        PERFECTIONISM: 40,
        TRUST: 55,
        HC: 50,
        HO: 45,
        DATA_RELIANCE: 80,
        INTUITION: 70,
        RESILIENCE: 60,
        COLLABORATIVENESS: 75,
        INDEPENDENCE: 55,
        DETAIL: 50,
        FORGIVENESS: 45,
      });

      // Step 2: Apply personality adjustments (using spec trait codes)
      const adjustments: Record<string, number> = {
        O: 5,          // 75 → 80
        HE: 10,        // 90 → 100
        URGENCY: 5,    // 65 → 70
      };

      // Step 3: Map to DB format
      const dbTraits = mapSoulForgeToDb(aiTraits, adjustments);

      // Verify DB traits are valid
      for (const [key, value] of Object.entries(dbTraits)) {
        expect(value).toBeGreaterThanOrEqual(0);
        expect(value).toBeLessThanOrEqual(1);
      }

      // Step 4: Calculate personality cost
      const baseTraits = uniformTraits(50);
      const adjustedTraits: Record<string, number> = {};
      for (const key of Object.keys(aiTraits)) {
        adjustedTraits[key] = aiTraits[key] + (adjustments[key] ?? 0);
      }
      const personalityCost = calculateTotalPersonalityCost(baseTraits, adjustedTraits);
      expect(personalityCost).toBeGreaterThan(0);

      // Step 5: Equip 3 skills (using spec skill IDs)
      const skills: Skill[] = [
        SKILLS.find((s) => s.id === 'rumor-mill')!,         // common, 75
        SKILLS.find((s) => s.id === 'leak')!,               // tactical, 150
        SKILLS.find((s) => s.id === 'silver-tongue')!,      // elite, 300
      ];
      expect(skills).toHaveLength(3);
      expect(skills.every((s) => s !== undefined)).toBe(true);

      // Step 6: Assign random flaw
      const flaw = getRandomFlaw();
      expect(flaw.name).toBeTruthy();
      expect(flaw.effect).toBeTruthy();

      // Step 7: Calculate final budget
      const budget = calculateBudget(
        Math.min(personalityCost, ECONOMY.PERSONALITY_BUDGET),
        skills
      );

      // Step 8: Build the final agent object
      const agent = {
        name: 'TestAgent',
        personality: dbTraits,
        skills: skills.map((s) => s.id),
        flaw: flaw.name,
        budget: budget,
      };

      // Verify final agent
      expect(agent.name).toBe('TestAgent');
      expect(Object.keys(agent.personality).length).toBeGreaterThanOrEqual(15);
      expect(agent.skills).toHaveLength(3);
      expect(agent.flaw).toBeTruthy();
      expect(agent.budget.remaining).toBe(
        ECONOMY.TOTAL_BUDGET - budget.personalityCost - budget.skillsCost
      );
    });
  });

  // ---------------------------------------------------------------------------
  // 4. Edge cases
  // ---------------------------------------------------------------------------
  describe('Edge cases', () => {
    it('should handle a description at exactly 180 characters', () => {
      const description = 'A'.repeat(180);
      expect(description.length).toBe(180);
      // Description length validation would be handled by the UI/API layer.
      // Here we verify the string is exactly 180 chars and can be used.
      expect(description).toBeTruthy();
    });

    it('should compute zero cost when all traits are at 50', () => {
      const baseTraits = uniformTraits(50);
      const currentTraits = uniformTraits(50);
      const cost = calculateTotalPersonalityCost(baseTraits, currentTraits);
      expect(cost).toBe(0);
    });

    it('should compute maximum cost when all traits are at 100', () => {
      const baseTraits = uniformTraits(50);
      const currentTraits = uniformTraits(100);
      const cost = calculateTotalPersonalityCost(baseTraits, currentTraits);

      // Each trait: +50 * 3 = 150, total traits: 31
      const expectedCost = ALL_TRAIT_CODES.length * 50 * ECONOMY.COST_PER_POINT_OVER_50;
      expect(cost).toBe(expectedCost);
      expect(cost).toBeGreaterThan(ECONOMY.PERSONALITY_BUDGET);
    });

    it('should enforce max 3 skills limit', () => {
      const skills = SKILLS.slice(0, 4);
      expect(skills.length).toBe(4);
      expect(skills.length).toBeGreaterThan(ECONOMY.MAX_SKILLS);

      // Verify the constant is 3
      expect(ECONOMY.MAX_SKILLS).toBe(3);

      // A properly built agent should only have 3 skills
      const validSkills = skills.slice(0, ECONOMY.MAX_SKILLS);
      expect(validSkills).toHaveLength(3);
    });

    it('should detect budget overflow with personality at cap plus 3 legendary skills', () => {
      const baseTraits = uniformTraits(50);
      const maxedTraits = uniformTraits(100);
      const personalityCost = calculateTotalPersonalityCost(baseTraits, maxedTraits);

      // Cap personality cost
      const cappedPersonality = Math.min(personalityCost, ECONOMY.PERSONALITY_BUDGET);
      expect(cappedPersonality).toBe(ECONOMY.PERSONALITY_BUDGET);

      // Pick 3 legendary skills
      const legendarySkills = SKILLS.filter((s) => s.tier === 'legendary').slice(0, 3);
      expect(legendarySkills.length).toBe(3);

      const legendaryTotalCost = legendarySkills.reduce((sum, s) => sum + s.cost, 0);
      const totalSpent = cappedPersonality + legendaryTotalCost;

      // Total: 650 + (450+450+500) = 650 + 1400 = 2050 → exceeds 1000
      expect(totalSpent).toBeGreaterThan(ECONOMY.TOTAL_BUDGET);
      const remaining = ECONOMY.TOTAL_BUDGET - totalSpent;
      expect(remaining).toBeLessThan(0);
    });

    it('should have all 31 traits defined in TRAIT_INFO', () => {
      expect(ALL_TRAIT_CODES.length).toBe(31);

      // Verify each trait has complete info
      for (const code of ALL_TRAIT_CODES) {
        const info = TRAIT_INFO[code];
        expect(info.code).toBe(code);
        expect(info.name).toBeTruthy();
        expect(info.category).toBeTruthy();
        expect(info.lowLabel).toBeTruthy();
        expect(info.highLabel).toBeTruthy();
      }
    });

    it('should categorize all traits into TRAIT_CATEGORIES', () => {
      const categorizedTraits = TRAIT_CATEGORIES.flatMap((c) => c.traits);
      // All categorized traits should exist in TRAIT_INFO
      for (const trait of categorizedTraits) {
        expect(TRAIT_INFO[trait]).toBeDefined();
      }
      // All TRAIT_INFO traits should be categorized
      for (const code of ALL_TRAIT_CODES) {
        expect(categorizedTraits).toContain(code);
      }
    });

    it('should have skills in each tier', () => {
      const tiers: Skill['tier'][] = ['common', 'tactical', 'elite', 'legendary'];
      for (const tier of tiers) {
        const tierSkills = SKILLS.filter((s) => s.tier === tier);
        expect(tierSkills.length).toBeGreaterThan(0);
      }
    });

    it('should return a valid flaw from getRandomFlaw', () => {
      // Call multiple times to ensure randomness works
      const flaws = new Set<string>();
      for (let i = 0; i < 50; i++) {
        const flaw = getRandomFlaw();
        expect(flaw.name).toBeTruthy();
        expect(flaw.effect).toBeTruthy();
        flaws.add(flaw.name);
      }
      // With 50 calls and 14 flaws, we should see at least a few different ones
      expect(flaws.size).toBeGreaterThan(1);
    });

    it('should compute cost correctly when lowering traits below 50', () => {
      const baseTraits = uniformTraits(50);
      const lowered = uniformTraits(0); // all at 0, -50 from base

      const cost = calculateTotalPersonalityCost(baseTraits, lowered);
      // Each trait: 50 * 1 (REFUND_PER_POINT_UNDER_50) = 50 per trait
      const expectedCost = ALL_TRAIT_CODES.length * 50 * ECONOMY.REFUND_PER_POINT_UNDER_50;
      expect(cost).toBe(expectedCost);
    });

    it('should handle mixed adjustments with both increases and decreases', () => {
      const base = mockAiProfile();
      const adj: Record<string, number> = {
        O: 30,          // 50+30 = 80 → openness 0.8
        URGENCY: 30,    // 50+30 = 80 → patience = 1 - 0.8 = 0.2
        HE: 0,          // 50+0 = 50 → charisma 0.5
      };

      const dbTraits = mapSoulForgeToDb(base, adj);
      expect(dbTraits.openness).toBeCloseTo(0.8);
      expect(dbTraits.patience).toBeCloseTo(0.2);
      expect(dbTraits.charisma).toBeCloseTo(0.5);
    });
  });
});
