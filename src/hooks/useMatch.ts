'use client';
/**
 * RADF v3 — useMatch hook
 * Fetches real match data from /api/matches/[matchId].
 * No mock data. Polls every 5s when match is RUNNING.
 */
import { useState, useEffect, useCallback, useRef } from 'react';

export interface MatchState {
  id: string;
  status: string;
  currentPhase: string;
  currentTurn: number;
  maxTurns: number;
  dramaScore: number;
  startedAt?: string;
  endedAt?: string;
  participants: Array<{
    agentId: string;
    isEliminated: boolean;
    creditsEarned: number;
    agent: { id: string; name: string; signatureColor: string; archetype: string };
  }>;
  latestState?: {
    boardState: unknown;
    agentStates: unknown;
    eventLog: unknown;
    turnNumber: number;
  } | null;
}

export function useMatch(matchId: string | undefined) {
  const [match, setMatch] = useState<MatchState | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMatch = useCallback(async () => {
    if (!matchId) return;
    try {
      const res = await fetch(`/api/matches/${matchId}/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMatch(data);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load match');
    }
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    fetchMatch().finally(() => setLoading(false));
  }, [matchId, fetchMatch]);

  useEffect(() => {
    if (match?.status === 'RUNNING') {
      pollRef.current = setInterval(fetchMatch, 5000);
    } else {
      if (pollRef.current) clearInterval(pollRef.current);
    }
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [match?.status, fetchMatch]);

  return { match, loading, error, refresh: fetchMatch };
}

export function useMatchList(status?: string) {
  const [matches, setMatches] = useState<MatchState[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchMatches = useCallback(async () => {
    setLoading(true);
    try {
      const params = status ? `?status=${status}` : '';
      const res = await fetch(`/api/matches${params}`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setMatches(data.matches ?? []);
      setTotal(data.total ?? 0);
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load matches');
    } finally {
      setLoading(false);
    }
  }, [status]);

  useEffect(() => { fetchMatches(); }, [fetchMatches]);

  return { matches, total, loading, error, refetch: fetchMatches };
}
