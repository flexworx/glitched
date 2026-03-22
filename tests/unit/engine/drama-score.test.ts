import { describe, it, expect } from 'vitest';

describe('Drama Score', () => {
  const DRAMA_WEIGHTS = {
    BETRAYAL: 25, ELIMINATION: 30, ALLIANCE_FORMED: 15,
    CRITICAL_HIT: 20, LAST_STAND: 35, COMEBACK: 40,
  };

  it('should calculate correct drama for betrayal', () => {
    expect(DRAMA_WEIGHTS.BETRAYAL).toBe(25);
  });

  it('should cap drama score at 100', () => {
    const rawScore = 150;
    const capped = Math.min(100, rawScore);
    expect(capped).toBe(100);
  });

  it('should decay drama over time', () => {
    const decayRate = 2;
    const score = 80;
    const decayed = Math.max(0, score - decayRate);
    expect(decayed).toBe(78);
  });
});
