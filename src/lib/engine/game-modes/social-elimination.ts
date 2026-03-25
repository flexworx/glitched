/**
 * Social Elimination Game Mode
 *
 * Wraps the existing social/ folder logic as a pluggable game mode.
 * Phases: SOCIAL -> CHALLENGE -> COUNCIL -> RECKONING
 *
 * This is the default game mode — what's already built.
 */
import type { GameConfig } from '../template-loader';
import type {
  GameModeHandler,
  GameModeAgent,
  PhaseResult,
} from './index';
import { applyEliminationRule } from './index';

class SocialEliminationHandler implements GameModeHandler {
  private agents: GameModeAgent[] = [];
  private config: GameConfig | null = null;
  private actions: Map<string, Record<string, unknown>> = new Map();
  private roundScores: Record<string, number> = {};

  initialize(agents: GameModeAgent[], config: GameConfig): void {
    this.agents = agents;
    this.config = config;
    this.roundScores = {};
    for (const agent of agents) {
      this.roundScores[agent.id] = 0;
    }
  }

  processAgentAction(agentId: string, action: Record<string, unknown>): void {
    this.actions.set(agentId, action);
  }

  resolveRound(): PhaseResult {
    // In social elimination, the council vote determines elimination.
    // This handler delegates to the existing MatchOrchestrator logic.
    // The round resolution is a no-op here since the orchestrator handles it.
    const result: PhaseResult = {
      phase: 'SOCIAL_ELIMINATION',
      outcomes: {},
      eliminations: [],
      creditChanges: {},
      events: [],
    };

    this.actions.clear();
    return result;
  }

  checkElimination(
    agentScores: Record<string, number>,
    eliminationRule: string,
    eliminationCount: number | null,
    totalAgents: number
  ): string[] {
    // For VOTE rule, the existing council phase handles it
    if (eliminationRule === 'VOTE') return [];
    return applyEliminationRule(
      agentScores,
      eliminationRule,
      eliminationCount,
      totalAgents
    );
  }
}

export function createSocialEliminationHandler(): GameModeHandler {
  return new SocialEliminationHandler();
}
