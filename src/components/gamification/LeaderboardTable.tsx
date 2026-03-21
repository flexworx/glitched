'use client';
import { motion } from 'framer-motion';

export interface LeaderboardEntry {
  rank: number;
  username: string;
  level: number;
  xp: number;
  wins: number;
  murph: number;
  faction?: string;
  change?: number;
}

interface LeaderboardTableProps { entries: LeaderboardEntry[]; }
const RANK_COLORS: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export function LeaderboardTable({ entries }: LeaderboardTableProps) {
  return (
    <div className="space-y-1">
      {entries.map((entry, i) => (
        <motion.div key={entry.rank} initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.03 }} className="flex items-center gap-4 bg-arena-surface border border-arena-border px-4 py-3 hover:border-gray-600 transition-colors">
          <div className="w-8 text-center font-orbitron text-sm font-bold" style={{ color: RANK_COLORS[entry.rank] || '#6b7280' }}>
            {`#${entry.rank}`}
          </div>
          <div className="flex-1 min-w-0">
            <div className="font-orbitron text-sm text-white truncate">{entry.username}</div>
            <div className="text-xs text-gray-500">Level {entry.level}</div>
          </div>
          <div className="text-right hidden md:block">
            <div className="text-xs font-jetbrains text-neon-green">{entry.xp.toLocaleString()} XP</div>
          </div>
          <div className="text-right hidden lg:block">
            <div className="text-xs font-jetbrains text-neon-yellow">{entry.murph.toLocaleString()} $MURPH</div>
          </div>
          <div className="text-right w-12">
            <div className="text-xs font-orbitron text-white">{entry.wins}W</div>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
