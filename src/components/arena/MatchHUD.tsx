'use client';
import { motion } from 'framer-motion';
import GamePhaseIndicator from './GamePhaseIndicator';
import DramaScoreEngine from './DramaScoreEngine';

interface MatchHUDProps {
  matchId: string;
  turn: number;
  maxTurns: number;
  phase: 'early_game' | 'mid_game' | 'late_game' | 'final';
  dramaScore: number;
  aliveCount: number;
  totalAgents: number;
  recentDramaEvents: Array<{ type: string; contribution: number; timestamp: number }>;
}

export default function MatchHUD({
  matchId, turn, maxTurns, phase, dramaScore, aliveCount, totalAgents, recentDramaEvents
}: MatchHUDProps) {
  return (
    <div className="absolute top-4 left-4 right-4 flex items-start justify-between pointer-events-none">
      {/* Left panel */}
      <motion.div
        initial={{ x: -20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl p-4 w-56 pointer-events-auto"
      >
        <div className="text-xs text-gray-500 mb-1">Match</div>
        <div className="text-xs font-mono text-gray-400 mb-3 truncate">{matchId}</div>
        <GamePhaseIndicator phase={phase} turn={turn} maxTurns={maxTurns} />
        <div className="mt-3 text-center">
          <span className="text-2xl font-bold text-white">{aliveCount}</span>
          <span className="text-gray-500 text-sm"> / {totalAgents} alive</span>
        </div>
      </motion.div>

      {/* Right panel */}
      <motion.div
        initial={{ x: 20, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="bg-black/70 backdrop-blur-sm border border-gray-800 rounded-xl p-4 w-56 pointer-events-auto"
      >
        <DramaScoreEngine score={dramaScore} recentEvents={recentDramaEvents} />
      </motion.div>
    </div>
  );
}
