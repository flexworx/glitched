// Prediction Market: on-chain prediction market for match outcomes
export interface PredictionMarket {
  id: string;
  matchId: string;
  question: string;
  options: PredictionOption[];
  totalPool: number;
  status: 'open' | 'closed' | 'settled';
  closesAt: string;
  settledAt?: string;
  winningOptionId?: string;
}

export interface PredictionOption {
  id: string;
  label: string;
  totalBet: number;
  odds: number;
}

export function calculateOdds(option: PredictionOption, totalPool: number): number {
  if (option.totalBet === 0) return 10; // default odds for empty option
  const impliedProbability = option.totalBet / totalPool;
  return Math.round((1 / impliedProbability) * 10) / 10;
}

export function calculatePayout(betAmount: number, odds: number): number {
  return Math.floor(betAmount * odds);
}

export function calculateBurnAmount(betAmount: number): number {
  return Math.floor(betAmount * 0.01); // 1% burn
}

export function settleMarket(market: PredictionMarket, winningOptionId: string): PredictionMarket {
  return {
    ...market,
    status: 'settled',
    winningOptionId,
    settledAt: new Date().toISOString(),
  };
}
