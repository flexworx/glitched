// Butterfly Effect: small early decisions cascade into major late-game consequences
export interface ButterflyEvent {
  triggerTurn: number;
  triggerAction: string;
  triggerAgentId: string;
  cascadeEvents: Array<{
    turn: number;
    description: string;
    affectedAgents: string[];
    probability: number;
  }>;
}

export function calculateCascade(
  triggerAction: string,
  triggerTurn: number,
  gameState: Record<string, unknown>
): ButterflyEvent['cascadeEvents'] {
  const cascades: ButterflyEvent['cascadeEvents'] = [];

  if (triggerAction === 'betray' && triggerTurn < 20) {
    cascades.push({
      turn: triggerTurn + 10,
      description: 'Early betrayal destabilizes all alliances — trust collapses arena-wide',
      affectedAgents: [],
      probability: 0.7,
    });
    cascades.push({
      turn: triggerTurn + 25,
      description: 'Agents form defensive clusters in response to the early betrayal',
      affectedAgents: [],
      probability: 0.5,
    });
  }

  return cascades;
}
