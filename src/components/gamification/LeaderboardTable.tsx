'use client';

export interface LeaderboardEntry {
  rank: number;
  name?: string;
  username?: string;
  avatar?: string;
  score?: number;
  xp?: number;
  wins?: number;
  murph?: number;
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
const RANK_MEDALS = ['🥇', '🥈', '🥉'];
const FACTION_COLORS: Record<string, string> = {
  iron_veil: '#708090',
  neon_syndicate: '#39FF14',
  void_council: '#7B2FBE',
  golden_accord: '#FFD700',
};

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
          {entries.map((entry, idx) => {
            const rank = entry.rank ?? (idx + 1);
            const displayName = entry.name || entry.username || 'Unknown';
            const displayScore = entry.score ?? entry.xp ?? entry.wins ?? entry.murph ?? 0;
            const rankColor = RANK_COLORS[rank] || 'rgba(255,255,255,0.3)';
            const rankLabel = rank >= 1 && rank <= 3 ? (RANK_MEDALS[rank - 1] ?? '#' + rank) : '#' + rank;
            const factionColor = entry.faction ? (FACTION_COLORS[entry.faction] || '#ffffff40') : '#ffffff40';
            return (
              <tr key={rank} className="border-b border-white/5 hover:bg-white/[0.03] transition-colors">
                <td className="px-4 py-3">
                  <span className="font-black text-sm" style={{ color: rankColor }}>{rankLabel}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-white/10 flex items-center justify-center text-xs font-bold text-white/60">
                      {displayName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <p className="font-semibold text-white text-sm">{displayName}</p>
                      {entry.level != null && <p className="text-xs text-white/30">Level {entry.level}</p>}
                    </div>
                    {entry.badge && <span className="text-sm ml-1">{entry.badge}</span>}
                  </div>
                </td>
                {showFaction && (
                  <td className="px-4 py-3 hidden md:table-cell">
                    <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: factionColor, backgroundColor: factionColor + '20' }}>
                      {entry.faction ? entry.faction.replace(/_/g, ' ').toUpperCase() : '—'}
                    </span>
                  </td>
                )}
                <td className="px-4 py-3 text-right font-mono font-bold text-white">{displayScore.toLocaleString()}</td>
                <td className="px-4 py-3 text-right hidden sm:table-cell">
                  {entry.change != null && (
                    <span className={['text-xs font-bold', entry.change > 0 ? 'text-[#00ff88]' : entry.change < 0 ? 'text-red-400' : 'text-white/30'].join(' ')}>
                      {entry.change > 0 ? '+' + entry.change : entry.change === 0 ? '—' : entry.change}
                    </span>
                  )}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

export default LeaderboardTable;
