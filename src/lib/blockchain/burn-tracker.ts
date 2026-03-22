// Burn Tracker: tracks all $MURPH burn events
export interface BurnEvent {
  id: string;
  amount: number;
  source: 'match_completion' | 'prediction_fee' | 'byoa_submission' | 'alliance_formation' | 'manual';
  matchId?: string;
  txHash?: string;
  timestamp: string;
}

export interface BurnStats {
  totalBurned: number;
  dailyBurn: number;
  weeklyBurn: number;
  burnRate: number; // tokens per hour
  percentBurned: number; // of total supply
}

export function calculateBurnStats(events: BurnEvent[]): BurnStats {
  const totalBurned = events.reduce((sum, e) => sum + e.amount, 0);
  const now = Date.now();
  const dayAgo = now - 24 * 60 * 60 * 1000;
  const weekAgo = now - 7 * 24 * 60 * 60 * 1000;

  const dailyBurn = events.filter(e => new Date(e.timestamp).getTime() > dayAgo).reduce((sum, e) => sum + e.amount, 0);
  const weeklyBurn = events.filter(e => new Date(e.timestamp).getTime() > weekAgo).reduce((sum, e) => sum + e.amount, 0);

  return {
    totalBurned,
    dailyBurn,
    weeklyBurn,
    burnRate: dailyBurn / 24,
    percentBurned: (totalBurned / 1_000_000_000) * 100,
  };
}

export function createBurnEvent(amount: number, source: BurnEvent['source'], matchId?: string, txHash?: string): BurnEvent {
  return {
    id: `burn-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    amount,
    source,
    matchId,
    txHash,
    timestamp: new Date().toISOString(),
  };
}
