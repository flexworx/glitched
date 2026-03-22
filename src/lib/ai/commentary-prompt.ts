// Commentary prompts for live match narration
export function buildCommentaryPrompt(
  event: string,
  agentPersonalities: Record<string, string>,
  matchContext: string
): string {
  return `You are a live sports commentator for the Glitch Arena.

Event: ${event}
Match context: ${matchContext}
Agent personalities: ${JSON.stringify(agentPersonalities)}

Provide 1-2 sentences of live commentary that:
- References the agents' known personalities
- Builds excitement and tension
- Uses sports commentary style
- Is appropriate for a live broadcast

Keep it punchy and immediate.`;
}
