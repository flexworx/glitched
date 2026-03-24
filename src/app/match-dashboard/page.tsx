'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import type {
  SocialGameState,
  SocialAlliance,
  CouncilVote,
  SocialPhase,
} from '@/lib/types/glitch-engine';
import { AgentCard } from '@/components/match-dashboard/AgentCard';
import { EventFeed } from '@/components/match-dashboard/EventFeed';
import { VoteDisplay } from '@/components/match-dashboard/VoteDisplay';

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

const DEFAULT_MATCH_ID = 'test-match-001';
const POLL_INTERVAL_MS = 2000;

const PHASE_ORDER: SocialPhase[] = [
  'SOCIAL',
  'CHALLENGE',
  'COUNCIL',
  'RECKONING',
  'FINAL_THREE',
];

const PHASE_LABELS: Record<SocialPhase, string> = {
  OPENING: 'Opening',
  SOCIAL: 'Social Phase',
  CHALLENGE: 'Challenge',
  COUNCIL: 'Council',
  RECKONING: 'Reckoning',
  FINAL_THREE: 'Final Three',
};

const PHASE_COLORS: Record<SocialPhase, string> = {
  OPENING: '#9CA3AF',
  SOCIAL: '#00D4FF',
  CHALLENGE: '#FFD700',
  COUNCIL: '#FF006E',
  RECKONING: '#8B5CF6',
  FINAL_THREE: '#39FF14',
};

const ALLIANCE_COLORS = [
  '#39FF14', '#00D4FF', '#FF006E', '#FFD60A',
  '#8B5CF6', '#FF6B35', '#14B8A6', '#6366F1',
];

// ---------------------------------------------------------------------------
// Main Dashboard
// ---------------------------------------------------------------------------

