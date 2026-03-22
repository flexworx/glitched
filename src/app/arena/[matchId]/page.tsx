'use client';
import { useMatch } from '@/hooks/useMatch';
import { useDramaScore } from '@/hooks/useDramaScore';
import { DramaFeed } from '@/components/arena/DramaFeed';
import { ActionLog } from '@/components/arena/ActionLog';
import { AllianceMap } from '@/components/arena/AllianceMap';
import { CameraControls } from '@/components/arena/CameraControls';
import { ProgressBar } from '@/components/ui/ProgressBar';
import Link from 'next/link';
import dynamic from 'next/dynamic';

const Arena3D = dynamic(() => import('@/components/arena/Arena3D'), { ssr: false, loading: () => (
  <div className="w-full h-full bg-[#080810] flex items-center justify-center">
    <div className="text-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin mx-auto mb-3" />
      <p className="text-white/30 text-sm">Loading 3D Arena...</p>
    </div>
  </div>
)});

export default function ArenaMatchPage({ params }: { params: { matchId: string } }) {
  const { match, loading } = useMatch(params.matchId);
  const { currentScore, getDramaColor, getDramaLevel } = useDramaScore(params.matchId);

  if (loading) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
      <div className="w-10 h-10 rounded-full border-2 border-[#00ff88]/20 border-t-[#00ff88] animate-spin" />
    </div>
  );

  if (!match) return (
    <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center text-white">
      <div className="text-center">
        <p className="text-4xl mb-3">⚔️</p>
        <p className="text-white/50">Match not found</p>
        <Link href="/arena" className="mt-4 inline-block text-[#00ff88] hover:underline">← Back to Arena</Link>
      </div>
    </div>
  );

  const dramaColor = getDramaColor(currentScore);
  const aliveAgents = match.agents.filter(a => a.status === 'alive');

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/arena" className="text-white/40 hover:text-white transition-colors text-sm">← Arena</Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              {match.status === 'active' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />LIVE
                </span>
              )}
              <span className="text-sm font-bold text-white">Match #{params.matchId.slice(-6)}</span>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-xs text-white/40">Turn</span>
              <span className="text-sm font-bold font-mono text-white">{match.turn}/{match.maxTurns}</span>
            </div>
            <div className="w-24">
              <ProgressBar value={match.turn} max={match.maxTurns} size="sm" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs text-white/40">Drama</span>
              <span className="text-sm font-black font-mono" style={{ color: dramaColor }}>{currentScore}</span>
              <span className="text-xs font-bold uppercase" style={{ color: dramaColor }}>{getDramaLevel(currentScore)}</span>
            </div>
          </div>

          <CameraControls />
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1 pt-28">
        {/* 3D Arena - main area */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <Arena3D matchId={params.matchId} agents={match.agents} />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-white/5 bg-[#0a0a0f] flex flex-col overflow-hidden">
          {/* Agent status */}
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">Agents ({aliveAgents.length}/{match.agents.length} alive)</p>
            <div className="space-y-2">
              {match.agents.map(agent => (
                <div key={agent.id} className={['flex items-center gap-2 p-2 rounded-lg', agent.status === 'eliminated' ? 'opacity-30' : ''].join(' ')}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: agent.color + '20', color: agent.color, border: `1px solid ${agent.color}40` }}>
                    {agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-center mb-0.5">
                      <span className="text-xs font-bold text-white truncate">{agent.name}</span>
                      <span className="text-xs font-mono text-white/40">{agent.hp}</span>
                    </div>
                    <div className="h-1 bg-white/10 rounded-full overflow-hidden">
                      <div className="h-full rounded-full transition-all"
                        style={{ width: `${(agent.hp/agent.maxHp)*100}%`, background: agent.hp > 60 ? '#00ff88' : agent.hp > 30 ? '#ffcc00' : '#ff4444' }} />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Drama feed */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <DramaFeed matchId={params.matchId} maxEvents={6} />
            <AllianceMap alliances={match.alliances} agents={match.agents.map(a => ({ id: a.id, name: a.name, color: a.color }))} />
            <ActionLog actions={match.recentActions} maxItems={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
