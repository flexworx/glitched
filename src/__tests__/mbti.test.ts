/**
 * RADF v3 — MBTI Derivation Tests
 */
import { describe, it, expect } from 'vitest';
import { deriveMBTI } from '@/lib/creator/mbti';

describe('deriveMBTI', () => {
  it('returns a valid 4-letter MBTI type', () => {
    const traits = { extraversion: 50, openness: 50, agreeableness: 50, conscientiousness: 50 };
    const result = deriveMBTI(traits);
    expect(result.type).toHaveLength(4);
    expect(['I', 'E']).toContain(result.type[0]);
    expect(['N', 'S']).toContain(result.type[1]);
    expect(['F', 'T']).toContain(result.type[2]);
    expect(['J', 'P']).toContain(result.type[3]);
  });

  it('derives INTJ for high introversion, intuition, thinking, judging', () => {
    // Low extraversion = I, high openness = N, low agreeableness = T, high conscientiousness = J
    const traits = {
      extraversion: 10,
      openness: 90,
      pattern_recognition: 90,
      creativity: 90,
      agreeableness: 10,
      empathy: 10,
      conscientiousness: 90,
      planning_horizon: 90,
    };
    const result = deriveMBTI(traits);
    expect(result.type).toBe('INTJ');
    expect(result.E_I).toBe('I');
    expect(result.S_N).toBe('N');
    expect(result.T_F).toBe('T');
    expect(result.J_P).toBe('J');
  });

  it('derives ESFP for high extraversion, sensing, feeling, perceiving', () => {
    const traits = {
      extraversion: 90,
      openness: 10,
      pattern_recognition: 10,
      creativity: 10,
      agreeableness: 90,
      empathy: 90,
      conscientiousness: 10,
      planning_horizon: 10,
    };
    const result = deriveMBTI(traits);
    expect(result.type).toBe('ESFP');
  });

  it('returns a label and description', () => {
    const traits = { extraversion: 10, openness: 90, agreeableness: 10, conscientiousness: 90 };
    const result = deriveMBTI(traits);
    expect(result.label).toBeTruthy();
    expect(result.description).toBeTruthy();
  });

  it('handles missing traits gracefully by defaulting to 50', () => {
    const result = deriveMBTI({});
    expect(result.type).toHaveLength(4);
  });
});
