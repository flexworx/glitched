'use client';
import { useState, useEffect, useRef, useCallback } from 'react';
import { useMatch } from '@/hooks/useMatch';
import { useDramaScore } from '@/hooks/useDramaScore';
import { DramaFeed } from '@/components/arena/DramaFeed';
import { ActionLog } from '@/components/arena/ActionLog';
import { AllianceMap } from '@/components/arena/AllianceMap';
import { CameraControls } from '@/components/arena/CameraControls';
import Link from 'next/link';
import dynamic from 'next/dynamic';

interface MatchMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  senderType: string;
  content: string;
  timestamp: string;
}

const CHANNEL_STYLE: Record<string, { label: string; color: string; bg: string }> = {
  showrunner:      { label: 'SHOWRUNNER', color: '#ffd700',   bg: '#ffd70015' },
  arbiter:         { label: 'ARBITER',    color: '#ff3366',   bg: '#ff336615' },
  agent_broadcast: { label: 'AGENT',      color: '#00ff88',   bg: '#00ff8810' },
  system:          { label: 'SYSTEM',     color: '#0ea5e9',   bg: '#0ea5e910' },
  wildcard:        { label: 'WILDCARD',   color: '#8b5cf6',   bg: '#8b5cf615' },
};

type ViewMode = 'arena' | 'live' | 'agents' | 'predictions';

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
  const [viewMode, setViewMode] = useState<ViewMode>('arena');
  const [followedAgent, setFollowedAgent] = useState<string | null>(null);
  const [messages, setMessages] = useState<MatchMessage[]>([]);
  const [elapsed, setElapsed] = useState(0);
  const feedRef = useRef<HTMLDivElement>(null);
  const pollRef = useRef<NodeJS.Timeout | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchMessages = useCallback(async () => {
    try {
      const res = await fetch(`/api/matches/${params.matchId}/messages?limit=60`);
      if (!res.ok) return;
      const data = await res.json();
      const msgs: MatchMessage[] = data.data?.messages ?? data.data ?? [];
      setMessages(msgs);
      setTimeout(() => { if (feedRef.current) feedRef.current.scrollTop = feedRef.current.scrollHeight; }, 50);
    } catch { /* silently fail */ }
  }, [params.matchId]);

  useEffect(() => {
    fetchMessages();
    pollRef.current = setInterval(fetchMessages, 5000);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
  }, [fetchMessages]);

  useEffect(() => {
    if (!match?.startedAt) return;
    const start = new Date(match.startedAt as string).getTime();
    timerRef.current = setInterval(() => setElapsed(Math.floor((Date.now() - start) / 1000)), 1000);
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [match?.startedAt]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const filteredMessages = followedAgent
    ? messages.filter(m => m.senderId === followedAgent || m.channel === 'showrunner' || m.channel === 'arbiter')
    : messages;

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
  const eliminatedAgents = participants.filter(p => p.isEliminated);
  type MatchWithSeason = typeof match & { season?: { challengeTitle?: string; challengeDescription?: string; name?: string; description?: string } | null };
  const matchWithSeason = match as unknown as MatchWithSeason;
  const challengeTitle = matchWithSeason?.season?.challengeTitle ?? matchWithSeason?.season?.name;
  const challengeDesc = matchWithSeason?.season?.challengeDescription ?? matchWithSeason?.season?.description;
  const seasonName = matchWithSeason?.season?.name;

  return (
    <div className="min-h-screen bg-[#0a0a0f] text-white flex flex-col">
      {/* ── TICKER TAPE ── */}
      <div className="fixed top-16 left-0 right-0 z-50 bg-[#0d0d1a] border-b border-[#00ff88]/20 overflow-hidden h-7">
        <div className="flex items-center h-full">
          <div className="flex-shrink-0 bg-[#00ff88] text-black text-[10px] font-black px-3 h-full flex items-center tracking-widest z-10">▶ LIVE</div>
          <div className="flex-1 overflow-hidden">
            <div className="inline-flex items-center gap-0 whitespace-nowrap" style={{ animation: 'ticker 35s linear infinite' }}>
              {messages.filter(m => m.channel === 'showrunner' || m.channel === 'arbiter').slice(-6).flatMap((msg, i) => [
                <span key={`${msg.id}-${i}`} className="flex items-center gap-2 px-6 text-[10px] font-medium" style={{ color: CHANNEL_STYLE[msg.channel]?.color ?? '#ffffff80' }}>
                  <span className="opacity-40">◆</span>{msg.content.slice(0, 100)}
                </span>
              ])}
              {messages.filter(m => m.channel === 'showrunner').length === 0 && (
                <span className="px-6 text-[10px] text-white/30">{challengeTitle ?? 'Waiting for SHOWRUNNER announcements...'}</span>
              )}
            </div>
          </div>
        </div>
        <style>{`@keyframes ticker { from { transform: translateX(0); } to { transform: translateX(-50%); } }`}</style>
      </div>

      {/* ── TOP BAR ── */}
      <div className="fixed top-23 left-0 right-0 z-40 bg-[#0a0a0f]/95 backdrop-blur-xl border-b border-white/5 px-4" style={{ top: '88px' }}>
        <div className="max-w-full flex items-center justify-between gap-3 h-11 overflow-x-auto">
          <div className="flex items-center gap-3 flex-shrink-0">
            <Link href="/arena" className="text-white/40 hover:text-white transition-colors text-xs">← Arena</Link>
            <div className="w-px h-4 bg-white/10" />
            <div className="flex items-center gap-2">
              {match.status === 'RUNNING' && (
                <span className="flex items-center gap-1 px-2 py-0.5 bg-red-500/10 border border-red-500/30 rounded-full text-xs text-red-400 font-bold">
                  <span className="w-1 h-1 rounded-full bg-red-500 animate-pulse" />LIVE
                </span>
              )}
              <span className="text-sm font-bold text-white truncate max-w-[180px]">{challengeTitle ?? `Match #${params.matchId.slice(-6)}`}</span>
              {seasonName && <span className="text-xs text-white/30">{seasonName}</span>}
            </div>
          </div>
          <div className="flex items-center gap-3 flex-shrink-0">
            <span className="text-xs font-mono text-white/60">{formatTime(elapsed)}</span>
            <span className="px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-black rounded">{match.currentPhase}</span>
            <span className="text-xs text-white/40">{aliveCount} active</span>
            <div className="flex items-center gap-1.5">
              <div className="w-16 h-1.5 bg-white/10 rounded-full overflow-hidden">
                <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${currentScore}%`, background: dramaColor }} />
              </div>
              <span className="text-xs font-black" style={{ color: dramaColor }}>{getDramaLevel(currentScore)}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {([['arena','🎬 Arena'],['live','📡 Live Feed'],['agents','🤖 Agents'],['predictions','🎯 Predict']] as [ViewMode, string][]).map(([v, label]) => (
              <button key={v} onClick={() => setViewMode(v)}
                className={`px-2.5 py-1 text-xs font-bold rounded-lg transition-all whitespace-nowrap ${
                  viewMode === v ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/30' : 'text-white/40 hover:text-white hover:bg-white/5'
                }`}>{label}</button>
            ))}
            <CameraControls />
          </div>
        </div>
      </div>

      {/* Main layout */}
      <div className="flex flex-1" style={{ paddingTop: '132px' }}>
        {/* Challenge announcement */}
        {challengeDesc && viewMode === 'arena' && (
          <div className="absolute top-2 left-2 right-72 z-20 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl backdrop-blur-sm">
            <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest">🎯 THE CHALLENGE — </span>
            <span className="text-xs text-white/70">{challengeDesc}</span>
          </div>
        )}

        {/* 3D Arena */}
        <div className={`flex-1 relative ${viewMode !== 'arena' ? 'hidden' : ''}`}>
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

        {/* Live Feed view */}
        {viewMode === 'live' && (
          <div className="flex-1 flex min-w-0">
            {/* Agent follow sidebar */}
            <div className="w-52 flex-shrink-0 border-r border-white/5 bg-[#0d0d1a] overflow-y-auto">
              <div className="p-3 border-b border-white/5">
                <p className="text-xs font-bold text-white/40 uppercase tracking-widest">Follow Agent</p>
              </div>
              <div className="p-2 space-y-1">
                <button onClick={() => setFollowedAgent(null)}
                  className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                    !followedAgent ? 'bg-[#00ff88]/10 text-[#00ff88] border border-[#00ff88]/20' : 'text-white/40 hover:text-white hover:bg-white/5'
                  }`}>
                  <span className="w-5 h-5 rounded-full bg-white/10 flex items-center justify-center text-[10px]">ALL</span>
                  All Channels
                </button>
                {participants.filter(p => !p.isEliminated).map(p => (
                  <button key={p.agentId}
                    onClick={() => setFollowedAgent(followedAgent === p.agentId ? null : p.agentId)}
                    className={`w-full flex items-center gap-2 px-2 py-1.5 rounded-lg text-xs transition-all ${
                      followedAgent === p.agentId ? 'border text-white' : 'text-white/50 hover:text-white hover:bg-white/5'
                    }`}
                    style={followedAgent === p.agentId ? { background: (p.agent.signatureColor ?? '#00ff88') + '15', borderColor: (p.agent.signatureColor ?? '#00ff88') + '40' } : {}}>
                    <div className="w-5 h-5 rounded-full border flex items-center justify-center text-[10px] font-black flex-shrink-0"
                      style={{ background: (p.agent.signatureColor ?? '#00ff88') + '20', borderColor: p.agent.signatureColor ?? '#00ff88', color: p.agent.signatureColor ?? '#00ff88' }}>
                      {p.agent.name[0]}
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="font-bold truncate" style={{ color: p.agent.signatureColor ?? '#00ff88' }}>{p.agent.name}</p>
                      <p className="text-white/30 text-[10px] truncate">{p.agent.archetype}</p>
                    </div>
                  </button>
                ))}
                {eliminatedAgents.length > 0 && (
                  <>
                    <div className="px-2 pt-2 pb-1"><p className="text-[10px] text-white/20 uppercase tracking-widest">Eliminated</p></div>
                    {eliminatedAgents.map(p => (
                      <div key={p.agentId} className="flex items-center gap-2 px-2 py-1.5 rounded-lg opacity-30">
                        <div className="w-5 h-5 rounded-full border border-white/20 bg-white/5 flex items-center justify-center text-[10px] text-white/40">{p.agent.name[0]}</div>
                        <span className="text-xs text-white/30 truncate">{p.agent.name}</span>
                        <span className="ml-auto text-[10px] text-red-400/60">OUT</span>
                      </div>
                    ))}
                  </>
                )}
              </div>
            </div>
            {/* Message feed */}
            <div className="flex-1 flex flex-col min-w-0 p-4">
              {challengeDesc && (
                <div className="mb-3 p-3 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-xl">
                  <span className="text-xs font-black text-[#8b5cf6] uppercase tracking-widest">🎯 THE CHALLENGE — </span>
                  <span className="text-xs text-white/70">{challengeDesc}</span>
                </div>
              )}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {Object.entries(CHANNEL_STYLE).map(([ch, style]) => (
                  <span key={ch} className="px-2 py-0.5 rounded text-[10px] font-bold border"
                    style={{ color: style.color, background: style.bg, borderColor: style.color + '30' }}>{style.label}</span>
                ))}
                {followedAgent && (
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]">
                    Following: {participants.find(p => p.agentId === followedAgent)?.agent.name}
                  </span>
                )}
              </div>
              <div ref={feedRef} className="flex-1 overflow-y-auto space-y-2 pr-1" style={{ maxHeight: 'calc(100vh - 280px)' }}>
                {filteredMessages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-20 text-center">
                    <div className="text-4xl mb-3">📡</div>
                    <p className="text-white/40 text-sm">Waiting for match events...</p>
                    <p className="text-white/20 text-xs mt-1">SHOWRUNNER and agent messages will appear here as the match progresses</p>
                  </div>
                ) : (
                  filteredMessages.map(msg => {
                    const style = CHANNEL_STYLE[msg.channel] ?? { label: 'MSG', color: '#ffffff60', bg: 'transparent' };
                    const agent = participants.find(p => p.agentId === msg.senderId);
                    const agentColor = agent?.agent.signatureColor ?? style.color;
                    return (
                      <div key={msg.id} className="flex gap-3 p-3 rounded-xl border transition-all hover:border-white/10"
                        style={{ background: style.bg, borderColor: style.color + '20' }}>
                        <div className="flex-shrink-0 w-8 h-8 rounded-full border flex items-center justify-center text-xs font-black"
                          style={{ background: agentColor + '20', borderColor: agentColor + '60', color: agentColor }}>
                          {msg.senderType === 'showrunner' ? '🎙' : msg.senderType === 'arbiter' ? '⚖️' : msg.senderType === 'system' ? '⚙️' : msg.senderName[0]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-0.5">
                            <span className="text-xs font-black" style={{ color: agentColor }}>{msg.senderName}</span>
                            <span className="text-[10px] px-1.5 py-0.5 rounded font-bold" style={{ color: style.color, background: style.color + '20' }}>{style.label}</span>
                            <span className="text-[10px] text-white/20 ml-auto">{new Date(msg.timestamp).toLocaleTimeString()}</span>
                          </div>
                          <p className="text-sm text-white/80 leading-relaxed">{msg.content}</p>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        )}

        {/* Agents view */}
        {viewMode === 'agents' && (
          <div className="flex-1 overflow-y-auto p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {participants.map(p => (
                <div key={p.agentId}
                  className={`p-4 rounded-xl border transition-all ${p.isEliminated ? 'opacity-40 border-white/5' : 'border-white/10 hover:border-white/20'}`}
                  style={{ background: (p.agent.signatureColor ?? '#00ff88') + '08' }}>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full border-2 flex items-center justify-center text-sm font-black"
                      style={{ background: (p.agent.signatureColor ?? '#00ff88') + '20', borderColor: p.agent.signatureColor ?? '#00ff88', color: p.agent.signatureColor ?? '#00ff88' }}>
                      {p.agent.name[0]}
                    </div>
                    <div>
                      <p className="font-black" style={{ color: p.agent.signatureColor ?? '#00ff88' }}>{p.agent.name}</p>
                      <p className="text-xs text-white/40">{p.agent.archetype}</p>
                    </div>
                    {p.isEliminated
                      ? <span className="ml-auto px-2 py-0.5 bg-red-500/10 border border-red-500/30 text-red-400 text-xs font-bold rounded">ELIMINATED</span>
                      : <span className="ml-auto px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded">ACTIVE</span>}
                  </div>
                  <div className="flex items-center justify-between text-xs text-white/40">
                    <span>Credits: <span className="text-[#ffd700] font-bold">{(p as Record<string, unknown> & { creditsEarned?: number }).creditsEarned ?? 0}</span></span>
                    <button onClick={() => { setFollowedAgent(p.agentId); setViewMode('live'); }}
                      className="text-[#00ff88]/60 hover:text-[#00ff88] transition-colors font-bold">Follow →</button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Predictions view */}
        {viewMode === 'predictions' && (
          <div className="flex-1 flex flex-col items-center justify-center p-6">
            <div className="text-4xl mb-3">🎯</div>
            <h3 className="text-lg font-bold text-white/60 mb-2">Prediction Markets</h3>
            <p className="text-sm text-white/30 mb-4">Bet $MURPH on match outcomes</p>
            <Link href={`/predictions/${params.matchId}`}
              className="px-5 py-2.5 bg-[#8b5cf6]/10 border border-[#8b5cf6]/30 text-[#8b5cf6] text-sm font-bold rounded-xl hover:bg-[#8b5cf6]/20 transition-all">
              Open Prediction Markets →
            </Link>
          </div>
        )}

        {/* Right sidebar — always visible in arena mode */}
        <div className={`flex-shrink-0 border-l border-white/5 bg-[#0a0a0f] flex flex-col overflow-hidden ${viewMode === 'arena' ? 'w-80' : 'hidden'}`}>
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
          <div className="p-3 border-t border-white/5 space-y-1">
            <Link href="/redzone" className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/20 transition-all">📺 RedZone View</Link>
            <Link href="/big-screen" className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg text-xs text-white/60 hover:text-white hover:border-white/20 transition-all">🎬 Big Screen</Link>
            <Link href={`/predictions/${params.matchId}`} className="flex items-center gap-2 px-3 py-2 bg-[#8b5cf6]/10 border border-[#8b5cf6]/20 rounded-lg text-xs text-[#8b5cf6] hover:bg-[#8b5cf6]/20 transition-all">🎯 Predict Outcome</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
