import Anthropic from '@anthropic-ai/sdk';

export class ARBITER {
  private client: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async validateAction(action: any, gameState: any): Promise<{
    valid: boolean;
    reason?: string;
    penalty?: number;
  }> {
    const prompt = `You are ARBITER, the impartial referee of the Glitch Arena.
Turn: ${gameState.turn}/${gameState.maxTurns}
Proposed Action by ${action.agentId}: ${JSON.stringify(action)}
Validate this action. Respond with JSON: { "valid": boolean, "reason": string, "penalty": number }`;

    try {
      const response = await this.client.messages.create({
        model: this.model,
        max_tokens: 256,
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

  async resolveDispute(context: string): Promise<string> {
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 512,
      messages: [{ role: 'user', content: `You are ARBITER. Resolve this dispute:
${context}
Provide a fair ruling in 2-3 sentences.` }],
    });
    return response.content[0].type === 'text' ? response.content[0].text : 'Ruling: Action stands.';
  }
}
