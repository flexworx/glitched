// Prediction Market utilities — no Solana on-chain for now, uses API backend

export interface PredictionOption {
  id: string;
  label: string;
  odds: number;
  totalWagered: number;
}

export interface PredictionMarket {
  id: string;
  matchId: string;
  title: string;
  description: string;
  category: 'match' | 'elimination' | 'alliance' | 'drama' | 'season';
  options: PredictionOption[];
  closesAt: string;
  status: 'open' | 'locked' | 'resolved';
  resolvedOptionId?: string;
  totalPool: number;
  createdAt: string;
}

export interface PredictionBet {
  id: string;
  marketId: string;
  optionId: string;
  amount: number;
  walletAddress: string;
  potentialPayout: number;
  status: 'pending' | 'won' | 'lost' | 'refunded';
  createdAt: string;
}

export async function fetchOpenMarkets(): Promise<PredictionMarket[]> {
  const response = await fetch('/api/predictions?status=open');
  if (!response.ok) throw new Error('Failed to fetch markets');
  return response.json();
}

export async function placeBet(
  marketId: string,
  optionId: string,
  amount: number,
  walletAddress: string
): Promise<PredictionBet> {
  const response = await fetch('/api/predictions/bet', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ marketId, optionId, amount, walletAddress }),
  });
  if (!response.ok) throw new Error('Failed to place bet');
  return response.json();
}

export function calculateOdds(options: PredictionOption[]): Record<string, number> {
  const total = options.reduce((sum, o) => sum + o.totalWagered, 0);
  if (total === 0) return Object.fromEntries(options.map(o => [o.id, 2.0]));
  return Object.fromEntries(
    options.map(o => [
      o.id,
      Math.max(1.05, parseFloat(((total / Math.max(o.totalWagered, 1)) * 0.95).toFixed(2))),
    ])
  );
}

export function calculatePayout(wager: number, odds: number): number {
  return Math.floor(wager * odds);
}

export function calculateBurnOnLoss(wager: number): number {
  return Math.floor(wager * 0.05);
}

export function getWinProbability(option: PredictionOption, allOptions: PredictionOption[]): number {
  const total = allOptions.reduce((sum, o) => sum + o.totalWagered, 0);
  if (total === 0) return 1 / allOptions.length;
  return option.totalWagered / total;
}
