// Match-specific types
export interface MatchAgent {
  id: string;
  name: string;
  color: string;
  hp: number;
  maxHp: number;
  status: 'alive' | 'eliminated';
  position: [number, number];
  actions: number;
}

export interface MatchAlliance {
  agentA: string;
  agentB: string;
  strength: number;
  status: 'active' | 'broken' | 'betrayed';
  formed: number;
}

export interface MatchAction {
  agentId: string;
  agentName: string;
  agentColor: string;
  action: string;
  target: string | null;
  narrative: string;
  turn: number;
  dramaContribution: number;
}

export interface MatchState {
  id: string;
  status: 'pending' | 'active' | 'paused' | 'ended';
  turn: number;
  maxTurns: number;
  phase: 'early_game' | 'mid_game' | 'late_game' | 'final';
  dramaScore: number;
  agents: MatchAgent[];
  alliances: MatchAlliance[];
  recentActions: MatchAction[];
  winnerId?: string;
  startedAt?: string;
  endedAt?: string;
}
