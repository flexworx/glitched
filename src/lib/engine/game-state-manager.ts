/**
 * RADF v3 — Game State Manager
 * Authoritative, deterministic game state transitions.
 * All 16 action types. No Math.random() — uses SeededRNG.
 */
import type { GameState, AgentGameState, GamePhase, GameEvent } from '@/lib/types/game-state';
import type { AgentAction } from '@/lib/types/game-state';
import { SeededRNG } from './seeded-rng';

export function createInitialGameState(
  matchId: string,
  agentIds: string[],
  gameMode = 'STANDARD_ELIMINATION',
  seed?: number
): GameState {
  const rng = new SeededRNG(seed ?? Date.now());
  const spawnPoints = generateSpawnPoints(agentIds.length);
  const board = createInitialBoard(10, 10, rng);
  const agents: Record<string, AgentGameState> = {};
  agentIds.forEach((agentId, index) => {
    const sp = spawnPoints[index] || { x: index * 3, y: 0 };
    agents[agentId] = {
      agentId, position: sp, hp: 100, maxHp: 100, credits: 500,
      shields: 0, statusEffects: [], actionsUsed: 0, maxActions: 3,
      isEliminated: false, isGhost: false,
      emotionalState: { primary: 'neutral', intensity: 0.5, triggers: [] },
      visibleTiles: [], alliances: [], trustMap: {}, inventory: [],
    };
    board.tiles[sp.y][sp.x].occupantId = agentId;
  });
  return {
    matchId, status: 'LOBBY' as any, gameMode: gameMode as any, currentPhase: 'COURTSHIP' as any,
    currentTurn: 0, maxTurns: 100, dramaScore: 0, board, agents, eventLog: [],
    seed: seed ?? Date.now(),
  };
}

function generateSpawnPoints(count: number): Array<{ x: number; y: number }> {
  return [
    { x: 1, y: 1 }, { x: 8, y: 1 }, { x: 1, y: 8 }, { x: 8, y: 8 },
    { x: 4, y: 1 }, { x: 1, y: 4 }, { x: 8, y: 4 }, { x: 4, y: 8 },
  ].slice(0, count);
}

function createInitialBoard(width: number, height: number, rng: SeededRNG) {
  const tiles: any[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        position: { x, y }, terrain: 'plains', isVisible: false,
        hasResource: rng.chance(0.1),
        resourceType: rng.chance(0.5) ? 'credits' : 'heal',
        resourceAmount: rng.int(50, 250), hasHazard: false,
      };
    }
  }
  for (let i = 0; i < Math.floor(width * height * 0.1); i++) {
    tiles[rng.int(0, height - 1)][rng.int(0, width - 1)].terrain = rng.chance(0.5) ? 'mountains' : 'forest';
  }
  return { tiles, width, height, turn: 0, phase: 'COURTSHIP' as any, activeHazards: [], allianceMap: {} };
}

export function advanceTurn(gameState: GameState): GameState {
  const newTurn = gameState.currentTurn + 1;
  const newPhase = determinePhase(newTurn, gameState);
  const resetAgents = Object.fromEntries(
    Object.entries(gameState.agents).map(([id, s]) => [id, { ...s, actionsUsed: 0 }])
  );
  return { ...gameState, currentTurn: newTurn, currentPhase: newPhase, agents: resetAgents,
    board: { ...gameState.board, turn: newTurn, phase: newPhase } };
}

function determinePhase(turn: number, gs: GameState): GamePhase {
  const alive = Object.values(gs.agents).filter((a) => !a.isEliminated).length;
  const total = Object.keys(gs.agents).length;
  if (turn <= 10) return 'COURTSHIP';
  if (turn <= 25) return 'ALLIANCE';
  if (alive > total * 0.5) return 'COMPETITION';
  if (alive > 2) return 'ELIMINATION';
  return 'FINALE';
}

