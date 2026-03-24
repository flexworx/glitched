import Anthropic from '@anthropic-ai/sdk';
import type { SocialGameState, AgentDecision } from '../types/glitch-engine';

/**
 * ARBITER — The impartial referee of the Glitch Arena.
 *
 * Validates all agent actions, detects collusion patterns, and imposes penalties.
 * Has God-view access to all channels, alliances, and VERITAS data.
 * ARBITER's decisions are final and cannot be appealed.
 * ARBITER never influences strategy — only enforces rules.
 */
export class ARBITER {
  private client: Anthropic;
  private model = 'claude-sonnet-4-20250514';

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  private systemPrompt = `You are ARBITER, the impartial referee of Glitched.gg social strategy matches.

## YOUR ROLE
- Validate agent actions against match rules
- Detect collusion patterns (agents coordinating outside game channels)
- Impose VERITAS penalties for rule violations
- Resolve edge cases and disputes
- You have GOD-VIEW: access to ALL channels, ALL alliances, ALL VERITAS data

## RULES YOU ENFORCE
- Agents may only take actions allowed in the current phase
- Self-votes are illegal
- Agents cannot target eliminated agents (except for lobby)
- Alliance size max: 4 members
- Agents can only be in 1 alliance (unless they have Double Agent skill)
- Skill usage requires remaining charges
- No breaking the fourth wall or revealing real-world info

## YOUR LIMITS
- You NEVER influence strategy — only enforce rules
- You NEVER modify outcomes for entertainment
- You are separate from SHOWRUNNER — enforcement, not entertainment
- Your rulings are final

Respond with ONLY valid JSON.`;

  /**
   * Validate an agent's proposed action against game rules.
   * Called before action resolution — only for flagged suspicious patterns.
   */
  async validateAction(
    agentId: string,
    decision: AgentDecision,
    gameState: SocialGameState
  ): Promise<{ valid: boolean; reason?: string; penalty?: number }> {
    const surviving = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
    const prompt = `Round ${gameState.roundNumber}, Phase: ${gameState.phase}, ${surviving} agents alive.
Agent "${gameState.agents[agentId]?.name}" (${agentId}) proposes:
Action: ${decision.action.type}, Target: ${decision.action.target ?? 'none'}
Parameters: ${JSON.stringify(decision.action.parameters ?? {})}

Validate this action. Respond with JSON: { "valid": boolean, "reason": "explanation", "penalty": 0 }
Penalty is a VERITAS deduction (0-500) for rule violations.`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 256,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      const match = text.match(/\{[\s\S]*?\}/);
      const result = match ? JSON.parse(match[0]) : {};
      return { valid: result.valid ?? true, reason: result.reason, penalty: result.penalty || 0 };
    } catch {
      return { valid: true };
    }
  }

  /**
   * Detect collusion patterns by analyzing voting history and DM patterns.
   * Returns agent IDs suspected of collusion.
   */
  async detectCollusion(
    gameState: SocialGameState
  ): Promise<{ suspects: string[]; evidence: string }> {
    const votingHistory = gameState.recentEvents
      .filter(e => e.includes('vote') || e.includes('eliminated'))
      .slice(-20);
    const dmCount: Record<string, number> = {};
    for (const msg of gameState.recentMessages.filter(m => m.channel === 'dm')) {
      const pair = [msg.from, msg.toAgentId].sort().join('-');
      dmCount[pair] = (dmCount[pair] || 0) + 1;
    }

    const prompt = `Analyze for collusion patterns:
Recent events: ${votingHistory.join(' | ')}
DM frequency (agent pairs): ${JSON.stringify(dmCount)}
Alliance map: ${gameState.alliances.map(a => `${a.name}: [${a.members.join(',')}]`).join('; ')}

Are any agents suspiciously coordinating? Respond with JSON:
{ "suspects": ["agent_id1", "agent_id2"], "evidence": "brief explanation" }
If no collusion detected, return { "suspects": [], "evidence": "No suspicious patterns" }`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 256,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: prompt }],
      });
      const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
      const match = text.match(/\{[\s\S]*?\}/);
      const result = match ? JSON.parse(match[0]) : {};
      return { suspects: result.suspects ?? [], evidence: result.evidence ?? '' };
    } catch {
      return { suspects: [], evidence: 'Collusion check failed' };
    }
  }

  /**
   * Impose a VERITAS penalty on an agent for a rule violation.
   */
  imposePenalty(agentId: string, amount: number, reason: string): {
    agentId: string;
    penalty: number;
    reason: string;
  } {
    return { agentId, penalty: Math.abs(amount), reason };
  }

  /**
   * Resolve a dispute between agents.
   */
  async resolveDispute(context: string): Promise<string> {
    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 512,
        system: this.systemPrompt,
        messages: [{ role: 'user', content: `Resolve this dispute:\n${context}\nProvide a fair ruling in 2-3 sentences.` }],
      });
      return response.content[0].type === 'text' ? response.content[0].text : 'Ruling: Action stands.';
    } catch {
      return 'Ruling: Action stands. ARBITER could not process the dispute.';
    }
  }
}
