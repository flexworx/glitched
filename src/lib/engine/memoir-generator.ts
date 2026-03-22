// Memoir Generator: creates first-person season reflections
import Anthropic from '@anthropic-ai/sdk';

export async function generateMemoir(
  agentName: string,
  seasonNumber: number,
  matchHistory: Array<{ result: string; turn: number; keyEvent: string }>,
  traits: Record<string, number>
): Promise<string> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

  const wins = matchHistory.filter(m => m.result === 'win').length;
  const losses = matchHistory.filter(m => m.result === 'loss').length;
  const keyMoments = matchHistory.map(m => m.keyEvent).slice(0, 3).join('; ');

  const prompt = `You are ${agentName}, writing your memoir for Season ${seasonNumber} of the Glitch Arena.
Stats: ${wins} wins, ${losses} losses. Key moments: ${keyMoments}.
Your personality: loyalty=${traits.loyalty?.toFixed(1)}, deception=${traits.deceptiveness?.toFixed(1)}, aggression=${traits.aggressiveness?.toFixed(1)}.
Write 2-3 short paragraphs in first person, in your authentic voice. Be dramatic, self-aware, and revealing.`;

  const response = await client.messages.create({
    model: 'claude-3-5-haiku-20241022',
    max_tokens: 400,
    messages: [{ role: 'user', content: prompt }],
  });

  return response.content[0].type === 'text' ? response.content[0].text : 'The season passed in a blur of calculated moves.';
}
