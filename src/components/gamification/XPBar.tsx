'use client';
import { motion } from 'framer-motion';

interface XPBarProps {
  currentXP: number;
  maxXP: number;
  level: number;
  className?: string;
}

export function XPBar({ currentXP, maxXP, level, className = '' }: XPBarProps) {
  const pct = Math.min(100, (currentXP / maxXP) * 100);
  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs font-orbitron">
        <span className="text-neon-green">LVL {level}</span>
        <span className="text-gray-400">{currentXP.toLocaleString()} / {maxXP.toLocaleString()} XP</span>
      </div>
      <div className="h-2 bg-arena-border rounded-full overflow-hidden">
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 1, ease: 'easeOut' }}
          className="h-full rounded-full"
          style={{ background: 'linear-gradient(90deg, #39FF14, #00D4FF)' }}
        />
      </div>
    </div>
  );
}
