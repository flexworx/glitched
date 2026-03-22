'use client';
import { motion } from 'framer-motion';

interface HealthBarProps {
  hp: number;
  maxHp: number;
  agentName: string;
  color: string;
  compact?: boolean;
}

export default function HealthBar({ hp, maxHp, agentName, color, compact = false }: HealthBarProps) {
  const percent = Math.max(0, hp / maxHp);
  const barColor = percent > 0.6 ? '#00ff88' : percent > 0.3 ? '#ffaa00' : '#ff4444';

  if (compact) {
    return (
      <div className="flex items-center gap-2">
        <div className="flex-1 h-1.5 bg-gray-800 rounded-full overflow-hidden">
          <motion.div
            animate={{ width: `${percent * 100}%` }}
            transition={{ duration: 0.4 }}
            className="h-full rounded-full"
            style={{ backgroundColor: barColor }}
          />
        </div>
        <span className="text-xs text-gray-500 w-12 text-right">{hp}/{maxHp}</span>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      <div className="flex justify-between items-center">
        <span className="text-xs font-bold" style={{ color }}>{agentName}</span>
        <span className="text-xs text-gray-400">{hp} / {maxHp}</span>
      </div>
      <div className="h-3 bg-gray-800 rounded-full overflow-hidden border border-gray-700">
        <motion.div
          animate={{ width: `${percent * 100}%` }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="h-full rounded-full relative"
          style={{
            backgroundColor: barColor,
            boxShadow: `0 0 6px ${barColor}`,
          }}
        >
          {/* Shimmer effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        </motion.div>
      </div>
    </div>
  );
}