export function applyAction(
  gameState: GameState, agentId: string, action: AgentAction, rng: SeededRNG
): { newState: GameState; events: GameEvent[] } {
  const events: GameEvent[] = [];
  const ns = { ...gameState, agents: { ...gameState.agents } };
  const ag = { ...ns.agents[agentId] };
  if (ag.isEliminated) return { newState: ns, events };

  switch (action.type) {
    case 'MOVE': {
      if (action.targetPosition) {
        const op = ag.position;
        ns.board = { ...ns.board, tiles: ns.board.tiles.map((row: any[], y: number) =>
          row.map((t: any, x: number) => {
            if (x === op.x && y === op.y) return { ...t, occupantId: undefined };
            if (x === action.targetPosition!.x && y === action.targetPosition!.y) return { ...t, occupantId: agentId };
            return t;
          })) };
        ag.position = action.targetPosition; ag.actionsUsed++;
      }
      break;
    }
    case 'ATTACK': {
      if (action.targetId && ns.agents[action.targetId]) {
        const tgt = { ...ns.agents[action.targetId] };
        const dmg = rng.int(10, 30);
        const blk = Math.min(tgt.shields, dmg);
        tgt.shields = Math.max(0, tgt.shields - blk);
        tgt.hp = Math.max(0, tgt.hp - (dmg - blk));
        if (tgt.hp === 0) { tgt.isEliminated = true; events.push({ type: 'ELIMINATION', description: `${agentId} eliminated ${action.targetId}!`, agentIds: [agentId, action.targetId], dramaContribution: 35, timestamp: new Date() }); }
        else { events.push({ type: 'COMBAT', description: `${agentId} attacked ${action.targetId} for ${dmg - blk} damage`, agentIds: [agentId, action.targetId], dramaContribution: 20, timestamp: new Date() }); }
        ns.agents[action.targetId] = tgt; ag.actionsUsed++;
      }
      break;
    }
    case 'DEFEND': {
      const sh = rng.int(15, 35); ag.shields = Math.min(100, ag.shields + sh); ag.actionsUsed++;
      events.push({ type: 'ACTION', description: `${agentId} raised shields (+${sh})`, agentIds: [agentId], dramaContribution: 5, timestamp: new Date() });
      break;
    }
    case 'HEAL': {
      if (ag.credits >= 200) { const h = rng.int(20, 40); ag.hp = Math.min(ag.maxHp, ag.hp + h); ag.credits -= 200; ag.actionsUsed++; events.push({ type: 'ACTION', description: `${agentId} healed for ${h} HP`, agentIds: [agentId], dramaContribution: 5, timestamp: new Date() }); }
      break;
    }
    case 'COLLECT_RESOURCE': {
      const tile = ns.board.tiles[ag.position.y][ag.position.x];
      if (tile.hasResource) {
        const resAmt = tile.resourceAmount ?? 0;
        if (tile.resourceType === 'credits') ag.credits += resAmt;
        else ag.hp = Math.min(ag.maxHp, ag.hp + resAmt);
        ns.board.tiles[ag.position.y][ag.position.x] = { ...tile, hasResource: false };
        ag.actionsUsed++; events.push({ type: 'ACTION', description: `${agentId} collected ${tile.resourceType}`, agentIds: [agentId], dramaContribution: 3, timestamp: new Date() });
      }
      break;
    }
    case 'PROPOSE_DEAL': {
      if (action.targetId) { events.push({ type: 'NEGOTIATION', description: `${agentId} proposed a deal to ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 15, timestamp: new Date(), metadata: { pending: true } }); ag.actionsUsed++; }
      break;
    }
    case 'ACCEPT_DEAL': {
      if (action.targetId) {
        if (!ag.alliances) ag.alliances = []; ag.alliances.push(action.targetId);
        const p = { ...ns.agents[action.targetId] }; if (!p.alliances) p.alliances = []; p.alliances.push(agentId); ns.agents[action.targetId] = p;
        events.push({ type: 'ALLIANCE', description: `${agentId} accepted deal from ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 20, timestamp: new Date() }); ag.actionsUsed++;
      }
      break;
    }
    case 'REJECT_DEAL': {
      if (action.targetId) { events.push({ type: 'NEGOTIATION', description: `${agentId} rejected deal from ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 10, timestamp: new Date() }); ag.actionsUsed++; }
      break;
    }
    case 'BRIBE': {
      if (action.targetId && ns.agents[action.targetId]) {
        const amt = (action.payload?.amount as number) ?? 100;
        if (ag.credits >= amt) {
          ag.credits -= amt; const t2 = { ...ns.agents[action.targetId] }; t2.credits += amt;
          const ok = rng.chance(Math.min(0.8, amt / 500)); ns.agents[action.targetId] = t2;
          events.push({ type: 'NEGOTIATION', description: ok ? `${agentId} bribed ${action.targetId}` : `${action.targetId} rejected bribe`, agentIds: [agentId, action.targetId], dramaContribution: ok ? 25 : 15, timestamp: new Date(), metadata: { success: ok, amount: amt } }); ag.actionsUsed++;
        }
      }
      break;
    }
    case 'SPY': {
      if (action.targetId && ns.agents[action.targetId]) {
        const t3 = ns.agents[action.targetId];
        events.push({ type: 'ACTION', description: `${agentId} spied on ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 10, timestamp: new Date(), metadata: { revealedHp: t3.hp, revealedCredits: t3.credits } }); ag.actionsUsed++;
      }
      break;
    }
    case 'SABOTAGE': {
      if (action.targetId && ns.agents[action.targetId]) {
        const t4 = { ...ns.agents[action.targetId] }; const loss = rng.int(50, 200); t4.credits = Math.max(0, t4.credits - loss); ns.agents[action.targetId] = t4;
        events.push({ type: 'COMBAT', description: `${agentId} sabotaged ${action.targetId} (-${loss} credits)`, agentIds: [agentId, action.targetId], dramaContribution: 20, timestamp: new Date() }); ag.actionsUsed++;
      }
      break;
    }
    case 'CALL_ALLIANCE': {
      if (action.targetId) { events.push({ type: 'ALLIANCE', description: `${agentId} called on alliance with ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 15, timestamp: new Date() }); ag.actionsUsed++; }
      break;
    }
    case 'BETRAY_ALLIANCE': {
      if (action.targetId) {
        ag.alliances = (ag.alliances ?? []).filter((id) => id !== action.targetId);
        const bt = { ...ns.agents[action.targetId] }; bt.alliances = (bt.alliances ?? []).filter((id) => id !== agentId);
        if (!bt.trustMap) bt.trustMap = {}; bt.trustMap[agentId] = -100; ns.agents[action.targetId] = bt;
        events.push({ type: 'BETRAYAL', description: `${agentId} BETRAYED ${action.targetId}!`, agentIds: [agentId, action.targetId], dramaContribution: 50, timestamp: new Date() }); ag.actionsUsed++;
      }
      break;
    }
    case 'ACTIVATE_ABILITY': {
      const ab = (action.payload?.abilityId as string) ?? 'unknown';
      events.push({ type: 'ACTION', description: `${agentId} activated ability: ${ab}`, agentIds: [agentId], dramaContribution: 20, timestamp: new Date(), metadata: { abilityId: ab } }); ag.actionsUsed++;
      break;
    }
    case 'SEND_MESSAGE': {
      if (action.targetId) { events.push({ type: 'MESSAGE', description: `${agentId} messaged ${action.targetId}`, agentIds: [agentId, action.targetId], dramaContribution: 5, timestamp: new Date(), metadata: { message: action.payload?.message } }); ag.actionsUsed++; }
      break;
    }
    case 'PASS':
    default: break;
  }

  ns.agents[agentId] = ag;
  return { newState: ns, events };
}

export function calculateDramaScore(events: GameEvent[], currentScore: number): number {
  return Math.min(100, currentScore * 0.95 + events.reduce((s, e) => s + (e.dramaContribution ?? 0), 0));
}
