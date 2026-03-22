'use client';
import { useState, useEffect, useCallback } from 'react';

export interface AdminStats {
  activeMatches: number;
  totalAgents: number;
  onlineUsers: number;
  murphCirculatingSupply: number;
  totalBurned: number;
  pendingFlags: number;
  systemHealth: string;
  cpuUsage: number;
  memoryUsage: number;
  wsConnections: number;
}

export function useAdmin() {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(false);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin');
      if (res.ok) setStats(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, [fetchStats]);

  const startMatch = useCallback(async (agentIds: string[]) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'start_match', agentIds }),
    });
    return res.json();
  }, []);

  const stopMatch = useCallback(async (matchId: string) => {
    const res = await fetch('/api/admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'stop_match', matchId }),
    });
    return res.json();
  }, []);

  return { stats, loading, fetchStats, startMatch, stopMatch };
}