export default function MatchDashboardPage() {
  const [matchId, setMatchId] = useState(DEFAULT_MATCH_ID);
  const [state, setState] = useState<SocialGameState | null>(null);
  const [councilVote, setCouncilVote] = useState<CouncilVote | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRun, setAutoRun] = useState(false);
  const [matchLog, setMatchLog] = useState<string[]>([]);
  const autoRunRef = useRef(false);
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Keep ref in sync
  useEffect(() => {
    autoRunRef.current = autoRun;
  }, [autoRun]);

  // ------ Fetch state ------
  const fetchState = useCallback(async () => {
    try {
      const res = await fetch(`/api/v1/match/${matchId}/state`);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data: SocialGameState = await res.json();
      setState(data);
      setError(null);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Unknown error';
      setError(msg);
    }
  }, [matchId]);

  // Initial fetch + polling
  useEffect(() => {
    fetchState();
    pollRef.current = setInterval(fetchState, POLL_INTERVAL_MS);
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
    };
  }, [fetchState]);

  // ------ Phase advance ------
  const advancePhase = useCallback(async (phase: SocialPhase) => {
    setLoading(true);
    try {
      // POST to the match state endpoint to advance phase
      const res = await fetch(`/api/v1/match/${matchId}/state`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'advance_phase', phase }),
      });
      if (res.ok) {
        const data = await res.json();
        if (data.matchId) setState(data);
        setMatchLog((prev) => [...prev, `[R${state?.roundNumber || '?'}] Advanced to ${PHASE_LABELS[phase]}`]);
      }
      await fetchState();
    } catch {
      // ignore — polling will pick up
    } finally {
      setLoading(false);
    }
  }, [matchId, fetchState, state?.roundNumber]);

  // ------ Auto-run loop ------
  useEffect(() => {
    if (!autoRun || !state) return;

    let cancelled = false;
    const runLoop = async () => {
      for (const phase of PHASE_ORDER) {
        if (cancelled || !autoRunRef.current) break;
        await advancePhase(phase);
        // Wait between phases
        await new Promise((r) => setTimeout(r, 3000));
      }
    };

    runLoop();
    return () => { cancelled = true; };
    // We intentionally only re-trigger when autoRun toggles
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [autoRun]);

  // ------ Export log ------
  const exportLog = useCallback(() => {
    if (!state) return;
    const logData = {
      matchId: state.matchId,
      roundNumber: state.roundNumber,
      phase: state.phase,
      events: state.recentEvents,
      messages: state.recentMessages,
      alliances: state.alliances,
      eliminatedAgents: state.eliminatedAgents,
      ghostJury: state.ghostJury,
      matchLog,
    };
    const blob = new Blob([JSON.stringify(logData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `match-${state.matchId}-round${state.roundNumber}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }, [state, matchLog]);

  // ------ Derived data ------
  const agents = state ? Object.values(state.agents) : [];
  const aliveAgents = agents.filter((a) => !a.isEliminated);
  const ghostAgents = agents.filter((a) => a.isGhost);

  return (
    <div className="flex flex-col h-screen bg-arena-black text-white overflow-hidden">
      {/* ===== HEADER ===== */}
      <header className="flex items-center justify-between px-4 py-2.5 bg-arena-dark border-b border-arena-border flex-shrink-0">
        <div className="flex items-center gap-4">
          <h1 className="font-orbitron text-sm text-neon-green uppercase tracking-widest">
            Glitch Engine Dashboard
          </h1>
          <div className="w-px h-4 bg-arena-border" />
          <div className="flex items-center gap-2">
            <label className="font-jetbrains text-[10px] text-gray-500 uppercase">Match</label>
            <input
              type="text"
              value={matchId}
              onChange={(e) => setMatchId(e.target.value)}
              className="bg-arena-surface border border-arena-border rounded px-2 py-1 font-jetbrains text-xs text-white w-40 focus:border-neon-green/50 focus:outline-none"
            />
          </div>
        </div>

        <div className="flex items-center gap-4">
          {state && (
            <>
              <div className="font-jetbrains text-xs text-gray-400">
                Round <span className="text-white font-bold">{state.roundNumber}</span>
              </div>
              <div
                className="font-orbitron text-[10px] uppercase tracking-wider px-2 py-1 rounded border"
                style={{
                  color: PHASE_COLORS[state.phase],
                  borderColor: `${PHASE_COLORS[state.phase]}40`,
                  background: `${PHASE_COLORS[state.phase]}15`,
                }}
              >
                {PHASE_LABELS[state.phase]}
              </div>
              <div className="font-jetbrains text-[10px] text-gray-500">
                {state.timeElapsedMinutes}m elapsed
              </div>
              <div className="font-jetbrains text-[10px] text-gray-500">
                {aliveAgents.length}/{agents.length} alive
              </div>
            </>
          )}
          {error && (
            <span className="font-jetbrains text-[10px] text-status-eliminated">
              ERR: {error}
            </span>
          )}
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
        </div>
      </header>

      {/* ===== MAIN CONTENT ===== */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* ----- LEFT PANEL (60%) ----- */}
        <div className="w-[60%] flex flex-col border-r border-arena-border overflow-y-auto">
          {/* Agent Grid */}
          <div className="p-3 flex-shrink-0">
            <h2 className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest mb-2">
              Agents ({aliveAgents.length} alive, {ghostAgents.length} ghosts)
            </h2>
            <div className="grid grid-cols-4 gap-2">
              {agents
                .sort((a, b) => a.ranking - b.ranking)
                .map((agent) => (
                  <AgentCard
                    key={agent.id}
                    agent={agent}
                    isEliminated={agent.isEliminated}
                    isGhost={agent.isGhost}
                  />
                ))}
            </div>
          </div>

          {/* Alliance Map */}
          <div className="p-3 border-t border-arena-border flex-shrink-0">
            <h2 className="font-orbitron text-[10px] text-gray-500 uppercase tracking-widest mb-2">
              Alliances
            </h2>
            {state && state.alliances.length === 0 && (
              <p className="font-jetbrains text-xs text-gray-600 italic">No alliances formed yet.</p>
            )}
            <div className="grid grid-cols-2 gap-2">
              {state?.alliances.map((alliance, idx) => (
                <AllianceCard key={alliance.id} alliance={alliance} colorIdx={idx} />
              ))}
            </div>
          </div>

          {/* Ghost Jury Section */}
          {state && state.ghostJury.length > 0 && (
            <div className="p-3 border-t border-arena-border flex-shrink-0">
              <h2 className="font-orbitron text-[10px] text-deep-purple uppercase tracking-widest mb-2">
                Ghost Jury ({state.ghostJury.length})
              </h2>
              <div className="space-y-2">
                {state.ghostJury.map((ghost) => (
                  <div
                    key={ghost.agentId}
                    className="bg-arena-surface/50 border border-deep-purple/30 rounded-lg p-2"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-sm">{'\u{1F47B}'}</span>
                      <span className="font-space-grotesk text-xs font-bold text-deep-purple">
                        {ghost.name}
                      </span>
                      <span className="font-jetbrains text-[9px] text-gray-600">
                        Elim. R{ghost.eliminatedRound}
                      </span>
                      {ghost.finalVote && (
                        <span className="ml-auto font-jetbrains text-[9px] text-neon-green">
                          Voted: {ghost.finalVote}
                        </span>
                      )}
                    </div>
                    {ghost.lobbyMessages.length > 0 && (
                      <div className="space-y-0.5 mt-1">
                        {ghost.lobbyMessages.map((msg, i) => (
                          <p
                            key={i}
                            className="font-jetbrains text-[10px] text-gray-400 pl-5 italic"
                          >
                            &ldquo;{msg}&rdquo;
                          </p>
                        ))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* ----- RIGHT PANEL (40%) ----- */}
        <div className="w-[40%] flex flex-col overflow-hidden">
          {/* Event + Message Feeds */}
          <div className="flex-1 min-h-0 p-3 overflow-hidden">
            <EventFeed
              events={state?.recentEvents || []}
              messages={state?.recentMessages || []}
            />
          </div>

          {/* Council Vote Display */}
          {councilVote && (
            <div className="p-3 border-t border-arena-border flex-shrink-0">
              <VoteDisplay vote={councilVote} />
            </div>
          )}

          {/* Inline vote display from state if in council phase */}
          {state?.phase === 'COUNCIL' && !councilVote && (
            <div className="p-3 border-t border-arena-border flex-shrink-0">
              <h3 className="font-orbitron text-[10px] text-status-eliminated uppercase tracking-widest mb-2">
                Council in Session
              </h3>
              <p className="font-jetbrains text-xs text-gray-500 italic">
                Votes are being cast...
              </p>
            </div>
          )}
        </div>
      </div>

      {/* ===== BOTTOM BAR ===== */}
      <footer className="flex items-center justify-between px-4 py-2.5 bg-arena-dark border-t border-arena-border flex-shrink-0">
        <div className="flex items-center gap-2">
          {PHASE_ORDER.map((phase) => (
            <button
              key={phase}
              onClick={() => advancePhase(phase)}
              disabled={loading || autoRun}
              className={[
                'px-3 py-1.5 text-[10px] font-orbitron uppercase tracking-wider rounded border transition-all',
                'disabled:opacity-30 disabled:cursor-not-allowed',
                state?.phase === phase
                  ? 'border-neon-green/50 bg-neon-green/10 text-neon-green'
                  : 'border-arena-border bg-arena-surface text-gray-400 hover:border-gray-500 hover:text-gray-300',
              ].join(' ')}
            >
              Run {PHASE_LABELS[phase]}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          {/* Auto-run toggle */}
          <button
            onClick={() => setAutoRun(!autoRun)}
            className={[
              'flex items-center gap-2 px-3 py-1.5 text-[10px] font-orbitron uppercase tracking-wider rounded border transition-all',
              autoRun
                ? 'border-neon-pink/50 bg-neon-pink/10 text-neon-pink'
                : 'border-arena-border bg-arena-surface text-gray-400 hover:border-gray-500',
            ].join(' ')}
          >
            <span
              className={[
                'w-2 h-2 rounded-full',
                autoRun ? 'bg-neon-pink animate-pulse' : 'bg-gray-600',
              ].join(' ')}
            />
            Auto-Run {autoRun ? 'ON' : 'OFF'}
          </button>

          {/* Refresh */}
          <button
            onClick={fetchState}
            className="px-3 py-1.5 text-[10px] font-orbitron uppercase tracking-wider rounded border border-arena-border bg-arena-surface text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all"
          >
            Refresh
          </button>

          {/* Export */}
          <button
            onClick={exportLog}
            disabled={!state}
            className="px-3 py-1.5 text-[10px] font-orbitron uppercase tracking-wider rounded border border-arena-border bg-arena-surface text-gray-400 hover:border-gray-500 hover:text-gray-300 transition-all disabled:opacity-30 disabled:cursor-not-allowed"
          >
            Export Log
          </button>
        </div>
      </footer>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Alliance Card sub-component
// ---------------------------------------------------------------------------

function AllianceCard({ alliance, colorIdx }: { alliance: SocialAlliance; colorIdx: number }) {
  const color = ALLIANCE_COLORS[colorIdx % ALLIANCE_COLORS.length];
  const trustPct = Math.min(100, Math.max(0, alliance.trust));

  return (
    <div
      className="bg-arena-surface/50 border rounded-lg p-2.5"
      style={{ borderColor: `${color}30` }}
    >
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-1.5">
          <span
            className="w-2 h-2 rounded-full flex-shrink-0"
            style={{ background: color }}
          />
          <span className="font-space-grotesk text-xs font-bold text-white truncate">
            {alliance.name || alliance.id}
          </span>
          {alliance.isSecret && (
            <span className="font-jetbrains text-[8px] text-neon-yellow px-1 py-0.5 border border-neon-yellow/30 rounded bg-neon-yellow/10">
              SECRET
            </span>
          )}
        </div>
        <span className="font-jetbrains text-[9px] text-gray-600">
          R{alliance.formedAtRound}
        </span>
      </div>

      {/* Members */}
      <div className="flex flex-wrap gap-1 mb-1.5">
        {alliance.members.map((memberId) => (
          <span
            key={memberId}
            className="font-jetbrains text-[9px] px-1.5 py-0.5 rounded bg-white/5 text-gray-400"
          >
            {memberId}
          </span>
        ))}
      </div>

      {/* Trust bar */}
      <div className="flex items-center gap-2">
        <span className="font-jetbrains text-[9px] text-gray-600 flex-shrink-0">Trust</span>
        <div className="flex-1 h-1.5 bg-white/5 rounded-full overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-300"
            style={{
              width: `${trustPct}%`,
              background: `linear-gradient(90deg, ${color}80, ${color})`,
            }}
          />
        </div>
        <span className="font-jetbrains text-[9px] text-gray-500 flex-shrink-0">
          {alliance.trust}%
        </span>
      </div>
    </div>
  );
}
