'use client';
import { useEffect, useRef } from 'react';

interface Match {
  id: string;
  dramaScore: number;
  status: string;
  lastEvent?: string;
}

interface RedZoneAutoSwitchProps {
  matches: Match[];
  currentMatchId: string;
  onSwitch: (matchId: string) => void;
  autoSwitch: boolean;
  switchThreshold?: number;
}

export default function RedZoneAutoSwitch({
  matches,
  currentMatchId,
  onSwitch,
  autoSwitch,
  switchThreshold = 60,
}: RedZoneAutoSwitchProps) {
  const lastSwitchTime = useRef(Date.now());
  const MIN_SWITCH_INTERVAL = 8000; // 8 seconds minimum between switches

  useEffect(() => {
    if (!autoSwitch) return;

    const interval = setInterval(() => {
      const now = Date.now();
      if (now - lastSwitchTime.current < MIN_SWITCH_INTERVAL) return;

      // Find the most dramatic match that isn't the current one
      const activeMatches = matches.filter(m => m.status === 'active' && m.id !== currentMatchId);
      if (activeMatches.length === 0) return;

      const mostDramatic = activeMatches.reduce((best, m) => m.dramaScore > best.dramaScore ? m : best);

      // Switch if the other match is significantly more dramatic
      const currentMatch = matches.find(m => m.id === currentMatchId);
      const currentDrama = currentMatch?.dramaScore ?? 0;

      if (mostDramatic.dramaScore > currentDrama + switchThreshold) {
        onSwitch(mostDramatic.id);
        lastSwitchTime.current = now;
      }
    }, 2000);

    return () => clearInterval(interval);
  }, [matches, currentMatchId, onSwitch, autoSwitch, switchThreshold]);

  return null;
}
