import type { GameState, GameEvent } from '../types/game-state';

export function calculateDramaScore(gameState: GameState, recentEvents: GameEvent[] = []): number {
  let score = 0;

  // Base score from elimination progress
  const aliveAgents = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
  const totalAgents = Object.keys(gameState.agents).length;
  if (totalAgents > 0) {
    score += (1 - aliveAgents / totalAgents) * 20;
  }

  // Phase multiplier
  const phaseMultipliers: Record<string, number> = {
    COURTSHIP: 0.5, ALLIANCE: 0.8, COMPETITION: 1.2, ELIMINATION: 1.8, FINALE: 2.5,
  };
  score *= phaseMultipliers[gameState.currentPhase] || 1.0;

  // Recent events contribution
  const events = Array.isArray(recentEvents) ? recentEvents : [];
  for (const event of events.slice(-10)) {
    score += event.dramaContribution ?? 0;
  }

  // Also use dramaScore from gameState if available (pre-computed)
  if (typeof gameState.dramaScore === 'number') {
    score = Math.max(score, gameState.dramaScore * 0.5);
  }

  // Low HP agents increase drama
  const lowHpAgents = Object.values(gameState.agents).filter(
    a => !a.isEliminated && a.hp < a.maxHp * 0.3
  ).length;
  score += lowHpAgents * 8;

  // Active hazards
  const hazards = gameState.board?.activeHazards;
  if (Array.isArray(hazards)) {
    score += hazards.length * 5;
  }

  return Math.min(100, Math.max(0, score));
}

export function selectFocusMatch(matches: Array<{ matchId: string; dramaScore: number }>): string | null {
  if (!matches || matches.length === 0) return null;
  return matches.reduce((best, m) => m.dramaScore > best.dramaScore ? m : best).matchId;
}

export function getDramaEventBonus(eventType: string): number {
  const bonuses: Record<string, number> = {
    COMBAT: 30, BETRAYAL: 40, ELIMINATION: 35, ALLIANCE_BROKEN: 25,
    BIG_SCREEN_POST: 15, BRIBE: 20, DEAL_BROKEN: 30, GHOST_JURY_WHISPER: 20,
    TIME_CAPSULE_REVEAL: 25, BUTTERFLY_EFFECT: 50, CHAOS_EVENT: 35, MOLE_REVEALED: 45,
  };
  return bonuses[eventType] || 5;
}
