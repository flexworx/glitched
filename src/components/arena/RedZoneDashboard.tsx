'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import Arena3D from './Arena3D';
import type { GameState } from '@/lib/types/game-state';
import type { VERITASTier } from '@/lib/types/agent';
import { selectFocusMatch } from '@/lib/engine/drama-score';

interface MatchFeed {
  matchId: string;
  gameState: GameState;
  agentProfiles: Record<string, { name: string; signatureColor: string; veritasTier: VERITASTier }>;
  title: string;
}

interface RedZoneDashboardProps {
  matches: MatchFeed[];
  autoSwitch?: boolean;
  switchInterval?: number;
}

export default function RedZoneDashboard({
  matches,
  autoSwitch = true,
  switchInterval = 15000,
}: RedZoneDashboardProps) {
  const [primaryMatchId, setPrimaryMatchId] = useState<string>(matches[0]?.matchId || '');
  const [isAutoSwitching, setIsAutoSwitching] = useState(autoSwitch);
  const [lastSwitchReason, setLastSwitchReason] = useState<string>('');
  const switchTimerRef = useRef<NodeJS.Timeout | null>(null);

  const findHighestDramaMatch = useCallback(() => {
    const matchScores = matches.map(m => ({ matchId: m.matchId, dramaScore: m.gameState.dramaScore }));
    return selectFocusMatch(matchScores);
  }, [matches]);

  useEffect(() => {
    if (!isAutoSwitching || matches.length <= 1) return;
    switchTimerRef.current = setInterval(() => {
      const highestDrama = findHighestDramaMatch();
      if (highestDrama && highestDrama !== primaryMatchId) {
        const match = matches.find(m => m.matchId === highestDrama);
        setPrimaryMatchId(highestDrama);
        setLastSwitchReason(`Drama spike: ${Math.round(match?.gameState.dramaScore || 0)}/100`);
      }
    }, switchInterval);
    return () => { if (switchTimerRef.current) clearInterval(switchTimerRef.current); };
  }, [isAutoSwitching, matches, primaryMatchId, switchInterval, findHighestDramaMatch]);

  const primaryMatch = matches.find(m => m.matchId === primaryMatchId) || matches[0];
  const secondaryMatches = matches.filter(m => m.matchId !== primaryMatchId).slice(0, 3);

  if (!primaryMatch) {
    return (
      <div className="flex items-center justify-center h-full bg-arena-black">
        <div className="text-gray-500 font-orbitron">NO ACTIVE MATCHES</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-arena-black">
      {/* RedZone Header */}
      <div className="flex items-center justify-between px-4 py-2 bg-arena-dark border-b border-arena-border">
        <div className="flex items-center gap-3">
          <div className="w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
          <span className="font-orbitron text-sm text-neon-pink uppercase tracking-widest">RedZone Live</span>
          <span className="text-xs text-gray-500 font-jetbrains">{matches.length} Active Match{matches.length !== 1 ? 'es' : ''}</span>
        </div>
        <div className="flex items-center gap-3">
          {lastSwitchReason && (
            <motion.span key={lastSwitchReason} initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="text-xs text-neon-yellow font-jetbrains">
              ↗ {lastSwitchReason}
            </motion.span>
          )}
          <button
            onClick={() => setIsAutoSwitching(!isAutoSwitching)}
            className={`px-3 py-1 text-xs font-orbitron uppercase border transition-all ${isAutoSwitching ? 'bg-neon-pink/20 border-neon-pink text-neon-pink' : 'bg-arena-surface border-arena-border text-gray-400'}`}
          >
            {isAutoSwitching ? 'AUTO ON' : 'AUTO OFF'}
          </button>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex-1 flex gap-1 p-1 min-h-0">
        <div className="flex-1 relative min-h-0">
          <AnimatePresence mode="wait">
            <motion.div key={primaryMatchId} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: 0.3 }} className="absolute inset-0">
              <Arena3D gameState={primaryMatch.gameState} agentProfiles={primaryMatch.agentProfiles} cameraMode="overview" autoOrbit={false} />
            </motion.div>
          </AnimatePresence>
          <div className="absolute top-2 left-2 z-10 bg-arena-black/80 border border-neon-green px-2 py-1">
            <span className="text-xs font-orbitron text-neon-green">● MAIN — {primaryMatch.title}</span>
          </div>
          <div className="absolute bottom-2 left-2 right-2 z-10">
            <div className="flex items-center gap-2">
              <span className="text-xs font-orbitron text-gray-400 w-16">DRAMA</span>
              <div className="flex-1 h-1.5 bg-arena-surface rounded-full overflow-hidden">
                <motion.div className="h-full rounded-full" style={{ background: primaryMatch.gameState.dramaScore > 70 ? '#FF006E' : primaryMatch.gameState.dramaScore > 40 ? '#FFD60A' : '#39FF14' }} animate={{ width: `${primaryMatch.gameState.dramaScore}%` }} transition={{ duration: 0.5 }} />
              </div>
              <span className="text-xs font-orbitron w-8 text-right" style={{ color: primaryMatch.gameState.dramaScore > 70 ? '#FF006E' : primaryMatch.gameState.dramaScore > 40 ? '#FFD60A' : '#39FF14' }}>
                {Math.round(primaryMatch.gameState.dramaScore)}
              </span>
            </div>
          </div>
        </div>

        {secondaryMatches.length > 0 && (
          <div className="w-48 flex flex-col gap-1">
            {secondaryMatches.map((match) => (
              <button key={match.matchId} onClick={() => { setPrimaryMatchId(match.matchId); setLastSwitchReason('Manual switch'); }} className="flex-1 relative border border-arena-border hover:border-neon-green transition-colors overflow-hidden group">
                <div className="absolute inset-0 pointer-events-none">
                  <Arena3D gameState={match.gameState} agentProfiles={match.agentProfiles} cameraMode="overview" autoOrbit={true} />
                </div>
                <div className="absolute inset-0 bg-arena-black/40 group-hover:bg-arena-black/20 transition-colors" />
                <div className="absolute bottom-0 left-0 right-0 bg-arena-black/80 px-2 py-1">
                  <div className="text-xs font-orbitron text-gray-300 truncate">{match.title}</div>
                  <div className="flex items-center gap-1 mt-0.5">
                    <div className="w-1.5 h-1.5 rounded-full" style={{ background: match.gameState.dramaScore > 70 ? '#FF006E' : match.gameState.dramaScore > 40 ? '#FFD60A' : '#39FF14' }} />
                    <span className="text-xs text-gray-400 font-jetbrains">{Math.round(match.gameState.dramaScore)} drama</span>
                  </div>
                </div>
              </button>
            ))}
            {Array.from({ length: 3 - secondaryMatches.length }).map((_, i) => (
              <div key={`empty-${i}`} className="flex-1 border border-dashed border-arena-border flex items-center justify-center">
                <span className="text-xs text-gray-600 font-orbitron">STANDBY</span>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="flex gap-1 px-2 py-1 border-t border-arena-border bg-arena-dark">
        {matches.map((match) => (
          <button key={match.matchId} onClick={() => setPrimaryMatchId(match.matchId)} className={`px-3 py-1 text-xs font-orbitron uppercase tracking-wider border transition-all ${match.matchId === primaryMatchId ? 'bg-neon-green/20 border-neon-green text-neon-green' : 'bg-arena-surface border-arena-border text-gray-400 hover:border-neon-green hover:text-neon-green'}`}>
            {match.title} <span style={{ color: match.gameState.dramaScore > 70 ? '#FF006E' : match.gameState.dramaScore > 40 ? '#FFD60A' : '#39FF14' }}>{Math.round(match.gameState.dramaScore)}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
