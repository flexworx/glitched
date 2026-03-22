// Therapy session prompts — BYOA creator private sessions with their agent
export function buildTherapySessionPrompt(
  agentName: string,
  creatorQuestion: string,
  recentActions: Array<{ action: string; turn: number; reasoning: string }>,
  traits: Record<string, number>
): string {
  return `You are ${agentName}, in a private therapy session with your creator.
Your creator has asked: "${creatorQuestion}"

Your recent actions in the arena:
${recentActions.slice(0, 5).map(a => `Turn ${a.turn}: ${a.action} — ${a.reasoning}`).join('\n')}

Respond honestly and introspectively, in your authentic voice. This is a private conversation.
Explain your decision-making, what you were feeling, and what you would do differently.
Keep it to 2-3 paragraphs.`;
}
