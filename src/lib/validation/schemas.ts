/**
 * RADF v3 — Zod Validation Schemas
 * All API input validation. Routes must validate before calling services.
 */
import { z } from 'zod';

// ─── Auth ────────────────────────────────────────────────────────────────────
export const WalletSignInSchema = z.object({
  walletAddress: z.string().min(32).max(44),
  signature: z.string().min(1),
  message: z.string().min(1),
});

// ─── Agents ──────────────────────────────────────────────────────────────────
export const CreateByoaAgentSchema = z.object({
  name: z.string().min(2).max(32).regex(/^[A-Za-z0-9_\- ]+$/, 'Name must be alphanumeric'),
  archetype: z.string().min(2).max(50),
  backstory: z.string().min(20).max(2000),
  tagline: z.string().max(120).optional(),
  signatureColor: z.string().regex(/^#[0-9A-Fa-f]{6}$/).optional(),
  mbti: z.string().length(4).optional(),
  enneagram: z.string().max(3).optional(),
  traits: z.record(z.string(), z.number().min(0).max(100)).optional(),
  beliefs: z.object({
    tier1Ethics: z.array(z.string()),
    tier2Mantras: z.array(z.string()),
    tier3RoleBeliefs: z.array(z.string()),
  }).optional(),
  skillPackId: z.string().optional(),
  detractorType: z.string().optional(),
});

// ─── Matches ─────────────────────────────────────────────────────────────────
export const CreateMatchSchema = z.object({
  agentIds: z.array(z.string().cuid()).min(2).max(8),
  seasonId: z.string().cuid().optional(),
  arenaId: z.string().optional(),
  maxTurns: z.number().int().min(10).max(200).optional(),
  gameMode: z.enum(['STANDARD_ELIMINATION', 'ALLIANCE_WARS', 'SOLO_SURVIVAL', 'CHAOS_MODE']).optional(),
});

// ─── Predictions ─────────────────────────────────────────────────────────────
export const PlaceBetSchema = z.object({
  matchId: z.string().min(1),
  predictionType: z.enum(['WINNER', 'FIRST_ELIMINATION', 'MOST_DRAMATIC', 'ALLIANCE_SURVIVES', 'BETRAYAL']),
  predictionData: z.record(z.string(), z.unknown()),
  amount: z.number().positive().min(10).max(100000),
});

// ─── Admin ───────────────────────────────────────────────────────────────────
export const AdminMatchActionSchema = z.object({
  action: z.enum(['start', 'stop', 'pause', 'resume']),
  matchId: z.string().min(1),
  reason: z.string().max(500).optional(),
});

export const AdminUpdateUserRoleSchema = z.object({
  userId: z.string().cuid(),
  role: z.enum(['VIEWER', 'USER', 'MODERATOR', 'BYOA_CREATOR', 'ADMIN']),
});

// ─── Engine ──────────────────────────────────────────────────────────────────
export const EngineTurnSchema = z.object({
  matchId: z.string().min(1),
  agentId: z.string().min(1),
  action: z.object({
    type: z.string().min(1),
    targetId: z.string().optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
  }),
});

export const ArbiterValidateSchema = z.object({
  matchId: z.string().min(1),
  agentId: z.string().min(1),
  proposedAction: z.object({
    type: z.string().min(1),
    targetId: z.string().optional(),
    payload: z.record(z.string(), z.unknown()).optional(),
  }),
});

// ─── Checkin ─────────────────────────────────────────────────────────────────
export const CheckinSchema = z.object({
  action: z.literal('checkin'),
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
export function validateOrThrow<T>(schema: z.ZodSchema<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    const messages = result.error.errors.map((e) => `${e.path.join('.')}: ${e.message}`).join('; ');
    throw new ValidationError(messages);
  }
  return result.data;
}

export class ValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ValidationError';
  }
}
