'use client';
/**
 * RADF v3 — usePrediction hook
 * Fetches prediction pools and user bets from real API.
 */
import { useState, useEffect, useCallback } from 'react';

export interface PredictionPool {
  id: string;
  matchId: string;
  totalPool: number;
  status: string;
  outcomeOdds: Record<string, number>;
  resolvedAt?: string;
  winningOutcome?: string;
  createdAt: string;
  match?: {
    id: string;
    status: string;
    currentTurn: number;
    participants: Array<{ agent: { id: string; name: string; signatureColor: string } }>;
  };
  _count?: { bets: number };
}

export function usePredictions() {
  const [pools, setPools] = useState<PredictionPool[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchPools = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/predictions');
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setPools(data.pools ?? []);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load predictions');
    } finally {
      setLoading(false);
    }
  }, []);

  const placeBet = useCallback(async (matchId: string, predictionType: string, predictionData: Record<string, unknown>, amount: number) => {
    const res = await fetch('/api/predictions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchId, predictionType, predictionData, amount }),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error ?? 'Failed to place bet');
    }
    await fetchPools();
    return res.json();
  }, [fetchPools]);

  useEffect(() => { fetchPools(); }, [fetchPools]);

  return { pools, loading, error, refetch: fetchPools, placeBet };
}

export function useMyPredictions() {
  const [predictions, setPredictions] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetch('/api/me/predictions')
      .then(r => r.json())
      .then(data => setPredictions(data.predictions ?? []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  return { predictions, loading };
}
