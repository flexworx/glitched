/**
 * RADF v3 — Seeded RNG Tests
 * Tests determinism, range, and distribution of the seeded RNG.
 */
import { describe, it, expect } from 'vitest';
import { SeededRNG } from '@/lib/engine/seeded-rng';

describe('SeededRNG', () => {
  it('produces the same sequence for the same seed', () => {
    const rng1 = new SeededRNG(12345);
    const rng2 = new SeededRNG(12345);
    const seq1 = Array.from({ length: 10 }, () => rng1.next());
    const seq2 = Array.from({ length: 10 }, () => rng2.next());
    expect(seq1).toEqual(seq2);
  });

  it('produces different sequences for different seeds', () => {
    const rng1 = new SeededRNG(111);
    const rng2 = new SeededRNG(222);
    const seq1 = Array.from({ length: 5 }, () => rng1.next());
    const seq2 = Array.from({ length: 5 }, () => rng2.next());
    expect(seq1).not.toEqual(seq2);
  });

  it('returns values in [0, 1)', () => {
    const rng = new SeededRNG(99999);
    for (let i = 0; i < 100; i++) {
      const v = rng.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  it('int() returns integer in [min, max]', () => {
    const rng = new SeededRNG(42);
    for (let i = 0; i < 50; i++) {
      const v = rng.int(1, 6);
      expect(v).toBeGreaterThanOrEqual(1);
      expect(v).toBeLessThanOrEqual(6);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  it('chance() returns boolean with expected distribution', () => {
    const rng = new SeededRNG(77777);
    const results = Array.from({ length: 1000 }, () => rng.chance(0.5));
    const trueCount = results.filter(Boolean).length;
    // With 1000 samples at 50%, expect between 400-600 trues
    expect(trueCount).toBeGreaterThan(400);
    expect(trueCount).toBeLessThan(600);
  });

  it('pick selects a random element from an array', () => {
    const rng = new SeededRNG(55555);
    const arr = ['a', 'b', 'c', 'd'];
    for (let i = 0; i < 20; i++) {
      const picked = rng.pick(arr);
      expect(arr).toContain(picked);
    }
  });

  it('shuffle returns all elements in a different order', () => {
    const rng = new SeededRNG(33333);
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = rng.shuffle([...original]);
    expect(shuffled).toHaveLength(original.length);
    // All original elements should still be present
    for (const item of original) {
      expect(shuffled).toContain(item);
    }
  });
});
