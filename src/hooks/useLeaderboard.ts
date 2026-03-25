'use client';

import { useState, useEffect } from 'react';

export interface LeaderboardEntry {
  rank: number;
  userId: string;
  username: string;
  displayName: string | null;
  avatarUrl: string | null;
  murphBalance: number;
  totalWagered: number;
  totalWon: number;
  predictionCount: number;
  winRate: number;
}

export function useLeaderboard(limit = 50) {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch(`/api/leaderboards?limit=${limit}`)
      .then(r => r.json())
      .then(data => setEntries(data.leaderboard ?? data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [limit]);

  return { entries, loading, error };
}
