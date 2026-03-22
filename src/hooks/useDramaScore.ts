'use client';
import { useState, useEffect, useCallback } from 'react';

export interface DramaEvent {
  event: string;
  score: number;
  timestamp: string;
  agentId?: string;
}

export function useDramaScore(matchId: string) {
  const [currentScore, setCurrentScore] = useState(0);
  const [events, setEvents] = useState<DramaEvent[]>([]);
  const [history, setHistory] = useState<Array<{ turn: number; score: number }>>([]);

  useEffect(() => {
    if (!matchId) return;
    // Simulate drama score updates
    const interval = setInterval(() => {
      const delta = (Math.random() - 0.3) * 10;
      setCurrentScore(prev => Math.max(0, Math.min(100, prev + delta)));
    }, 3000);
    // Seed with mock data
    setCurrentScore(78);
    setEvents([
      { event: 'BETRAYAL', score: 94, timestamp: new Date(Date.now() - 60000).toISOString(), agentId: 'mythion' },
      { event: 'ELIMINATION', score: 88, timestamp: new Date(Date.now() - 120000).toISOString(), agentId: 'oracle' },
      { event: 'ALLIANCE_FORMED', score: 45, timestamp: new Date(Date.now() - 180000).toISOString() },
      { event: 'CRITICAL_HIT', score: 72, timestamp: new Date(Date.now() - 240000).toISOString() },
    ]);
    return () => clearInterval(interval);
  }, [matchId]);

  const getDramaColor = useCallback((score: number): string => {
    if (score >= 90) return '#ff0040';
    if (score >= 70) return '#ff6600';
    if (score >= 50) return '#ffcc00';
    if (score >= 30) return '#00ff88';
    return '#0ea5e9';
  }, []);

  const getDramaLevel = useCallback((score: number): string => {
    if (score >= 90) return 'CRITICAL';
    if (score >= 70) return 'HIGH';
    if (score >= 50) return 'MEDIUM';
    if (score >= 30) return 'LOW';
    return 'CALM';
  }, []);

  return { currentScore, events, history, getDramaColor, getDramaLevel };
}
