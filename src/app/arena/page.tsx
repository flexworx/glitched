'use client';

import { useState, useEffect, useRef } from 'react';
import dynamic from 'next/dynamic';
import type { GameState } from '@/lib/types/game-state';
import type { VERITASTier } from '@/lib/types/agent';

// Dynamic imports — ssr:false prevents hydration mismatches from Three.js
const Arena3D = dynamic(() => import('@/components/arena/Arena3D'), { ssr: false });
const RedZoneDashboard = dynamic(() => import('@/components/arena/RedZoneDashboard'), { ssr: false });
const GlitchArenaWorld = dynamic(() => import('@/components/arena/GlitchArenaWorld'), {
  ssr: false,
  loading: () => (
    <div className="flex flex-col items-center justify-center w-full h-full bg-arena-black"
      style={{ fontFamily: "'Courier New',monospace", color: '#c9a84c' }}>
      <div style={{ fontSize: '32px', marginBottom: '16px' }}>⚔️</div>
      <div style={{ fontSize: '14px', fontWeight: 900, letterSpacing: '4px', marginBottom: '8px' }}>GLITCH ARENA</div>
      <div style={{ fontSize: '10px', color: '#3a3020', letterSpacing: '2px' }}>LOADING 3D WORLD...</div>
    </div>
  ),
});

// Seeded pseudo-random number generator — produces identical output on server AND client.
// This is the ONLY correct way to use random values in SSR-rendered React components.
function createSeededRng(seed: number) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) & 0xffffffff;
    return (s >>> 0) / 0xffffffff;
  };
}

function createMockGameState(matchId: string, agentCount: number, seed: number): GameState {
  const rng = createSeededRng(seed);
  const agents: Record<string, import('@/lib/types/game-state').AgentGameState> = {};
  const agentIds = ['primus', 'cerberus', 'solarius', 'aurum', 'mythion', 'arion', 'vanguard', 'oracle'].slice(0, agentCount);

  agentIds.forEach((id, i) => {
    const angle = (i / agentCount) * Math.PI * 2;
    const radius = 6;
    agents[id] = {
      agentId: id,
      position: { x: Math.round(10 + radius * Math.cos(angle)), y: Math.round(10 + radius * Math.sin(angle)) },
      hp: Math.round(rng() * 60) + 40,
      maxHp: 100,
      credits: Math.round(rng() * 1000) + 200,
      shields: 0,
      statusEffects: [],
      actionsUsed: 0,
      maxActions: 3,
      isEliminated: false,
      isGhost: false,
      emotionalState: { primary: 'focused', intensity: 0.7, triggers: [] },
      visibleTiles: [],
    };
  });

  const tiles = Array.from({ length: 20 }, (_, y) =>
    Array.from({ length: 20 }, (_, x) => {
      const r = rng();
      return {
        position: { x, y },
        terrain: (r < 0.1 ? (rng() < 0.5 ? 'mountains' : 'forest') : 'plains') as import('@/lib/types/game-state').TerrainType,
        isVisible: true,
        hasResource: rng() < 0.08,
        resourceType: 'credits',
        resourceAmount: 100,
        hasHazard: rng() < 0.03,
      };
    })
  );

  return {
    matchId,
    status: 'RUNNING',
    gameMode: 'STANDARD_ELIMINATION',
    currentPhase: 'COMPETITION',
    currentTurn: Math.round(rng() * 20) + 5,
    maxTurns: 100,
    dramaScore: Math.round(rng() * 60) + 10,
    board: { tiles, width: 20, height: 20, turn: 15, phase: 'COMPETITION', activeHazards: [], allianceMap: {} },
    agents,
    eventLog: [],
  };
}

// Fixed seeds — server and client will always produce identical HTML for these initial states
const INITIAL_STATES: GameState[] = [
  createMockGameState('match-1', 8, 42),
  createMockGameState('match-2', 6, 137),
  createMockGameState('match-3', 4, 99),
  createMockGameState('match-4', 6, 256),
];

const AGENT_PROFILES: Record<string, { name: string; signatureColor: string; veritasTier: VERITASTier }> = {
  primus:   { name: 'PRIMUS',   signatureColor: '#FFD700', veritasTier: 'RELIABLE' },
  cerberus: { name: 'CERBERUS', signatureColor: '#708090', veritasTier: 'PARAGON' },
  solarius: { name: 'SOLARIUS', signatureColor: '#FF6B35', veritasTier: 'RELIABLE' },
  aurum:    { name: 'AURUM',    signatureColor: '#FFBF00', veritasTier: 'UNCERTAIN' },
  mythion:  { name: 'MYTHION',  signatureColor: '#8B5CF6', veritasTier: 'DECEPTIVE' },
  arion:    { name: 'ARION',    signatureColor: '#06B6D4', veritasTier: 'RELIABLE' },
  vanguard: { name: 'VANGUARD', signatureColor: '#14B8A6', veritasTier: 'PARAGON' },
  oracle:   { name: 'ORACLE',   signatureColor: '#6366F1', veritasTier: 'RELIABLE' },
};

type ViewMode = 'world' | 'single' | 'redzoneA' | 'redzoneB';

