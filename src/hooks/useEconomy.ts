'use client';

import { useState, useEffect } from 'react';

export interface BurnDataPoint {
  date: string;
  burned: number;
  cumulative: number;
}

export interface EconomyStats {
  totalSupply: number;
  circulatingSupply: number;
  totalBurned: number;
  burnRate: number;
  price: number;
  priceChange24h: number;
  marketCap: number;
  volume24h: number;
  holders: number;
  burnHistory: BurnDataPoint[];
  topBurners: Array<{ userId: string; username: string; totalBurned: number }>;
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    userId: string;
    username: string;
    timestamp: string;
  }>;
}

export function useEconomy() {
  const [stats, setStats] = useState<EconomyStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/murph/stats')
      .then(r => r.json())
      .then(data => setStats(data.stats ?? data))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { stats, loading, error };
}
