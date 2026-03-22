'use client';
import Link from 'next/link';

interface MatchCardProps {
  matchId: string;
  status: 'live' | 'upcoming' | 'ended';
  turn: number;
  maxTurns: number;
  agents: Array<{ name: string; color: string; hp: number; status: 'alive' | 'eliminated' }>;
  dramaScore: number;
  startedAt?: string;
}

export function MatchCard({ matchId, status, turn, maxTurns, agents, dramaScore, startedAt }: MatchCardProps) {
  const aliveAgents = agents.filter(a => a.status === 'alive');
  const dramaColor = dramaScore >= 90 ? '#ff0040' : dramaScore >= 70 ? '#ff6600' : dramaScore >= 40 ? '#ffcc00' : '#00ff88';

  return (
    <Link href={`/arena/${matchId}`}
      className="block bg-[#0d0d1a] border border-white/10 rounded-xl p-5 hover:border-white/20 transition-all group">
      <div className="flex items-start justify-between mb-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            {status === 'live' && (
              <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
                <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse inline-block" /> LIVE
              </span>
            )}
            {status === 'upcoming' && <span className="px-2 py-0.5 bg-[#0ea5e9]/10 border border-[#0ea5e9]/30 rounded-full text-xs text-[#0ea5e9] font-bold">SOON</span>}
            {status === 'ended' && <span className="px-2 py-0.5 bg-white/5 border border-white/10 rounded-full text-xs text-white/40 font-bold">ENDED</span>}
          </div>
          <p className="text-sm font-bold text-white group-hover:text-[#00ff88] transition-colors">Match #{matchId.slice(-6)}</p>
          {startedAt && <p className="text-xs text-white/30 mt-0.5">{new Date(startedAt).toLocaleTimeString()}</p>}
        </div>
        {status === 'live' && (
          <div className="text-right">
            <p className="text-xs text-white/40">Drama</p>
            <p className="text-lg font-black font-mono" style={{ color: dramaColor }}>{dramaScore}</p>
          </div>
        )}
      </div>

      {/* Turn progress */}
      {status !== 'upcoming' && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-white/40 mb-1">
            <span>Turn {turn}</span><span>{maxTurns}</span>
          </div>
          <div className="h-1 bg-white/10 rounded-full overflow-hidden">
            <div className="h-full bg-[#00ff88]/60 rounded-full" style={{ width: `${(turn/maxTurns)*100}%` }} />
          </div>
        </div>
      )}

      {/* Agent tokens */}
      <div className="flex gap-1.5 flex-wrap">
        {agents.map(agent => (
          <div key={agent.name}
            className={['flex items-center gap-1 px-2 py-1 rounded-lg text-xs font-bold',
              agent.status === 'eliminated' ? 'opacity-30' : ''].join(' ')}
            style={{ background: agent.color + '15', border: `1px solid ${agent.color}30`, color: agent.color }}>
            {agent.name.slice(0, 4)}
          </div>
        ))}
      </div>

      <div className="mt-3 flex justify-between text-xs text-white/30">
        <span>{aliveAgents.length}/{agents.length} agents alive</span>
        <span className="group-hover:text-[#00ff88] transition-colors">Watch →</span>
      </div>
    </Link>
  );
}
export default MatchCard;
