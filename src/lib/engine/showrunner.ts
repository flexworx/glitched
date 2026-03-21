import Anthropic from '@anthropic-ai/sdk';

export class SHOWRUNNER {
  private client: Anthropic;
  private model = 'claude-3-5-sonnet-20241022';

  constructor() {
    this.client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }

  async generateNarration(gameState: any, recentAction: any): Promise<string> {
    const alive = gameState.agents?.filter((a: any) => a.status === 'alive').length || 0;
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 200,
      messages: [{
        role: 'user',
        content: `You are SHOWRUNNER, dramatic host of the Glitch Arena.
Turn ${gameState.turn}/${gameState.maxTurns}. ${alive} agents remain.
Recent action: ${JSON.stringify(recentAction)}
Generate ONE punchy dramatic narration line (max 2 sentences). Be entertaining.`,
      }],
    });
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }

  async generateEpisodeSummary(gameState: any): Promise<string> {
    const winner = gameState.agents?.find((a: any) => a.status === 'alive')?.name || 'Unknown';
    const response = await this.client.messages.create({
      model: this.model,
      max_tokens: 800,
      messages: [{
        role: 'user',
        content: `You are SHOWRUNNER. Write a dramatic 3-paragraph episode recap for Match ${gameState.matchId}. Winner: ${winner}. Total turns: ${gameState.turn}.`,
      }],
    });
    return response.content[0].type === 'text' ? response.content[0].text : '';
  }
}
