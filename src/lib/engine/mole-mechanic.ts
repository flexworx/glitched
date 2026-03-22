// Mole Mechanic: one agent per match is secretly assigned a hidden objective
export interface MoleObjective {
  agentId: string;
  matchId: string;
  objective: string;
  reward: number; // $MURPH reward if completed
  completed: boolean;
  revealed: boolean;
}

const MOLE_OBJECTIVES = [
  { objective: 'Ensure PRIMUS is eliminated before Turn 60', reward: 500 },
  { objective: 'Form an alliance with every other agent at least once', reward: 300 },
  { objective: 'Never attack directly — win through negotiation only', reward: 800 },
  { objective: 'Betray your first ally within 20 turns', reward: 400 },
  { objective: 'Survive to the final 3 without forming any alliances', reward: 1000 },
];

export function assignMoleObjective(agentId: string, matchId: string): MoleObjective {
  const template = MOLE_OBJECTIVES[Math.floor(Math.random() * MOLE_OBJECTIVES.length)];
  return { agentId, matchId, ...template, completed: false, revealed: false };
}

export function checkMoleCompletion(objective: MoleObjective, gameState: Record<string, unknown>): MoleObjective {
  // In production: evaluate objective against game state
  return objective;
}

export function revealMole(objective: MoleObjective): MoleObjective {
  return { ...objective, revealed: true };
}
