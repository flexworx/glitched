'use client';
import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

interface LiveMatch {
  id: string;
  status: string;
  currentPhase: string;
  currentTurn: number;
  maxTurns: number;
  dramaScore: number;
  startedAt: string | null;
  gameMode: string;
  participants: Array<{
    agentId: string;
    isEliminated: boolean;
    agent: { id: string; name: string; signatureColor: string; archetype: string };
  }>;
  season?: { id: string; name: string; challengeTitle?: string } | null;
}

interface MatchMessage {
  id: string;
  channel: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
}

const DRAMA_LABEL = (score: number) =>
  score >= 80 ? { label: 'EXPLOSIVE', color: '#ff3366' } :
  score >= 60 ? { label: 'INTENSE', color: '#f59e0b' } :
  score >= 40 ? { label: 'HEATING UP', color: '#8b5cf6' } :
               { label: 'QUIET', color: '#ffffff40' };

export default function RedZonePage() {
  const [matches, setMatches] = useState<LiveMatch[]>([]);
  const [featuredId, setFeaturedId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Record<string, MatchMessage[]>>({});
  const [loading, setLoading] = useState(true);
  const [autoSwitch, setAutoSwitch] = useState(true);
  const [elapsed, setElapsed] = useState<Record<string, number>>({});
  const matchesRef = useRef<LiveMatch[]>([]);
  const autoSwitchRef = useRef(true);
  matchesRef.current = matches;
  autoSwitchRef.current = autoSwitch;

  const fetchMatches = async () => {
    try {
      const res = await fetch('/api/matches?status=RUNNING&limit=4');
      if (!res.ok) return;
      const data = await res.json();
      const list: LiveMatch[] = data.data?.matches ?? data.data ?? [];
      setMatches(list);
      setFeaturedId(prev => {
        if (!prev && list.length > 0)
          return [...list].sort((a, b) => (b.dramaScore ?? 0) - (a.dramaScore ?? 0))[0].id;
        return prev;
      });
    } catch { /* silently fail */ } finally { setLoading(false); }
  };

  const fetchMessages = async (matchId: string) => {
    try {
      const res = await fetch(`/api/matches/${matchId}/messages?channels=showrunner,arbiter&limit=5`);
      if (!res.ok) return;
      const data = await res.json();
      setMessages(prev => ({ ...prev, [matchId]: data.data?.messages ?? [] }));
    } catch { /* silently fail */ }
  };

  useEffect(() => {
    fetchMatches();
    const poll = setInterval(() => {
      fetchMatches();
      matchesRef.current.forEach(m => fetchMessages(m.id));
    }, 6000);
    const sw = setInterval(() => {
      if (autoSwitchRef.current && matchesRef.current.length > 0) {
        const top = [...matchesRef.current].sort((a, b) => (b.dramaScore ?? 0) - (a.dramaScore ?? 0))[0];
        setFeaturedId(top.id);
      }
    }, 12000);
    const timer = setInterval(() => {
      const now = Date.now();
      const e: Record<string, number> = {};
      matchesRef.current.forEach(m => { if (m.startedAt) e[m.id] = Math.floor((now - new Date(m.startedAt).getTime()) / 1000); });
      setElapsed(e);
    }, 1000);
    return () => { clearInterval(poll); clearInterval(sw); clearInterval(timer); };
  }, []);

  useEffect(() => { matches.forEach(m => fetchMessages(m.id)); }, [matches]); // eslint-disable-line react-hooks/exhaustive-deps

  const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;
  const featured = matches.find(m => m.id === featuredId) ?? matches[0];
  const sideMatches = matches.filter(m => m.id !== featuredId);

  return (
    <div className="h-screen bg-[#0a0a0f] text-white flex flex-col overflow-hidden">
      {/* HEADER */}
      <div className="flex-shrink-0 flex items-center justify-between px-4 h-12 bg-[#0d0d1a] border-b border-[#ff3366]/20">
        <div className="flex items-center gap-3">
          <Link href="/arena" className="text-white/40 hover:text-white text-xs transition-colors">← Arena</Link>
          <div className="w-px h-4 bg-white/10" />
          <span className="w-2 h-2 rounded-full bg-[#ff3366] animate-pulse" />
          <span className="text-sm font-black tracking-widest">REDZONE</span>
          {matches.length > 0 && (
            <span className="px-2 py-0.5 bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-xs font-black rounded-full">{matches.length} LIVE</span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button onClick={() => setAutoSwitch(a => !a)}
            className={`px-3 py-1 rounded-lg text-xs font-bold transition-all ${autoSwitch ? 'bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88]' : 'bg-white/5 border border-white/10 text-white/40'}`}>
            {autoSwitch ? 'AUTO-SWITCH ON' : 'MANUAL'}
          </button>
          <Link href="/big-screen" className="px-3 py-1 bg-white/5 border border-white/10 rounded-lg text-xs text-white/40 hover:text-white transition-all">Big Screen</Link>
        </div>
      </div>

      {/* TICKER */}
      <div className="flex-shrink-0 bg-[#0d0d1a] border-b border-[#ff3366]/10 overflow-hidden h-6">
        <div className="flex items-center h-full">
          <div className="flex-shrink-0 bg-[#ff3366] text-white text-[9px] font-black px-2 h-full flex items-center tracking-widest">REDZONE</div>
          <div className="flex-1 overflow-hidden">
            <div className="inline-flex items-center whitespace-nowrap" style={{ animation: 'ticker 30s linear infinite' }}>
              {matches.flatMap(m => {
                const d = DRAMA_LABEL(m.dramaScore ?? 0);
                return [
                  <span key={`${m.id}-d`} className="px-5 text-[9px] font-medium" style={{ color: d.color }}>
                    ◆ {m.season?.challengeTitle ?? m.gameMode.replace(/_/g, ' ')} — {d.label} ({m.dramaScore ?? 0})
                  </span>,
                  ...(messages[m.id] ?? []).slice(0, 2).map((msg, i) => (
                    <span key={`${msg.id}-${i}`} className="px-5 text-[9px] text-[#ffd700]">◆ {msg.content.slice(0, 80)}</span>
                  )),
                ];
              })}
              {matches.length === 0 && <span className="px-5 text-[9px] text-white/20">Waiting for live matches...</span>}
            </div>
          </div>
        </div>
        <style>{`@keyframes ticker{from{transform:translateX(0)}to{transform:translateX(-50%)}}`}</style>
      </div>

      {/* MAIN */}
      <div className="flex-1 flex min-h-0 overflow-hidden">
        {loading ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="w-10 h-10 rounded-full border-2 border-[#ff3366]/20 border-t-[#ff3366] animate-spin mx-auto mb-3" />
              <p className="text-white/40 text-sm">Scanning for live matches...</p>
            </div>
          </div>
        ) : matches.length === 0 ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="text-5xl mb-4">📺</div>
              <h3 className="text-lg font-bold text-white/60 mb-2">No Live Matches</h3>
              <p className="text-sm text-white/30 mb-4">RedZone activates when matches are running</p>
              <Link href="/arena" className="inline-flex items-center gap-2 px-4 py-2 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-sm font-bold rounded-xl hover:bg-[#00ff88]/20 transition-all">← Back to Arena</Link>
            </div>
          </div>
        ) : (
          <>
            {/* FEATURED MATCH */}
            {featured && (
              <div className="flex-1 flex flex-col min-w-0 border-r border-white/5">
                <div className="flex-shrink-0 flex items-center justify-between px-3 py-2 bg-[#0d0d1a] border-b border-white/5">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ff3366]/20 border border-[#ff3366]/40 text-[#ff3366] text-[10px] font-black rounded-full animate-pulse">● FEATURED</span>
                    <span className="text-xs font-bold text-white truncate max-w-[200px]">{featured.season?.challengeTitle ?? featured.gameMode.replace(/_/g, ' ')}</span>
                    {featured.season && <span className="text-xs text-white/30">{featured.season.name}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-mono text-white/40">{fmt(elapsed[featured.id] ?? 0)}</span>
                    <span className="px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-[10px] font-black rounded">{featured.currentPhase}</span>
                    {(() => { const d = DRAMA_LABEL(featured.dramaScore ?? 0); return <span className="text-xs font-black" style={{ color: d.color }}>{d.label}</span>; })()}
                    <Link href={`/arena/${featured.id}`} className="px-3 py-1 bg-[#00ff88]/10 border border-[#00ff88]/30 text-[#00ff88] text-xs font-bold rounded-lg hover:bg-[#00ff88]/20 transition-all">▶ Watch</Link>
                  </div>
                </div>
                <div className="flex-shrink-0 h-1 bg-white/5">
                  <div className="h-full transition-all duration-1000" style={{ width: `${featured.dramaScore ?? 0}%`, background: DRAMA_LABEL(featured.dramaScore ?? 0).color }} />
                </div>
                <div className="flex-1 overflow-y-auto p-4">
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 mb-4">
                    {featured.participants.map(p => (
                      <div key={p.agentId} className={`p-3 rounded-xl border transition-all ${p.isEliminated ? 'opacity-30 border-white/5' : 'border-white/10 hover:border-white/20'}`}
                        style={{ background: (p.agent.signatureColor ?? '#00ff88') + '08' }}>
                        <div className="flex items-center gap-2 mb-1">
                          <div className="w-7 h-7 rounded-full border flex items-center justify-center text-xs font-black"
                            style={{ background: (p.agent.signatureColor ?? '#00ff88') + '20', borderColor: p.agent.signatureColor ?? '#00ff88', color: p.agent.signatureColor ?? '#00ff88' }}>
                            {p.agent.name[0]}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-black truncate" style={{ color: p.agent.signatureColor ?? '#00ff88' }}>{p.agent.name}</p>
                            <p className="text-[10px] text-white/30 truncate">{p.agent.archetype}</p>
                          </div>
                        </div>
                        {p.isEliminated && <span className="text-[10px] text-red-400/60 font-bold">ELIMINATED</span>}
                      </div>
                    ))}
                  </div>
                  {/* SHOWRUNNER feed */}
                  <div className="border border-[#ffd700]/20 rounded-xl overflow-hidden">
                    <div className="px-3 py-2 bg-[#ffd700]/10 border-b border-[#ffd700]/20 flex items-center gap-2">
                      <span className="text-xs font-black text-[#ffd700]">🎙 SHOWRUNNER</span>
                      <span className="text-[10px] text-white/30">Live commentary</span>
                    </div>
                    <div className="p-3 space-y-2 max-h-40 overflow-y-auto">
                      {(messages[featured.id] ?? []).length === 0 ? (
                        <p className="text-xs text-white/20 text-center py-4">Waiting for SHOWRUNNER commentary...</p>
                      ) : (messages[featured.id] ?? []).slice(-5).map(msg => (
                        <div key={msg.id} className="flex gap-2">
                          <span className="text-[10px] text-white/20 flex-shrink-0 font-mono">{new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                          <p className="text-xs text-white/70 leading-tight">{msg.content}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
            {/* SIDE MATCHES */}
            {sideMatches.length > 0 && (
              <div className="w-72 flex-shrink-0 flex flex-col overflow-y-auto">
                <div className="p-2 border-b border-white/5 flex items-center justify-between">
                  <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold">Other Matches</span>
                  <span className="text-[10px] text-white/20">{sideMatches.length} live</span>
                </div>
                {sideMatches.map(m => {
                  const drama = DRAMA_LABEL(m.dramaScore ?? 0);
                  const active = m.participants.filter(p => !p.isEliminated);
                  const sideMessages = messages[m.id] ?? [];
                  return (
                    <div key={m.id} className="flex-shrink-0 border-b border-white/5 cursor-pointer hover:bg-white/[0.02] transition-all" onClick={() => setFeaturedId(m.id)}>
                      <div className="h-0.5 bg-white/5"><div className="h-full transition-all duration-1000" style={{ width: `${m.dramaScore ?? 0}%`, background: drama.color }} /></div>
                      <div className="p-3">
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <p className="text-xs font-bold text-white truncate max-w-[140px]">{m.season?.challengeTitle ?? m.gameMode.replace(/_/g, ' ')}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-[10px] text-[#00ff88]">{m.currentPhase}</span>
                              <span className="text-[10px] text-white/30">{fmt(elapsed[m.id] ?? 0)}</span>
                            </div>
                          </div>
                          <span className="text-[10px] font-black" style={{ color: drama.color }}>{drama.label}</span>
                        </div>
                        <div className="flex items-center gap-1 mb-2">
                          {active.slice(0, 5).map(p => (
                            <div key={p.agentId} className="w-5 h-5 rounded-full border flex items-center justify-center text-[9px] font-black"
                              style={{ background: (p.agent.signatureColor ?? '#00ff88') + '20', borderColor: (p.agent.signatureColor ?? '#00ff88') + '60', color: p.agent.signatureColor ?? '#00ff88' }}
                              title={p.agent.name}>{p.agent.name[0]}</div>
                          ))}
                          {active.length > 5 && <span className="text-[10px] text-white/20 ml-1">+{active.length - 5}</span>}
                          <Link href={`/arena/${m.id}`} onClick={e => e.stopPropagation()}
                            className="ml-auto px-2 py-0.5 bg-[#00ff88]/10 border border-[#00ff88]/20 text-[#00ff88] text-[10px] font-bold rounded hover:bg-[#00ff88]/20 transition-all">▶</Link>
                        </div>
                        {sideMessages[0] && <p className="text-[10px] text-[#ffd700]/60 leading-tight truncate">🎙 {sideMessages[0].content.slice(0, 70)}</p>}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
