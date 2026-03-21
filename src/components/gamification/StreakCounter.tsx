'use client';
import { motion } from 'framer-motion';
interface StreakCounterProps { streak: number; maxStreak: number; }
export function StreakCounter({ streak, maxStreak }: StreakCounterProps) {
  return (
    <div className="flex items-center gap-3 bg-arena-surface border border-arena-border px-4 py-3">
      <motion.div animate={{ scale: [1, 1.2, 1] }} transition={{ repeat: Infinity, duration: 2 }} className="text-2xl">🔥</motion.div>
      <div>
        <div className="font-orbitron text-xl text-neon-green">{streak}</div>
        <div className="text-xs text-gray-500">Day Streak</div>
      </div>
      <div className="ml-auto text-right">
        <div className="font-orbitron text-sm text-gray-400">{maxStreak}</div>
        <div className="text-xs text-gray-600">Best</div>
      </div>
    </div>
  );
}
