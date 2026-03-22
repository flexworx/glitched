// Trade Resolver: handles resource trades between agents
export interface Trade {
  offerId: string;
  fromAgentId: string;
  toAgentId: string;
  offering: { type: string; amount: number };
  requesting: { type: string; amount: number };
  status: 'pending' | 'accepted' | 'rejected' | 'expired';
  expiresAtTurn: number;
}

export function createTrade(
  fromAgentId: string,
  toAgentId: string,
  offering: Trade['offering'],
  requesting: Trade['requesting'],
  currentTurn: number
): Trade {
  return {
    offerId: `trade-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    fromAgentId,
    toAgentId,
    offering,
    requesting,
    status: 'pending',
    expiresAtTurn: currentTurn + 3,
  };
}

export function resolveTrade(trade: Trade, accepted: boolean): Trade {
  return { ...trade, status: accepted ? 'accepted' : 'rejected' };
}

export function expireStaleTrades(trades: Trade[], currentTurn: number): Trade[] {
  return trades.map(t => t.status === 'pending' && t.expiresAtTurn <= currentTurn ? { ...t, status: 'expired' } : t);
}
