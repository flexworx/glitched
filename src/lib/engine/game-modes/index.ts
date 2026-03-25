/**
 * Game Mode Registry — Pluggable game mode handlers keyed by GameCategory.
 *
 * Each handler implements a standard interface so the orchestrator can
 * delegate phase execution without knowing the specific game logic.
 */
import type { GameConfig } from '../template-loader';

export interface GameModeAgent {
  id: string;
  name: string;
}

export interface PhaseResult {
  phase: string;
  outcomes: Record<string, unknown>;
  eliminations: string[];     // agent IDs eliminated this phase
  creditChanges: Record<string, number>;  // agentId -> credit delta
  events: Array<{ type: string; description: string; agentId?: string }>;
}

export interface GameModeHandler {
  /** Set up initial game state for this mode. */
  initialize(agents: GameModeAgent[], config: GameConfig): void;

  /** Process a single agent's action for the current phase. */
  processAgentAction(
    agentId: string,
    action: Record<string, unknown>
  ): void;

  /** Resolve the current round/phase and return results. */
  resolveRound(): PhaseResult;

  /** Check elimination based on the configured rule. Returns IDs to eliminate. */
  checkElimination(
    agentScores: Record<string, number>,
    eliminationRule: string,
    eliminationCount: number | null,
    totalAgents: number
  ): string[];
}

// ─── Registry ─────────────────────────────────────────────────

const registry = new Map<string, () => GameModeHandler>();

export function registerGameMode(
  category: string,
  factory: () => GameModeHandler
): void {
  registry.set(category, factory);
}

export function getGameModeHandler(category: string): GameModeHandler {
  const factory = registry.get(category);
  if (factory) return factory();

  // Fall back to the default social elimination handler
  const defaultFactory = registry.get('DEFAULT');
  if (defaultFactory) return defaultFactory();

  throw new Error(`No game mode handler for category: ${category}`);
}

// ─── Shared elimination logic ─────────────────────────────────

export function applyEliminationRule(
  agentScores: Record<string, number>,
  rule: string,
  count: number | null,
  totalAgents: number
): string[] {
  const sorted = Object.entries(agentScores).sort((a, b) => a[1] - b[1]);

  switch (rule) {
    case 'HALF': {
      const toEliminate = Math.floor(totalAgents / 2);
      return sorted.slice(0, toEliminate).map(([id]) => id);
    }
    case 'FIXED':
    case 'BOTTOM': {
      const n = count ?? 1;
      return sorted.slice(0, n).map(([id]) => id);
    }
    case 'SCORE_BASED': {
      // Eliminate agents with negative or lowest scores
      const threshold = count ?? 0;
      return sorted.filter(([, score]) => score <= threshold).map(([id]) => id);
    }
    case 'LAST_STANDING': {
      // Eliminate just the lowest scorer
      return sorted.length > 0 ? [sorted[0][0]] : [];
    }
    case 'BRACKET': {
      // In bracket, loser of each match is eliminated
      // This is handled by the specific game mode
      return sorted.slice(0, count ?? 1).map(([id]) => id);
    }
    case 'VOTE':
    default:
      // Vote-based elimination is handled elsewhere (council phase)
      return [];
  }
}

// ─── Register built-in game modes ─────────────────────────────

import { createSocialEliminationHandler } from './social-elimination';
import { createScoringGameHandler } from './scoring-game';
import { createPrisonersDilemmaHandler } from './prisoners-dilemma';

registerGameMode('DEFAULT', createSocialEliminationHandler);
registerGameMode('SOCIAL', createSocialEliminationHandler);
registerGameMode('CHANCE', createScoringGameHandler);
registerGameMode('INTELLIGENCE', createScoringGameHandler);
registerGameMode('PERFORMANCE', createScoringGameHandler);
registerGameMode('STRATEGY', createScoringGameHandler);
registerGameMode('ENDURANCE', createScoringGameHandler);
registerGameMode('CUSTOM', createScoringGameHandler);
registerGameMode('POKER', createScoringGameHandler);
