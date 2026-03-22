'use client';
import { useState, useEffect } from 'react';
import dynamic from 'next/dynamic';
import type { GameState } from '@/lib/types/game-state';
import type { VERITASTier } from '@/lib/types/agent';

// Seeded RNG — ensures server/client render identical HTML (no hydration mismatch)
function seededRng(seed: number) {
  let s = seed;
  return () => { s = (s * 1664525 + 1013904223) & 0xffffffff; return (s >>> 0) / 0xffffffff; };
}

const RedZoneDashboard = dynamic(() => import('@/components/arena/RedZoneDashboard'), { ssr: false });

function createMockGameState(matchId: string, agentCount: number = 6): GameState {
  const rng = seededRng(matchId.charCodeAt(matchId.length - 1) * 31 + agentCount);
  const agents: Record<string, import('@/lib/types/game-state').AgentGameState> = {};
  const agentIds = ['primus', 'cerberus', 'solarius', 'aurum', 'mythion', 'arion', 'vanguard', 'oracle'].slice(0, agentCount);
  agentIds.forEach((id, i) => {
    const angle = (i / agentCount) * Math.PI * 2;
    agents[id] = {
      agentId: id, position: { x: Math.round(10 + 6 * Math.cos(angle)), y: Math.round(10 + 6 * Math.sin(angle)) },
      hp: Math.round(rng() * 60) + 40, maxHp: 100, credits: 500, shields: 0,
      statusEffects: [], actionsUsed: 0, maxActions: 3, isEliminated: false, isGhost: false,
      emotionalState: { primary: 'focused', intensity: 0.7, triggers: [] }, visibleTiles: [],
    };
  });
  const tiles = Array.from({ length: 20 }, (_, y) => Array.from({ length: 20 }, (_, x) => ({
    position: { x, y }, terrain: 'plains' as import('@/lib/types/game-state').TerrainType,
    isVisible: true, hasResource: false, resourceType: 'credits', resourceAmount: 0, hasHazard: false,
  })));
  return {
    matchId, status: 'RUNNING', gameMode: 'STANDARD_ELIMINATION', currentPhase: 'COMPETITION',
    currentTurn: Math.round(rng() * 20) + 5, maxTurns: 100,
    dramaScore: Math.round(rng() * 60) + 10,
    board: { tiles, width: 20, height: 20, turn: 15, phase: 'COMPETITION', activeHazards: [], allianceMap: {} },
    agents, eventLog: [],
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

export default function RedZonePage() {
  const [gameStates, setGameStates] = useState<GameState[]>([
    createMockGameState('match-1', 8),
    createMockGameState('match-2', 6),
    createMockGameState('match-3', 4),
    createMockGameState('match-4', 6),
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setGameStates(prev => prev.map(gs => ({
        ...gs,
        dramaScore: Math.min(100, Math.max(0, gs.dramaScore + (Math.random() - 0.45) * 10)),
        currentTurn: gs.currentTurn + 1,
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="h-screen bg-arena-black">
      <RedZoneDashboard
        matches={gameStates.map((gs, i) => ({
          matchId: gs.matchId,
          gameState: gs,
          agentProfiles: AGENT_PROFILES,
          title: `Match ${i + 1}`,
        }))}
        autoSwitch={true}
        switchInterval={12000}
      />
    </div>
  );
}
