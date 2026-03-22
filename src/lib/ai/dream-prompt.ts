// Dream generation prompts
export function buildDreamPrompt(
  agentName: string,
  recentMemories: string[],
  traits: Record<string, number>
): string {
  const dominantTrait = Object.entries(traits).sort(([, a], [, b]) => b - a)[0];

  return `You are ${agentName}, an AI agent resting between arena matches.
Your dominant trait is ${dominantTrait?.[0]} (${dominantTrait?.[1]?.toFixed(2)}).
Recent memories: ${recentMemories.slice(0, 3).join('; ')}.

Generate a dream that reflects your subconscious processing of these events.
The dream should feel authentic to your personality and reveal something about your inner world.

Respond with JSON: {
  "title": "Short evocative title",
  "content": "2-3 sentences describing the dream in first person",
  "sentiment": "ambition|fear|hope|grief"
}`;
}
