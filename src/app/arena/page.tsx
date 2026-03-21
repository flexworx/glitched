'use client';

import { useState, useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import dynamic from 'next/dynamic';
import type { GameState } from '@/lib/types/game-state';
import type { VERITASTier } from '@/lib/types/agent';

// Dynamic import to avoid SSR issues with Three.js
const Arena3D = dynamic(() => import('@/components/arena/Arena3D'), { ssr: false });
const RedZoneDashboard = dynamic(() => import('@/components/arena/RedZoneDashboard'), { ssr: false });

// Mock game state for demo
function createMockGameState(matchId: string, agentCount: number = 6): GameState {
  const agents: Record<string, import('@/lib/types/game-state').AgentGameState> = {};
  const agentIds = ['primus', 'cerberus', 'solarius', 'aurum', 'mythion', 'arion', 'vanguard', 'oracle'].slice(0, agentCount);
  
  agentIds.forEach((id, i) => {
    const angle = (i / agentCount) * Math.PI * 2;
    const radius = 6;
    agents[id] = {
      agentId: id,
      position: { x: Math.round(10 + radius * Math.cos(angle)), y: Math.round(10 + radius * Math.sin(angle)) },
      hp: Math.floor(Math.random() * 60) + 40,
      maxHp: 100,
      credits: Math.floor(Math.random() * 1000) + 200,
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
    Array.from({ length: 20 }, (_, x) => ({
      position: { x, y },
      terrain: Math.random() < 0.1 ? (Math.random() < 0.5 ? 'mountains' : 'forest') : 'plains' as import('@/lib/types/game-state').TerrainType,
      isVisible: true,
      hasResource: Math.random() < 0.08,
      resourceType: 'credits',
      resourceAmount: 100,
      hasHazard: Math.random() < 0.03,
    }))
  );

  return {
    matchId,
    status: 'RUNNING',
    gameMode: 'STANDARD_ELIMINATION',
    currentPhase: 'COMPETITION',
    currentTurn: Math.floor(Math.random() * 30) + 10,
    maxTurns: 100,
    dramaScore: Math.random() * 80 + 10,
    board: { tiles, width: 20, height: 20, turn: 15, phase: 'COMPETITION', activeHazards: [], allianceMap: {} },
    agents,
    eventLog: [],
  };
}

const AGENT_PROFILES: Record<string, { name: string; signatureColor: string; veritasTier: VERITASTier }> = {
  primus: { name: 'PRIMUS', signatureColor: '#FFD700', veritasTier: 'RELIABLE' },
  cerberus: { name: 'CERBERUS', signatureColor: '#708090', veritasTier: 'PARAGON' },
  solarius: { name: 'SOLARIUS', signatureColor: '#FF6B35', veritasTier: 'RELIABLE' },
  aurum: { name: 'AURUM', signatureColor: '#FFBF00', veritasTier: 'UNCERTAIN' },
  mythion: { name: 'MYTHION', signatureColor: '#8B5CF6', veritasTier: 'DECEPTIVE' },
  arion: { name: 'ARION', signatureColor: '#06B6D4', veritasTier: 'RELIABLE' },
  vanguard: { name: 'VANGUARD', signatureColor: '#14B8A6', veritasTier: 'PARAGON' },
  oracle: { name: 'ORACLE', signatureColor: '#6366F1', veritasTier: 'RELIABLE' },
};

type ViewMode = 'single' | 'redzoneA' | 'redzoneB' | 'redzoneC';

export default function ArenaViewerPage() {
  const [viewMode, setViewMode] = useState<ViewMode>('single');
  const [gameStates, setGameStates] = useState<GameState[]>([
    createMockGameState('match-1', 8),
    createMockGameState('match-2', 6),
    createMockGameState('match-3', 4),
    createMockGameState('match-4', 6),
  ]);
  const [selectedAgent, setSelectedAgent] = useState<string | undefined>();
  const [showPIP, setShowPIP] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  // Simulate drama score changes
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
          {[
            { id: 'single', label: 'Single' },
            { id: 'redzoneA', label: 'RedZone 2x1' },
            { id: 'redzoneB', label: 'RedZone 2x2' },
          ].map(({ id, label }) => (
            <button
              key={id}
              onClick={() => setViewMode(id as ViewMode)}
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
      <div className="flex-1 min-h-0">
        {viewMode === 'single' ? (
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

      {/* Bottom agent status bar */}
      <div className="flex items-center gap-2 px-4 py-2 bg-arena-dark border-t border-arena-border overflow-x-auto">
        {Object.entries(primaryState.agents).map(([agentId, agentState]) => {
          const profile = AGENT_PROFILES[agentId];
          if (!profile) return null;
          const hpPct = (agentState.hp / agentState.maxHp) * 100;
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
                  className="h-full rounded-full transition-all"
                  style={{
                    width: `${hpPct}%`,
                    background: hpPct > 50 ? '#39FF14' : hpPct > 25 ? '#FFD60A' : '#FF006E',
                  }}
                />
              </div>
              <span className="text-xs font-jetbrains text-gray-400">{agentState.hp}</span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
