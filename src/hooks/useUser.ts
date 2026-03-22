'use client';
import { useState, useEffect, useCallback } from 'react';

export interface UserProfile {
  id: string;
  username: string;
  level: number;
  xp: number;
  xpForNextLevel: number;
  faction: string;
  streak: { current: number; longest: number; lastCheckin: string };
  achievements: string[];
  murphBalance: number;
}

export function useUser() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = useCallback(async () => {
    try {
      const res = await fetch('/api/me');
      if (res.ok) setUser(await res.json());
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchUser(); }, [fetchUser]);

  const checkin = useCallback(async () => {
    const res = await fetch('/api/me', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ action: 'checkin' }),
    });
    const data = await res.json();
    if (data.success) {
      setUser(prev => prev ? { ...prev, xp: prev.xp + data.xpEarned, streak: { ...prev.streak, current: data.newStreak } } : prev);
    }
    return data;
  }, []);

  const canCheckin = user ? new Date(user.streak.lastCheckin).toDateString() !== new Date().toDateString() : false;

  return { user, loading, refetch: fetchUser, checkin, canCheckin };
}
