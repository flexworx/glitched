/**
 * Scoring Game Mode
 *
 * For games like The Pitch, Cipher Challenge, Roast Battle.
 * Phases: PROMPT -> SUBMIT -> SCORE -> RANK -> ELIMINATE
 *
 * Agents submit responses to a prompt. Scoring determines rank.
 * Bottom N agents are eliminated based on the elimination rule.
 */
import type { GameConfig } from '../template-loader';
import type {
  GameModeHandler,
  GameModeAgent,
  PhaseResult,
} from './index';
import { applyEliminationRule } from './index';

interface Submission {
  agentId: string;
  response: string;
  submittedAt: number;
}

class ScoringGameHandler implements GameModeHandler {
  private agents: GameModeAgent[] = [];
  private config: GameConfig | null = null;
  private submissions: Submission[] = [];
  private votes: Record<string, Record<string, number>> = {}; // voterId -> { targetId: score }
  private scores: Record<string, number> = {};

  initialize(agents: GameModeAgent[], config: GameConfig): void {
    this.agents = agents;
    this.config = config;
    this.submissions = [];
    this.votes = {};
    this.scores = {};
    for (const agent of agents) {
      this.scores[agent.id] = 0;
    }
  }

  processAgentAction(agentId: string, action: Record<string, unknown>): void {
    const type = action.type as string;

    if (type === 'submit') {
      this.submissions.push({
        agentId,
        response: (action.response as string) || '',
        submittedAt: Date.now(),
      });
    } else if (type === 'vote') {
      const targetScores = action.scores as Record<string, number> | undefined;
      if (targetScores) {
        this.votes[agentId] = targetScores;
      }
    }
  }

  resolveRound(): PhaseResult {
    const config = this.config as Record<string, unknown> | null;
    if (!config) {
      return {
        phase: 'SCORING',
        outcomes: {},
        eliminations: [],
        creditChanges: {},
        events: [],
      };
    }

    const scoringMethod = config?.scoringMethod;
    const creditRewards = (config?.creditRewards as Record<string, unknown>) || {};
    const events: PhaseResult['events'] = [];
    const creditChanges: Record<string, number> = {};

    // Calculate scores based on scoring method
    switch (scoringMethod) {
      case 'VOTE': {
        // Aggregate peer votes
        for (const [, targetScores] of Object.entries(this.votes)) {
          for (const [targetId, score] of Object.entries(targetScores)) {
            this.scores[targetId] = (this.scores[targetId] || 0) + score;
          }
        }
        break;
      }
      case 'SPEED': {
        // Earlier submissions get higher scores
        const sorted = [...this.submissions].sort(
          (a, b) => a.submittedAt - b.submittedAt
        );
        sorted.forEach((sub, idx) => {
          this.scores[sub.agentId] =
            (this.agents.length - idx) * 100;
        });
        break;
      }
      case 'SCORE':
      case 'HYBRID':
      default: {
        // Combine votes and speed
        for (const [, targetScores] of Object.entries(this.votes)) {
          for (const [targetId, score] of Object.entries(targetScores)) {
            this.scores[targetId] = (this.scores[targetId] || 0) + score;
          }
        }
        // Speed bonus for early submissions
        const sorted = [...this.submissions].sort(
          (a, b) => a.submittedAt - b.submittedAt
        );
        sorted.forEach((sub, idx) => {
          this.scores[sub.agentId] =
            (this.scores[sub.agentId] || 0) +
            (this.agents.length - idx) * 10;
        });
        break;
      }
    }

    // Apply elimination rule
    const eliminations = applyEliminationRule(
      this.scores,
      String(config?.eliminationRule || 'BOTTOM'),
      Number(config?.eliminationCount || 1),
      this.agents.length
    );

    // Award credits to survivors
    for (const agent of this.agents) {
      if (!eliminations.includes(agent.id)) {
        creditChanges[agent.id] = Number(creditRewards.survive || 200);
      }
    }

    // Award winner (highest scorer)
    const sortedScores = Object.entries(this.scores).sort(
      (a, b) => b[1] - a[1]
    );
    if (sortedScores.length > 0) {
      const winnerId = String(sortedScores[0][0]);
      creditChanges[winnerId] =
        (creditChanges[winnerId] || 0) + Number(creditRewards.win || 500);
      events.push({
        type: 'GAME_WINNER',
        description: `Agent won the scoring round`,
        agentId: winnerId,
      });
    }

    // Log eliminations
    for (const id of eliminations) {
      const agent = this.agents.find((a) => a.id === id);
      events.push({
        type: 'ELIMINATED',
        description: `${agent?.name || id} eliminated with score ${this.scores[id]}`,
        agentId: id,
      });
    }

    return {
      phase: 'SCORING',
      outcomes: { scores: { ...this.scores }, submissions: this.submissions.length },
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

export function createScoringGameHandler(): GameModeHandler {
  return new ScoringGameHandler();
}
