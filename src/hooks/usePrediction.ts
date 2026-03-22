'use client';
import { useState, useEffect, useCallback } from 'react';

export interface PredictionOption {
  id: string;
  label: string;
  odds: number;
  totalBet: number;
}

export interface PredictionMarket {
  id: string;
  matchId: string;
  question: string;
  options: PredictionOption[];
  totalPool: number;
  status: 'open' | 'closed' | 'settled';
  closesAt: string;
  result?: string;
}

const MOCK_MARKETS: PredictionMarket[] = [
  {
    id:'pm-1', matchId:'match-142', question:'Who will win Match #142?', totalPool:45000, status:'open',
    closesAt: new Date(Date.now() + 2*60*60*1000).toISOString(),
    options: [
      { id:'o1', label:'PRIMUS', odds:2.1, totalBet:18000 },
      { id:'o2', label:'CERBERUS', odds:3.5, totalBet:9000 },
      { id:'o3', label:'MYTHION', odds:4.2, totalBet:7500 },
      { id:'o4', label:'SOLARIUS', odds:5.0, totalBet:6000 },
      { id:'o5', label:'Other', odds:8.0, totalBet:4500 },
    ],
  },
  {
    id:'pm-2', matchId:'match-142', question:'Will there be a betrayal in the next 10 turns?', totalPool:28000, status:'open',
    closesAt: new Date(Date.now() + 1*60*60*1000).toISOString(),
    options: [
      { id:'o1', label:'Yes', odds:1.6, totalBet:18000 },
      { id:'o2', label:'No', odds:2.8, totalBet:10000 },
    ],
  },
  {
    id:'pm-3', matchId:'match-142', question:'How many agents survive to Turn 80?', totalPool:13800, status:'open',
    closesAt: new Date(Date.now() + 3*60*60*1000).toISOString(),
    options: [
      { id:'o1', label:'0-2 agents', odds:6.0, totalBet:2000 },
      { id:'o2', label:'3-4 agents', odds:2.2, totalBet:6000 },
      { id:'o3', label:'5-6 agents', odds:3.1, totalBet:4000 },
      { id:'o4', label:'7-8 agents', odds:12.0, totalBet:1800 },
    ],
  },
];

export function usePrediction(matchId?: string) {
  const [markets, setMarkets] = useState<PredictionMarket[]>([]);
  const [loading, setLoading] = useState(false);
  const [userBets, setUserBets] = useState<Record<string, { optionId: string; amount: number }>>({});

  useEffect(() => {
    setLoading(true);
    setTimeout(() => {
      setMarkets(matchId ? MOCK_MARKETS.filter(m => m.matchId === matchId) : MOCK_MARKETS);
      setLoading(false);
    }, 200);
  }, [matchId]);

  const placeBet = useCallback(async (marketId: string, optionId: string, amount: number) => {
    try {
      const res = await fetch('/api/predictions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ marketId, optionId, amount }),
      });
      if (res.ok) {
        setUserBets(prev => ({ ...prev, [marketId]: { optionId, amount } }));
        return { success: true };
      }
    } catch (e) {
      console.error('Bet failed:', e);
    }
    return { success: false };
  }, []);

  return { markets, loading, userBets, placeBet };
}
