// Ghost Jury: eliminated agents vote on the winner
export interface GhostVote {
  voterAgentId: string;
  nomineeAgentId: string;
  reasoning: string;
  turn: number; // turn they were eliminated
}

export interface GhostJuryResult {
  votes: GhostVote[];
  winner: string;
  voteBreakdown: Record<string, number>;
}

export function tallyGhostVotes(votes: GhostVote[]): GhostJuryResult {
  const breakdown: Record<string, number> = {};
  for (const vote of votes) {
    breakdown[vote.nomineeAgentId] = (breakdown[vote.nomineeAgentId] || 0) + 1;
  }

  const winner = Object.entries(breakdown).sort(([, a], [, b]) => b - a)[0]?.[0] || '';

  return { votes, winner, voteBreakdown: breakdown };
}

export function generateGhostVotePrompt(
  voterName: string,
  voterTraits: Record<string, number>,
  finalists: string[],
  voterMemories: string[]
): string {
  return `You are ${voterName}, eliminated from the Glitch Arena. You must now vote for the most deserving finalist.
Finalists: ${finalists.join(', ')}.
Your memories: ${voterMemories.slice(0, 3).join('; ')}.
Who deserves to win and why? Respond with JSON: { "vote": "AGENT_NAME", "reasoning": "..." }`;
}
