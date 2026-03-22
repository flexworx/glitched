'use client';
import { useState, useEffect } from 'react';

export interface StreakData { current: number; longest: number; lastCheckin: string|null; canCheckin: boolean; xpMultiplier: number; }

export function useStreak(userId?: string) {
  const [streak, setStreak] = useState<StreakData>({ current: 0, longest: 0, lastCheckin: null, canCheckin: false, xpMultiplier: 1 });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userId) return;
    setLoading(true);
    fetch('/api/me').then(r => r.json()).then(d => {
      const s = d.streak || {};
      const last = s.lastCheckin ? new Date(s.lastCheckin) : null;
      const canCheckin = !last || (Date.now() - last.getTime()) > 20*60*60*1000;
      setStreak({ current: s.current||0, longest: s.longest||0, lastCheckin: s.lastCheckin||null, canCheckin, xpMultiplier: Math.min(3, 1 + Math.floor((s.current||0)/7)*0.5) });
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [userId]);

  const checkin = async () => {
    const data = await fetch('/api/me', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'checkin' }) }).then(r => r.json());
    if (data.success) setStreak(p => ({ ...p, current: p.current+1, canCheckin: false, lastCheckin: new Date().toISOString() }));
    return data;
  };

  return { streak, loading, checkin };
}
