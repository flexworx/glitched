/**
 * Prisoner's Dilemma Game Mode
 *
 * For Trust Fall / Betrayal games.
 * Phases: PAIR -> COMMUNICATE -> CHOOSE -> RESOLVE -> ELIMINATE
 *
 * Agents are paired, communicate, then choose cooperate/defect.
 * Payoffs are resolved and lowest credits at end are eliminated.
 */
import type { GameConfig } from '../template-loader';
import type {
  GameModeHandler,
  GameModeAgent,
  PhaseResult,
} from './index';
import { applyEliminationRule } from './index';

interface Pairing {
  agentA: string;
  agentB: string;
}

class PrisonersDilemmaHandler implements GameModeHandler {
  private agents: GameModeAgent[] = [];
  private config: GameConfig | null = null;
  private pairings: Pairing[] = [];
  private choices: Record<string, 'cooperate' | 'defect'> = {};
  private credits: Record<string, number> = {};

  initialize(agents: GameModeAgent[], config: GameConfig): void {
    this.agents = agents;
    this.config = config;
    this.choices = {};
    this.credits = {};

    for (const agent of agents) {
      this.credits[agent.id] = 0;
    }

    // Create pairings (round-robin style)
    this.pairings = [];
    const ids = agents.map((a) => a.id);
    for (let i = 0; i < ids.length - 1; i += 2) {
      this.pairings.push({ agentA: ids[i], agentB: ids[i + 1] });
    }
    // If odd number, last agent pairs with first
    if (ids.length % 2 !== 0) {
      this.pairings.push({
        agentA: ids[ids.length - 1],
        agentB: ids[0],
      });
    }
  }

  processAgentAction(agentId: string, action: Record<string, unknown>): void {
    const choice = action.choice as 'cooperate' | 'defect' | undefined;
    if (choice) {
      this.choices[agentId] = choice;
    }
  }

  resolveRound(): PhaseResult {
    const config = this.config as Record<string, unknown> | null;
    const creditRewards = (config?.creditRewards as Record<string, unknown>) || {};
    const events: PhaseResult['events'] = [];
    const creditChanges: Record<string, number> = {};

    // Default payoffs
    const cooperateBoth = Number(creditRewards.cooperateBoth ?? 200);
    const betrayWin = Number(creditRewards.betrayWin ?? 500);
    const betrayBothLoss = Number(creditRewards.betrayBothLoss ?? -300);

    // Resolve each pairing
    for (const pair of this.pairings) {
      const choiceA = this.choices[pair.agentA] || 'cooperate';
      const choiceB = this.choices[pair.agentB] || 'cooperate';

      if (choiceA === 'cooperate' && choiceB === 'cooperate') {
        this.credits[pair.agentA] =
          (this.credits[pair.agentA] || 0) + cooperateBoth;
        this.credits[pair.agentB] =
          (this.credits[pair.agentB] || 0) + cooperateBoth;
        creditChanges[pair.agentA] =
          (creditChanges[pair.agentA] || 0) + cooperateBoth;
        creditChanges[pair.agentB] =
          (creditChanges[pair.agentB] || 0) + cooperateBoth;
        events.push({
          type: 'MUTUAL_COOPERATION',
          description: 'Both agents cooperated',
        });
      } else if (choiceA === 'defect' && choiceB === 'cooperate') {
        this.credits[pair.agentA] =
          (this.credits[pair.agentA] || 0) + betrayWin;
        creditChanges[pair.agentA] =
          (creditChanges[pair.agentA] || 0) + betrayWin;
        events.push({
          type: 'BETRAYAL',
          description: 'Agent A betrayed Agent B',
          agentId: String(pair.agentA),
        });
      } else if (choiceA === 'cooperate' && choiceB === 'defect') {
        this.credits[pair.agentB] =
          (this.credits[pair.agentB] || 0) + betrayWin;
        creditChanges[pair.agentB] =
          (creditChanges[pair.agentB] || 0) + betrayWin;
        events.push({
          type: 'BETRAYAL',
          description: 'Agent B betrayed Agent A',
          agentId: String(pair.agentB),
        });
      } else {
        // Both defect
        this.credits[pair.agentA] =
          (this.credits[pair.agentA] || 0) + betrayBothLoss;
        this.credits[pair.agentB] =
          (this.credits[pair.agentB] || 0) + betrayBothLoss;
        creditChanges[pair.agentA] =
          (creditChanges[pair.agentA] || 0) + betrayBothLoss;
        creditChanges[pair.agentB] =
          (creditChanges[pair.agentB] || 0) + betrayBothLoss;
        events.push({
          type: 'MUTUAL_BETRAYAL',
          description: 'Both agents defected',
        });
      }
    }

    // Apply elimination
    const eliminations = config
      ? applyEliminationRule(
          this.credits,
          String(config?.eliminationRule || 'BOTTOM'),
          Number(config?.eliminationCount || 1),
          this.agents.length
        )
      : [];

    for (const id of eliminations) {
      const agent = this.agents.find((a) => a.id === id);
      events.push({
        type: 'ELIMINATED',
        description: `${agent?.name || id} eliminated (lowest credits)`,
        agentId: id,
      });
    }

    return {
      phase: 'PRISONERS_DILEMMA',
      outcomes: {
        pairings: this.pairings,
        choices: { ...this.choices },
        credits: { ...this.credits },
      },
      eliminations,
      creditChanges,
      events,
    };
  }

  checkElimination(
    agentScores: Record<string, number>,
    eliminationRule: string,
    eliminationCount: number | null,
    totalAgents: number
  ): string[] {
    return applyEliminationRule(
      agentScores,
      eliminationRule,
      eliminationCount,
      totalAgents
    );
  }
}

export function createPrisonersDilemmaHandler(): GameModeHandler {
  return new PrisonersDilemmaHandler();
}
