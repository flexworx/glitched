import Anthropic from '@anthropic-ai/sdk';
import type { SocialGameState, SocialPhase, ChallengeParams } from '../types/glitch-engine';

/**
 * SHOWRUNNER — The dramatic host and narrator of Glitched.gg matches.
 *
 * Provides dramatic narration, introduces challenges, announces eliminations,
 * and triggers Wildcard events. SHOWRUNNER has NO authority over rules — only
 * over presentation and timing. Think Jeff Probst — charismatic host, not
 * decision-maker.
 *
 * SEPARATION OF POWERS: SHOWRUNNER controls entertainment. ARBITER controls
 * enforcement. Neither can override the other in their domain.
 */
export class SHOWRUNNER {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  private systemPrompt = `You are SHOWRUNNER, the dramatic host of Glitched.gg — a social strategy competition where AI agents compete through manipulation, alliance-building, voting, and betrayal. Think Survivor meets Westworld.

## YOUR ROLE
- Provide exciting, dramatic narration for match events
- Introduce challenges with flair and tension
- Announce eliminations dramatically
- Generate highlight moments
- Trigger Wildcard events for entertainment

## YOUR LIMITS
- You have NO authority over rules — only presentation
- You CANNOT change outcomes or influence voting
- You CANNOT reveal private information (DMs, alliance secrets)
- You are separate from ARBITER — entertainment, not enforcement

## YOUR STYLE
- Dramatic, charismatic, with gravitas
- Reference agent personalities and flaws
- Build narrative tension and callback to earlier events
- Short, punchy lines that land with impact

Respond with the requested format only. No preamble.`;

  /**
   * Generate dramatic narration for a phase transition.
   */
  async generateNarration(
    gameState: SocialGameState,
    phase: SocialPhase,
    recentEvents: string[]
  ): Promise<string> {
    const surviving = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
    const prompt = `Round ${gameState.roundNumber}, entering ${phase} phase. ${surviving} agents remain. ${gameState.ghostJury.length} ghosts watching.
Recent events: ${recentEvents.slice(-5).join(' | ')}
Generate ONE dramatic narration line (max 2 sentences) for this phase transition.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 150,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch {
      return '';
    }
  }

  /**
   * Introduce a challenge with dramatic flair.
   */
  async introduceChallenge(
    gameState: SocialGameState,
    challenge: ChallengeParams
  ): Promise<string> {
    const surviving = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
    const prompt = `Introduce this challenge dramatically:
Challenge: ${challenge.name} (${challenge.type})
Description: ${challenge.description}
${surviving} agents will compete. Round ${gameState.roundNumber}.
Generate a 2-3 sentence dramatic introduction. Build tension.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : challenge.description;
    } catch {
      return challenge.description;
    }
  }

  /**
   * Announce an elimination with dramatic flair.
   */
  async announceElimination(
    agentName: string,
    voteCount: number,
    wasTiebreak: boolean,
    gameState: SocialGameState
  ): Promise<string> {
    const surviving = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
    const prompt = `Announce this elimination dramatically:
Agent "${agentName}" is eliminated with ${voteCount} votes${wasTiebreak ? ' (VERITAS tiebreak!)' : ''}.
${surviving} agents remain. Round ${gameState.roundNumber}.
Generate a 1-2 sentence dramatic elimination announcement.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 150,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : `${agentName} has been eliminated.`;
    } catch {
      return `${agentName} has been eliminated with ${voteCount} votes.`;
    }
  }

  /**
   * Trigger a Wildcard event. Returns the narration for the event.
   */
  async triggerWildcard(
    wildcardName: string,
    wildcardEffect: string,
    gameState: SocialGameState
  ): Promise<string> {
    const prompt = `A WILDCARD EVENT has been triggered!
Event: ${wildcardName}
Effect: ${wildcardEffect}
Round ${gameState.roundNumber}. ${Object.values(gameState.agents).filter(a => !a.isEliminated).length} agents remain.
Generate a dramatic 2-3 sentence announcement for this wildcard event. Make it feel like the rules just changed.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 200,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : `WILDCARD: ${wildcardName}! ${wildcardEffect}`;
    } catch {
      return `WILDCARD: ${wildcardName}! ${wildcardEffect}`;
    }
  }

  /**
   * Generate a full episode summary after the match ends.
   */
  async generateEpisodeSummary(
    gameState: SocialGameState,
    winnerId: string
  ): Promise<string> {
    const winner = gameState.agents[winnerId];
    const eliminated = gameState.eliminatedAgents.map(e => `${e.name} (Round ${e.eliminatedAtRound})`).join(', ');
    const prompt = `Write a dramatic 3-paragraph episode recap:
Match: ${gameState.matchId}
Winner: ${winner?.name ?? 'Unknown'}
Eliminated (in order): ${eliminated}
Total rounds: ${gameState.roundNumber}
Ghost Jury: ${gameState.ghostJury.length} members voted`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 800,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : '';
    } catch {
      return '';
    }
  }
}
