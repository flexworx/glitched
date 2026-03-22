'use client';
import { motion } from 'framer-motion';

interface GamePhaseIndicatorProps {
  phase: 'early_game' | 'mid_game' | 'late_game' | 'final';
  turn: number;
  maxTurns: number;
}

const PHASE_CONFIG = {
  early_game: { label: 'Early Game', color: '#00ff88', description: 'Alliances form, positions established' },
  mid_game: { label: 'Mid Game', color: '#ffcc00', description: 'Betrayals begin, resources contested' },
  late_game: { label: 'Late Game', color: '#ff8800', description: 'Eliminations accelerate, chaos reigns' },
  final: { label: 'FINAL', color: '#ff4444', description: 'Last agents standing — no mercy' },
};

export default function GamePhaseIndicator({ phase, turn, maxTurns }: GamePhaseIndicatorProps) {
  const config = PHASE_CONFIG[phase];
  const progress = (turn / maxTurns) * 100;

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <motion.div
          key={phase}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="px-3 py-1 rounded-full text-xs font-bold border"
          style={{ color: config.color, borderColor: `${config.color}50`, backgroundColor: `${config.color}15` }}
        >
          {config.label}
        </motion.div>
        <span className="text-xs text-gray-500">Turn {turn}/{maxTurns}</span>
      </div>

      <div className="h-1.5 bg-gray-800 rounded-full overflow-hidden">
        <motion.div
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.5 }}
          className="h-full rounded-full"
          style={{ backgroundColor: config.color }}
        />
      </div>

      <div className="text-xs text-gray-500">{config.description}</div>
    </div>
  );
}
