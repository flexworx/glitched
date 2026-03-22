/**
 * RADF v3 — Creator Pricing Tests
 */
import { describe, it, expect } from 'vitest';
import {
  calculateTraitCost,
  calculateTotalCost,
  getTraitSliderColor,
  getTraitTierLabel,
} from '@/lib/creator/pricing';

describe('calculateTraitCost', () => {
  it('returns 0 for values in the free range (40-60)', () => {
    expect(calculateTraitCost(40)).toBe(0);
    expect(calculateTraitCost(50)).toBe(0);
    expect(calculateTraitCost(60)).toBe(0);
  });

  it('charges 2 credits per point in the 61-70 range', () => {
    // 70 = 10 points above free range at 2/pt = 20
    expect(calculateTraitCost(70)).toBe(20);
  });

  it('charges 2 credits per point in the 30-39 range', () => {
    // 30 = 10 points below free range at 2/pt = 20
    expect(calculateTraitCost(30)).toBe(20);
  });

  it('charges more for extreme values', () => {
    const cost70 = calculateTraitCost(70);
    const cost90 = calculateTraitCost(90);
    const cost100 = calculateTraitCost(100);
    expect(cost90).toBeGreaterThan(cost70);
    expect(cost100).toBeGreaterThan(cost90);
  });

  it('is symmetric around the free range', () => {
    // Value 30 (10 below free) should cost same as value 70 (10 above free)
    expect(calculateTraitCost(30)).toBe(calculateTraitCost(70));
    expect(calculateTraitCost(20)).toBe(calculateTraitCost(80));
    expect(calculateTraitCost(10)).toBe(calculateTraitCost(90));
  });

  it('clamps values to [1, 100]', () => {
    expect(calculateTraitCost(0)).toBe(calculateTraitCost(1));
    expect(calculateTraitCost(101)).toBe(calculateTraitCost(100));
  });
});

describe('calculateTotalCost', () => {
  it('returns 0 for all traits in free range', () => {
    const traits = { aggression: 50, empathy: 50, cunning: 50 };
    expect(calculateTotalCost(traits)).toBe(0);
  });

  it('sums costs across all traits', () => {
    const traits = { aggression: 70, empathy: 30 };
    const expected = calculateTraitCost(70) + calculateTraitCost(30);
    expect(calculateTotalCost(traits)).toBe(expected);
  });
});

describe('getTraitSliderColor', () => {
  it('returns green for free range', () => {
    expect(getTraitSliderColor(50)).toBe('#39FF14');
  });

  it('returns gold for 61-70 range', () => {
    expect(getTraitSliderColor(65)).toBe('#FFD700');
  });

  it('returns red for extreme values', () => {
    expect(getTraitSliderColor(1)).toBe('#FF073A');
    expect(getTraitSliderColor(100)).toBe('#FF073A');
  });
});

describe('getTraitTierLabel', () => {
  it('returns FREE for values in 40-60', () => {
    expect(getTraitTierLabel(50)).toBe('FREE');
  });

  it('returns correct label for each tier', () => {
    expect(getTraitTierLabel(65)).toBe('2cr/pt');
    expect(getTraitTierLabel(75)).toBe('5cr/pt');
    expect(getTraitTierLabel(85)).toBe('10cr/pt');
    expect(getTraitTierLabel(95)).toBe('25cr/pt');
  });
});
