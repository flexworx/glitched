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
  const participants = match.participants ?? [];
  const aliveCount = participants.filter(p => !p.isEliminated).length;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* Top bar */}
      <div className="fixed top-16 left-0 right-0 z-30 bg-[#0a0a0f]/90 backdrop-blur-xl border-b border-white/5 px-4 py-2">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <Link href="/arena" className="text-white/40 hover:text-white transition-colors text-sm">← Arena</Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              {match.status === 'RUNNING' && (
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
              <span className="text-sm font-bold font-mono text-white">{match.currentTurn}/{match.maxTurns}</span>
            </div>
            <div className="w-24">
              <ProgressBar value={match.currentTurn} max={match.maxTurns} size="sm" />
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
        {/* 3D Arena */}
        <div className="flex-1 relative">
          <div className="absolute inset-0">
            <Arena3D
              gameState={{
                matchId: params.matchId,
                status: 'RUNNING' as any,
                gameMode: 'STANDARD_ELIMINATION' as any,
                currentPhase: (match.currentPhase as any) ?? 'COMPETITION',
                currentTurn: match.currentTurn ?? 1,
                maxTurns: match.maxTurns ?? 100,
                dramaScore: currentScore,
                board: { tiles: [], width: 20, height: 20, turn: match.currentTurn ?? 1, phase: (match.currentPhase as any) ?? 'COMPETITION', activeHazards: [], allianceMap: {} },
                agents: Object.fromEntries(participants.map((p) => [p.agentId, {
                  agentId: p.agentId,
                  position: { x: 5, y: 5 },
                  hp: 100, maxHp: 100, credits: 500, shields: 0,
                  statusEffects: [], actionsUsed: 0, maxActions: 3,
                  isEliminated: p.isEliminated, isGhost: false,
                  emotionalState: { primary: 'focused', intensity: 0.7, triggers: [] },
                  visibleTiles: [],
                }])),
                eventLog: [],
              }}
              agentProfiles={Object.fromEntries(participants.map((p) => [p.agentId, {
                name: p.agent.name,
                signatureColor: p.agent.signatureColor ?? '#00ff88',
                veritasTier: 'RELIABLE' as const,
              }]))}
            />
          </div>
        </div>

        {/* Right sidebar */}
        <div className="w-80 flex-shrink-0 border-l border-white/5 bg-[#0a0a0f] flex flex-col overflow-hidden">
          <div className="p-4 border-b border-white/5">
            <p className="text-xs text-white/40 uppercase tracking-wider mb-3">
              Agents ({aliveCount}/{participants.length} alive)
            </p>
            <div className="space-y-2">
              {participants.map((p) => (
                <div key={p.agentId} className={['flex items-center gap-2 p-2 rounded-lg', p.isEliminated ? 'opacity-30' : ''].join(' ')}>
                  <div className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold flex-shrink-0"
                    style={{ background: (p.agent.signatureColor ?? '#00ff88') + '20', color: p.agent.signatureColor ?? '#00ff88', border: `1px solid ${p.agent.signatureColor ?? '#00ff88'}40` }}>
                    {p.agent.name[0]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <span className="text-xs font-bold text-white truncate block">{p.agent.name}</span>
                    <span className="text-xs text-white/40">{p.agent.archetype}</span>
                  </div>
                  {p.isEliminated && <span className="text-xs text-red-400/60">OUT</span>}
                </div>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            <DramaFeed matchId={params.matchId} maxEvents={6} />
            <AllianceMap alliances={[]} agents={participants.map(p => ({ id: p.agentId, name: p.agent.name, color: p.agent.signatureColor ?? '#00ff88' }))} />
            <ActionLog actions={[]} maxItems={10} />
          </div>
        </div>
      </div>
    </div>
  );
}
