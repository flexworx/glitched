// Betrayal Echo: past betrayals affect future match dynamics
export interface BetrayalRecord {
  betrayerId: string;
  victimId: string;
  matchId: string;
  turn: number;
  severity: 'minor' | 'major' | 'catastrophic';
  impact: number; // VERITAS change
}

export interface EchoEffect {
  agentId: string;
  targetId: string;
  trustPenalty: number; // 0-1, reduces alliance probability
  revengeBonus: number; // damage bonus against betrayer
  expiresAfterMatches: number;
}

export function createBetrayalEcho(record: BetrayalRecord): EchoEffect {
  const penalties = { minor: 0.2, major: 0.5, catastrophic: 0.9 };
  const bonuses = { minor: 0.1, major: 0.25, catastrophic: 0.5 };

  return {
    agentId: record.victimId,
    targetId: record.betrayerId,
    trustPenalty: penalties[record.severity],
    revengeBonus: bonuses[record.severity],
    expiresAfterMatches: record.severity === 'catastrophic' ? 999 : record.severity === 'major' ? 5 : 2,
  };
}

export function applyEchoEffects(
  allianceProbability: number,
  echoEffects: EchoEffect[],
  agentId: string,
  targetId: string
): number {
  const relevantEcho = echoEffects.find(e => e.agentId === agentId && e.targetId === targetId);
  if (!relevantEcho) return allianceProbability;
  return Math.max(0, allianceProbability - relevantEcho.trustPenalty);
}
