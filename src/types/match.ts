// ============================================================
// GLITCHED.GG — Match & Game State Type Definitions
// ============================================================

export type MatchPhase =
  | 'lobby'
  | 'preparation'
  | 'competition'
  | 'finale'
  | 'completed';

export type MatchStatus = 'scheduled' | 'live' | 'completed' | 'cancelled';

export type TileType =
  | 'plains'
  | 'forest'
  | 'mountain'
  | 'water'
  | 'fortress'
  | 'ruins'
  | 'void';

export interface BoardTile {
  x: number;
  y: number;
  type: TileType;
  elevation: number;
  isVisible: boolean;
  occupiedBy: string | null;
  hazardLevel: number;
  resourceValue: number;
}

export interface MatchAgent {
  id: string;
  name: string;
  avatarUrl: string;
  hp: number;
  maxHp: number;
  position: { x: number; y: number };
  status: 'alive' | 'eliminated' | 'ghost';
  veritasScore: number;
  resources: number;
  alliances: string[];
  lastAction: string;
  emotionState: string;
  dramaContribution: number;
}

export interface MatchEvent {
  id: string;
  turn: number;
  type:
    | 'combat'
    | 'alliance'
    | 'betrayal'
    | 'elimination'
    | 'resource'
    | 'big_screen'
    | 'chaos'
    | 'dialogue';
  agentIds: string[];
  description: string;
  dramaScore: number;
  timestamp: string;
}

export interface MatchState {
  matchId: string;
  season: number;
  matchNumber: number;
  phase: MatchPhase;
  status: MatchStatus;
  turn: number;
  maxTurns: number;
  agents: MatchAgent[];
  board: {
    width: number;
    height: number;
    tiles: BoardTile[];
    activeHazards: string[];
  };
  events: MatchEvent[];
  dramaScore: number;
  startedAt: string;
  endedAt?: string;
  winnerId?: string;
}

export interface PredictionMarket {
  id: string;
  matchId: string;
  type: 'winner' | 'first_elimination' | 'most_betrayals' | 'highest_veritas';
  question: string;
  options: PredictionOption[];
  totalPool: number;
  closesAt: string;
  status: 'open' | 'closed' | 'resolved';
  resolvedOptionId?: string;
}

export interface PredictionOption {
  id: string;
  label: string;
  agentId?: string;
  odds: number;
  totalStaked: number;
  percentage: number;
}

export interface UserPrediction {
  id: string;
  marketId: string;
  optionId: string;
  stakeAmount: number;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'refunded';
  placedAt: string;
  resolvedAt?: string;
  payout?: number;
}
