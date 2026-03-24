import { SOUL_FORGE_SYSTEM_PROMPT } from '../../../src/lib/soul-forge/system-prompt';

describe('SOUL_FORGE_SYSTEM_PROMPT', () => {
  it('is a non-empty string', () => {
    expect(typeof SOUL_FORGE_SYSTEM_PROMPT).toBe('string');
    expect(SOUL_FORGE_SYSTEM_PROMPT.length).toBeGreaterThan(0);
  });

  it('contains "SOUL FORGE" reference', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT.toLowerCase()).toContain('soul forge');
  });

  it('references 0-100 trait range', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('0-100');
  });

  it('references JSON output format', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('JSON');
  });

  it('contains all required JSON schema fields: name, tagline, traits, mbti, enneagram, disc', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('name');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('tagline');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('traits');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('mbti');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('enneagram');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('disc');
  });

  it('contains the 31 trait codes in the schema', () => {
    const traitCodes = [
      '"O"', '"C"', '"E"', '"A"', '"N"',
      '"HH"', '"EM"', '"HE"', '"FORGIVENESS"',
      '"HC"', '"HO"', '"FORMALITY"', '"DIRECTNESS"',
      '"HUMOR"', '"EMPATHY"', '"DECISION_SPEED"',
      '"RISK_TOLERANCE"', '"DATA_RELIANCE"', '"INTUITION"',
      '"COLLABORATIVENESS"', '"ASSERTIVENESS"', '"CREATIVITY"',
      '"DETAIL"', '"RESILIENCE"', '"ADAPTABILITY"',
      '"INDEPENDENCE"', '"TRUST"', '"PERFECTIONISM"',
      '"URGENCY"', '"LOYALTY"', '"STRATEGIC"',
    ];
    for (const code of traitCodes) {
      expect(SOUL_FORGE_SYSTEM_PROMPT).toContain(code);
    }
  });

  it('contains critical rules section', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('CRITICAL RULES');
  });

  it('mentions social strategy game context', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('social strategy');
  });

  it('contains arena style and strengths/weaknesses fields', () => {
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('arena_style');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('strengths');
    expect(SOUL_FORGE_SYSTEM_PROMPT).toContain('weaknesses');
  });

  it('does NOT wrap the entire prompt in markdown code fences', () => {
    // The prompt itself is a raw string, not wrapped in triple backticks
    // (internal backticks for the JSON example are fine)
    expect(SOUL_FORGE_SYSTEM_PROMPT.startsWith('```')).toBe(false);
    expect(SOUL_FORGE_SYSTEM_PROMPT.endsWith('```')).toBe(false);
  });
});
