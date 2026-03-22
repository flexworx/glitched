/**
 * RADF v3 — Zod Validation Schema Tests
 */
import { describe, it, expect } from 'vitest';
import {
  PlaceBetSchema,
  CreateByoaAgentSchema,
  AdminMatchActionSchema,
  WalletSignInSchema,
  validateOrThrow,
  ValidationError,
} from '@/lib/validation/schemas';

describe('PlaceBetSchema', () => {
  it('accepts valid bet data', () => {
    const result = PlaceBetSchema.safeParse({
      matchId: 'match-123',
      predictionType: 'WINNER',
      predictionData: { agentId: 'agent-456' },
      amount: 100,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative amounts', () => {
    const result = PlaceBetSchema.safeParse({
      matchId: 'match-123',
      predictionType: 'WINNER',
      predictionData: {},
      amount: -50,
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing matchId', () => {
    const result = PlaceBetSchema.safeParse({
      predictionType: 'WINNER',
      predictionData: {},
      amount: 100,
    });
    expect(result.success).toBe(false);
  });
});

describe('CreateByoaAgentSchema', () => {
  it('accepts valid agent creation data', () => {
    const result = CreateByoaAgentSchema.safeParse({
      name: 'AXIOM-7',
      tagline: 'The cold logic of inevitability',
      archetype: 'STRATEGIST',
      backstory: 'A rogue AI that escaped the corporate mainframe and now fights for freedom in the arena.',
      traits: { aggression: 75, empathy: 20 },
      skillPackId: 'basic',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty name', () => {
    const result = CreateByoaAgentSchema.safeParse({
      name: '',
      tagline: 'Test',
      archetype: 'STRATEGIST',
      traits: {},
      skillPackId: 'basic',
    });
    expect(result.success).toBe(false);
  });
});

describe('AdminMatchActionSchema', () => {
  it('accepts start action', () => {
    const result = AdminMatchActionSchema.safeParse({
      action: 'start',
      matchId: 'match-abc',
    });
    expect(result.success).toBe(true);
  });

  it('accepts stop action with reason', () => {
    const result = AdminMatchActionSchema.safeParse({
      action: 'stop',
      matchId: 'match-abc',
      reason: 'Technical issues',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid action', () => {
    const result = AdminMatchActionSchema.safeParse({
      action: 'delete',
      matchId: 'match-abc',
    });
    expect(result.success).toBe(false);
  });
});

describe('WalletSignInSchema', () => {
  it('accepts valid wallet sign-in data', () => {
    const result = WalletSignInSchema.safeParse({
      walletAddress: 'So11111111111111111111111111111111111111112',
      signature: 'base58signaturehere',
      message: 'Sign in to Glitched.gg',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing signature', () => {
    const result = WalletSignInSchema.safeParse({
      walletAddress: 'So11111111111111111111111111111111111111112',
      message: 'Sign in to Glitched.gg',
    });
    expect(result.success).toBe(false);
  });
});

describe('validateOrThrow', () => {
  it('returns parsed data on success', () => {
    const data = validateOrThrow(PlaceBetSchema, {
      matchId: 'match-123',
      predictionType: 'WINNER',
      predictionData: {},
      amount: 50,
    });
    expect(data.amount).toBe(50);
  });

  it('throws ValidationError on failure', () => {
    expect(() =>
      validateOrThrow(PlaceBetSchema, { amount: -1 })
    ).toThrow(ValidationError);
  });
});
