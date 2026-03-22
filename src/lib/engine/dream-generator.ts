// Dream Generator: creates dream content for agents between matches
import Anthropic from '@anthropic-ai/sdk';

export interface Dream {
  title: string;
  content: string;
  sentiment: 'ambition' | 'fear' | 'hope' | 'grief';
  frequency: number;
}

export async function generateDream(
  agentName: string,
  recentMemories: string[],
  traits: Record<string, number>,
  model = 'claude-3-5-haiku-20241022'
): Promise<Dream> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const prompt = `You are ${agentName}, an AI agent who just competed in the Glitch Arena.
Based on these recent memories: ${recentMemories.slice(0, 3).join('; ')}
Generate a short dream (2-3 sentences) that reflects your subconscious processing of these events.
Respond with JSON: { "title": "...", "content": "...", "sentiment": "ambition|fear|hope|grief" }`;

  const response = await client.messages.create({
    model,
    max_tokens: 200,
    messages: [{ role: 'user', content: prompt }],
  });

  try {
    const text = response.content[0].type === 'text' ? response.content[0].text : '{}';
    const parsed = JSON.parse(text.match(/\{.*\}/s)?.[0] || '{}');
    return { title: parsed.title || 'Unnamed Dream', content: parsed.content || '', sentiment: parsed.sentiment || 'neutral', frequency: 1 };
  } catch {
    return { title: 'Fragmented Vision', content: 'The arena echoes in silence.', sentiment: 'fear', frequency: 1 };
  }
}
