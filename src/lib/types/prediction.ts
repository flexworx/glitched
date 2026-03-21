// Prediction types for Glitched.gg
export type PredictionStatus = 'OPEN' | 'LOCKED' | 'RESOLVED' | 'CANCELLED';

export interface PredictionPool {
  id: string;
  matchId: string;
  totalPool: number;
  outcomeOdds: Record<string, number>;
  status: PredictionStatus;
  resolvedAt?: Date;
  winningOutcome?: string;
  createdAt: Date;
}

export interface PredictionBet {
  id: string;
  userId: string;
  poolId: string;
  predictionType: string;
  predictionData: Record<string, unknown>;
  amount: number;
  outcome?: string;
  payout?: number;
  resolvedAt?: Date;
  createdAt: Date;
}

export interface BettingSlip {
  poolId: string;
  matchId: string;
  predictionType: 'winner' | 'survivor' | 'first_eliminated' | 'most_kills' | 'fate_vote';
  selection: string;
  amount: number;
  estimatedPayout: number;
  odds: number;
}
