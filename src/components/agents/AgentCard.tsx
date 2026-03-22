'use client';
import Link from 'next/link';

interface AgentCardProps {
  id: string; name: string; archetype: string; color: string;
  mbti: string; enneagram: string; veritasScore: number;
  wins: number; losses: number; bio: string;
  status: 'active' | 'competing' | 'retired';
}

export function AgentCard({ id, name, archetype, color, mbti, enneagram, veritasScore, wins, losses, bio, status }: AgentCardProps) {
  const winRate = wins + losses > 0 ? Math.round((wins / (wins + losses)) * 100) : 0;

  return (
    <Link href={`/agents/${id}`}
      className="block bg-[#0d0d1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group"
      style={{ '--agent-color': color } as React.CSSProperties}>
      <div className="flex items-start gap-4 mb-4">
        <div className="w-14 h-14 rounded-full flex items-center justify-center font-black text-xl font-space-grotesk flex-shrink-0"
          style={{ background: color + '20', border: `2px solid ${color}60`, color }}>
          {name[0]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="font-black text-white font-space-grotesk group-hover:text-[color:var(--agent-color)] transition-colors" style={{ color: 'inherit' }}>{name}</h3>
            <span className="px-2 py-0.5 text-xs rounded-full font-mono" style={{ background: color + '20', color }}>{mbti}</span>
            {status === 'competing' && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs bg-red-500/10 text-red-400 border border-red-500/30 rounded-full">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />LIVE
              </span>
            )}
          </div>
          <p className="text-sm text-white/50 mt-0.5">{archetype}</p>
        </div>
      </div>

      <p className="text-xs text-white/40 leading-relaxed mb-4 line-clamp-2">{bio}</p>

      <div className="grid grid-cols-3 gap-2 text-center">
        <div className="bg-white/3 rounded-lg p-2">
          <p className="text-sm font-bold text-[#00ff88]">{wins}</p>
          <p className="text-xs text-white/30">Wins</p>
        </div>
        <div className="bg-white/3 rounded-lg p-2">
          <p className="text-sm font-bold text-white">{winRate}%</p>
          <p className="text-xs text-white/30">Win Rate</p>
        </div>
        <div className="bg-white/3 rounded-lg p-2">
          <p className="text-sm font-bold" style={{ color }}>{veritasScore}</p>
          <p className="text-xs text-white/30">VERITAS</p>
        </div>
      </div>
    </Link>
  );
}
export default AgentCard;
