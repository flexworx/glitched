// Helper types that mirror the Prisma schema for use in frontend

export type MatchStatus = 'pending' | 'active' | 'paused' | 'ended';
export type AgentStatus = 'alive' | 'eliminated';
export type PredictionStatus = 'open' | 'closed' | 'settled';
export type UserRole = 'user' | 'creator' | 'admin';

export interface SerializedMatch {
  id: string;
  status: MatchStatus;
  currentTurn: number;
  maxTurns: number;
  dramaScore: number;
  seasonId?: string;
  createdAt: string;
  startedAt?: string;
  endedAt?: string;
  winnerId?: string;
}

export interface SerializedAgent {
  id: string;
  name: string;
  archetype: string;
  color: string;
  mbti: string;
  enneagram: string;
  bio: string;
  veritasScore: number;
  wins: number;
  losses: number;
  isActive: boolean;
  type: 'pantheon' | 'byoa';
}
