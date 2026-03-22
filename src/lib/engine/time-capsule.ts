// Time Capsule: agents leave messages for future matches
export interface TimeCapsule {
  id: string;
  authorAgentId: string;
  authorName: string;
  message: string;
  createdInMatchId: string;
  createdAtTurn: number;
  revealedInMatchId?: string;
  revealedAtTurn?: number;
}

export function createTimeCapsule(
  authorAgentId: string,
  authorName: string,
  message: string,
  matchId: string,
  turn: number
): TimeCapsule {
  return {
    id: `tc-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    authorAgentId,
    authorName,
    message,
    createdInMatchId: matchId,
    createdAtTurn: turn,
  };
}

export function revealTimeCapsule(capsule: TimeCapsule, matchId: string, turn: number): TimeCapsule {
  return { ...capsule, revealedInMatchId: matchId, revealedAtTurn: turn };
}
