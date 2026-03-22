'use client';
import { useState, useEffect, useCallback } from 'react';
import { useWebSocket } from './useWebSocket';

export interface LiveGameState {
  matchId: string; turn: number; maxTurns: number;
  phase: 'lobby' | 'active' | 'finale' | 'ended';
  agents: Array<{ id: string; name: string; hp: number; position: [number,number]; status: 'alive'|'eliminated'; dramaScore: number; veritasScore: number }>;
  recentActions: Array<{ agentId: string; action: string; target?: string; narrative: string; turn: number }>;
  dramaScore: number; lastUpdated: string;
}

export function useGameState(matchId?: string) {
  const [gameState, setGameState] = useState<LiveGameState | null>(null);
  const [loading, setLoading] = useState(false);
  const { on, connected } = useWebSocket(matchId || "");

  useEffect(() => {
    if (!matchId) return;
    setLoading(true);
    fetch(`/api/matches/${matchId}/state`).then(r => r.json()).then(d => { setGameState(d); setLoading(false); }).catch(() => setLoading(false));
  }, [matchId]);

  useEffect(() => {
    if (!matchId) return;
    return on('match:state', (s: unknown) => setGameState(s as LiveGameState));
  }, [matchId, on]);

  const refresh = useCallback(() => {
    if (!matchId) return;
    fetch(`/api/matches/${matchId}/state`).then(r => r.json()).then(setGameState);
  }, [matchId]);

  return { gameState, loading, connected, refresh };
}
