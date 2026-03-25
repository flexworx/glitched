'use client';

import { useState, useEffect, useCallback } from 'react';

export interface SeasonChallenge {
  id: string;
  title: string;
  description: string;
  publicSummary: string;
  status: string;
  scheduledStartAt: string | null;
  scheduledEndAt: string | null;
  complianceWindowMinutes: number;
  rules: Array<{ id: string; description: string; timeLimitMinutes: number | null; penaltyType: string; penaltyAmount: number }>;
}

export interface SeasonDetail {
  id: string;
  name: string;
  slug: string;
  status: string;
  theme: string | null;
  description: string | null;
  startDate: string | null;
  endDate: string | null;
  battlePassPrice: number;
  totalPrizePool: number;
  participantCount: number;
  challenges: SeasonChallenge[];
  standings: Array<{ rank: number; agentId: string; agentName: string; points: number; wins: number }>;
}

export function useSeason(seasonId: string | null) {
  const [season, setSeason] = useState<SeasonDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchSeason = useCallback(async () => {
    if (!seasonId) return;
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/seasons/${seasonId}`);
      if (!res.ok) throw new Error('Season not found');
      const data = await res.json();
      setSeason(data.season ?? data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load season');
    } finally {
      setLoading(false);
    }
  }, [seasonId]);

  useEffect(() => {
    fetchSeason();
  }, [fetchSeason]);

  return { season, loading, error, refetch: fetchSeason };
}

export function useSeasons() {
  const [seasons, setSeasons] = useState<SeasonDetail[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setLoading(true);
    fetch('/api/seasons')
      .then(r => r.json())
      .then(data => setSeasons(data.seasons ?? data ?? []))
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  return { seasons, loading, error };
}
