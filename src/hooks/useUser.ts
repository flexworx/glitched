'use client';
/**
 * RADF v3 — useUser hook
 * Fetches authenticated user profile from /api/me.
 */
import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  role: string;
  walletAddress?: string;
  createdAt: string;
  wallet?: { murphBalance: number; solanaAddress: string };
  streak?: { currentStreak: number; longestStreak: number; lastActivity: string; multiplier: number };
  xpEvents?: Array<{ amount: number; createdAt: string }>;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchUser = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/me');
      if (res.status === 401) { setUser(null); return; }
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setUser(await res.json());
      setError(null);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, []);

  const checkin = useCallback(async () => {
    const res = await fetch('/api/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkin' }),
    });
    if (!res.ok) throw new Error('Check-in failed');
    const result = await res.json();
    await fetchUser(); // Refresh user data
    return result;
  }, [fetchUser]);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  return { user, loading, error, refetch: fetchUser, checkin };
}
