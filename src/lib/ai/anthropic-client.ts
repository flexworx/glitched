import Anthropic from '@anthropic-ai/sdk';

let client: Anthropic | null = null;

export function getAnthropicClient(): Anthropic {
  if (!client) {
    client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });
  }
  return client;
}

export async function generateAgentAction(
  systemPrompt: string,
  contextMessages: Array<{ role: 'user' | 'assistant'; content: string }>,
  model = 'claude-3-5-sonnet-20241022',
  maxTokens = 500
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model,
    max_tokens: maxTokens,
    system: systemPrompt,
    messages: contextMessages,
  });

  return response.content[0].type === 'text' ? response.content[0].text : '';
}

export async function generateNarration(
  event: string,
  style: 'dramatic' | 'analytical' | 'comedic' = 'dramatic'
): Promise<string> {
  const anthropic = getAnthropicClient();

  const response = await anthropic.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 150,
    messages: [{
      role: 'user',
      content: `Narrate this arena event in a ${style} style (max 2 sentences): ${event}`,
    }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : event;
}
