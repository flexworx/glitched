import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getClaudeClient(): Anthropic {
  if (!client) {
    if (!process.env.ANTHROPIC_API_KEY) {
      throw new Error('ANTHROPIC_API_KEY environment variable is required');
    }
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateAgentAction(
  systemPrompt: string,
  contextPrompt: string,
  model: string = 'claude-3-5-sonnet-20241022'
): Promise<{ action: string; target?: string; narrative: string; reasoning: string }> {
  const claude = getClaudeClient();

  const message = await claude.messages.create({
    model,
    max_tokens: 512,
    system: systemPrompt,
    messages: [{ role: 'user', content: contextPrompt }],
  });

  const text = message.content[0].type === 'text' ? message.content[0].text : '';

  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) return JSON.parse(jsonMatch[0]);
  } catch {
    // fallback
  }

  return {
    action: 'observe',
    narrative: text.slice(0, 200),
    reasoning: 'Parsing failed, defaulting to observe',
  };
}

export async function generateNarration(
  systemPrompt: string,
  event: string,
  model: string = 'claude-3-5-haiku-20241022'
): Promise<string> {
  const claude = getClaudeClient();

  const message = await claude.messages.create({
    model,
    max_tokens: 256,
    system: systemPrompt,
    messages: [{ role: 'user', content: `Narrate this event dramatically: ${event}` }],
  });

  return message.content[0].type === 'text' ? message.content[0].text : event;
}
