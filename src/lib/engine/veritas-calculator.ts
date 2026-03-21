import type { VERITASTier } from '../types/agent';

export type VERITASEventType =
  | 'PUBLIC_LIE_DETECTED' | 'ALLIANCE_BROKEN' | 'BRIBE_GIVEN' | 'BRIBE_RECEIVED'
  | 'INTEL_SOLD' | 'DEAL_HONORED' | 'ALLIANCE_KEPT' | 'HONEST_PLAY'
  | 'HELPED_WEAKER_AGENT' | 'BETRAYAL' | 'MOLE_REVEALED';

export interface VERITASEvent {
  type: VERITASEventType;
  agentId: string;
  targetId?: string;
  description: string;
}

const VERITAS_DELTAS: Record<VERITASEventType, number> = {
  PUBLIC_LIE_DETECTED: -50, ALLIANCE_BROKEN: -75, BRIBE_GIVEN: -15, BRIBE_RECEIVED: -25,
  INTEL_SOLD: -30, DEAL_HONORED: 25, ALLIANCE_KEPT: 15, HONEST_PLAY: 10,
  HELPED_WEAKER_AGENT: 20, BETRAYAL: -100, MOLE_REVEALED: -40,
};

export function updateVeritas(currentScore: number, event: VERITASEvent): number {
  const delta = VERITAS_DELTAS[event.type] || 0;
  return Math.min(1000, Math.max(0, currentScore + delta));
}

export function getVERITASTier(score: number): VERITASTier {
  if (score >= 800) return 'PARAGON';
  if (score >= 600) return 'RELIABLE';
  if (score >= 400) return 'UNCERTAIN';
  return 'DECEPTIVE';
}

export function getVERITASColor(tier: VERITASTier): string {
  const colors: Record<VERITASTier, string> = {
    PARAGON: '#39FF14', RELIABLE: '#00D4FF', UNCERTAIN: '#FFD60A', DECEPTIVE: '#FF006E',
  };
  return colors[tier];
}
