'use client';
import Link from 'next/link';

interface LeaderboardEntry {
  rank: number;
  name: string;
  avatar?: string;
  score: number;
  change?: number;
  faction?: string;
  level?: number;
  badge?: string;
}

interface LeaderboardTableProps {
  entries: LeaderboardEntry[];
  metric?: string;
  showFaction?: boolean;
}

const RANK_COLORS: Record<number, string> = { 1: '#FFD700', 2: '#C0C0C0', 3: '#CD7F32' };

export function LeaderboardTable({ entries, metric = 'Score', showFaction }: LeaderboardTableProps) {
  return (
    <div className="bg-[#0d0d1a] border border-white/10 rounded-xl overflow-hidden">
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-white/10">
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase w-12">#</th>
            <th className="px-4 py-3 text-left text-xs text-white/40 uppercase">Player</th>
            {showFaction && <th className="px-4 py-3 text-left text-xs text-white/40 uppercase hidden md:table-cell">Faction</th>}
            <th className="px-4 py-3 text-right text-xs text-white/40 uppercase">{metric}</th>
            <th className="px-4 py-3 text-right text-xs text-white/40 uppercase hidden sm:table-cell">Change</th>
          </tr>
        </thead>
        <tbody>
          {entries.map(entry => (
            <tr key={entry.rank} className="border-b border-white/5 hover:bg-white/3 transition-colors">
              <td className="px-4 py-3">
                <span className="font-black font-space-grotesk text-sm" style={{ color: RANK_COLORS[entry.rank] || 'rgba(255,255,255,0.3)' }}>
                  {entry.rank <= 3 ? ['🥇','🥈','🥉'][entry.rank-1] : `#${entry.rank}`}
                </span>
              </td>
              <td className="px-4 py-3">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                    {entry.name[0]}
                  </div>
                  <div>
                    <p className="font-semibold text-white text-sm">{entry.name}</p>
                    {entry.level && <p className="text-xs text-white/30">Level {entry.level}</p>}
                  </div>
                  {entry.badge && <span className="text-sm">{entry.badge}</span>}
                </div>
              </td>
              {showFaction && (
                <td className="px-4 py-3 hidden md:table-cell">
                  <span className="text-xs text-white/50">{entry.faction || '—'}</span>
                </td>
              )}
              <td className="px-4 py-3 text-right font-mono font-bold text-white">{entry.score.toLocaleString()}</td>
              <td className="px-4 py-3 text-right hidden sm:table-cell">
                {entry.change !== undefined && (
                  <span className={['text-xs font-bold', entry.change > 0 ? 'text-[#00ff88]' : entry.change < 0 ? 'text-red-400' : 'text-white/30'].join(' ')}>
                    {entry.change > 0 ? `+${entry.change}` : entry.change}
                  </span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
export default LeaderboardTable;