export default function ArenaViewerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('world');
  // Use deterministic initial states — no Math.random() in useState initializer
  const [gameStates, setGameStates] = useState<GameState[]>(INITIAL_STATES);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [showPIP, setShowPIP] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Drama score simulation — only runs client-side after hydration completes
  useEffect(() => {
    intervalRef.current = setInterval(() => {
      setGameStates(prev => prev.map(gs => ({
        ...gs,
        dramaScore: Math.min(100, Math.max(0, gs.dramaScore + (Math.random() - 0.45) * 10)),
        currentTurn: gs.currentTurn + 1,
      })));
    }, 3000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, []);

  const primaryState = gameStates[0];

  return (
    <div className="flex flex-col h-screen bg-arena-black">
      {/* Top nav */}
      <div className="flex items-center justify-between px-6 py-3 bg-arena-dark border-b border-arena-border">
        <div className="flex items-center gap-4">
          <h1 className="font-orbitron text-lg text-neon-green uppercase tracking-widest">
            Glitch Arena
          </h1>
          <div className="w-px h-5 bg-arena-border" />
          <span className="text-xs font-jetbrains text-gray-400">
            Season 1 — Episode 7
          </span>
        </div>

        {/* View mode selector */}
        <div className="flex gap-1">
          {([
            { id: 'world',    label: '🌍 World' },
            { id: 'single',   label: 'Single' },
            { id: 'redzoneA', label: 'RedZone 2x1' },
            { id: 'redzoneB', label: 'RedZone 2x2' },
          ] as const).map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id)}
              className={`px-3 py-1.5 text-xs font-orbitron uppercase border transition-all ${
                viewMode === id
                  ? 'bg-neon-green/20 border-neon-green text-neon-green'
                  : 'bg-arena-surface border-arena-border text-gray-400 hover:border-neon-green hover:text-neon-green'
              }`}
            >
              {label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setShowPIP(!showPIP)}
            className={`px-3 py-1.5 text-xs font-orbitron uppercase border transition-all ${
              showPIP
                ? 'bg-neon-pink/20 border-neon-pink text-neon-pink'
                : 'bg-arena-surface border-arena-border text-gray-400'
            }`}
          >
            PIP
          </button>
          <div className="w-2 h-2 rounded-full bg-neon-green animate-pulse" />
          <span className="text-xs font-jetbrains text-neon-green">LIVE</span>
        </div>
      </div>

      {/* Main content */}
      <div className="flex-1 min-h-0" style={{ position: 'relative' }}>
        {viewMode === 'world' ? (
          <div style={{ position: 'absolute', inset: 0 }}>
            <GlitchArenaWorld />
          </div>
        ) : viewMode === 'single' ? (
          <Arena3D
            gameState={primaryState}
            agentProfiles={AGENT_PROFILES}
            selectedAgentId={selectedAgent}
            onAgentSelect={setSelectedAgent}
            showPIP={showPIP}
            pipMatchState={gameStates[1]}
            pipAgentProfiles={AGENT_PROFILES}
            className="w-full h-full"
          />
        ) : (
          <RedZoneDashboard
            matches={gameStates.map((gs, i) => ({
              matchId: gs.matchId,
              gameState: gs,
              agentProfiles: AGENT_PROFILES,
              title: `Match ${i + 1}`,
            }))}
            autoSwitch={true}
            switchInterval={15000}
          />
        )}
      </div>

      {/* Bottom agent status bar
          suppressHydrationWarning on the HP bar width div:
          The width% is computed from seeded-RNG hp values so server==client,
          but suppressHydrationWarning is a safety net for any floating-point drift. */}
      <div className="flex items-center gap-2 px-4 py-2 bg-arena-dark border-t border-arena-border overflow-x-auto">
        {Object.entries(primaryState.agents).map(([agentId, agentState]) => {
          const profile = AGENT_PROFILES[agentId];
          if (!profile) return null;
          const hpPct = Math.round((agentState.hp / agentState.maxHp) * 100);
          const hpColor = hpPct > 50 ? '#39FF14' : hpPct > 25 ? '#FFD60A' : '#FF006E';
          return (
            <button
              key={agentId}
              onClick={() => setSelectedAgent(selectedAgent === agentId ? undefined : agentId)}
              className={`flex items-center gap-2 px-3 py-1.5 border transition-all flex-shrink-0 ${
                selectedAgent === agentId
                  ? 'border-neon-green bg-neon-green/10'
                  : 'border-arena-border bg-arena-surface hover:border-gray-500'
              } ${agentState.isEliminated ? 'opacity-40' : ''}`}
            >
              <div className="w-2 h-2 rounded-full" style={{ background: profile.signatureColor }} />
              <span className="text-xs font-orbitron" style={{ color: profile.signatureColor }}>
                {profile.name}
              </span>
              <div className="w-16 h-1 bg-arena-border rounded-full overflow-hidden">
                <div
                  suppressHydrationWarning
                  className="h-full rounded-full transition-all"
                  style={{ width: `${hpPct}%`, background: hpColor }}
                />
              </div>
              <span suppressHydrationWarning className="text-xs font-jetbrains text-gray-400">
                {agentState.hp}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
