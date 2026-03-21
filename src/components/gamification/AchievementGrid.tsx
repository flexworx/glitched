'use client';
import { motion } from 'framer-motion';

export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  rarity: 'common' | 'rare' | 'epic' | 'legendary';
  unlockedAt?: string;
  progress?: number;
  maxProgress?: number;
}

const RARITY_COLORS = { common: '#6b7280', rare: '#00D4FF', epic: '#7B2FBE', legendary: '#FFD700' };

interface AchievementGridProps { achievements: Achievement[]; }

export function AchievementGrid({ achievements }: AchievementGridProps) {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {achievements.map((ach, i) => {
        const color = RARITY_COLORS[ach.rarity];
        const unlocked = !!ach.unlockedAt;
        return (
          <motion.div key={ach.id} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: i * 0.03 }} className={`border p-3 text-center transition-all ${unlocked ? '' : 'opacity-50'}`} style={unlocked ? { borderColor: color, background: `${color}10` } : { borderColor: '#2a2a3a' }}>
            <div className="text-2xl mb-1">{ach.icon}</div>
            <div className="text-xs font-orbitron truncate" style={{ color: unlocked ? color : '#6b7280' }}>{ach.title}</div>
            <div className="text-xs text-gray-600 mt-0.5 truncate">{ach.description}</div>
            {ach.progress !== undefined && ach.maxProgress && (
              <div className="mt-2 h-1 bg-arena-border rounded-full overflow-hidden">
                <div className="h-full rounded-full" style={{ width: `${(ach.progress / ach.maxProgress) * 100}%`, background: color }}/>
              </div>
            )}
          </motion.div>
        );
      })}
    </div>
  );
}
