import type { GameState, BoardState, AgentGameState, GamePhase, GameMode, TileState } from '../types/game-state';

export function createInitialGameState(
  matchId: string,
  agentIds: string[],
  arenaConfig: { width: number; height: number; spawnPoints: Array<{ x: number; y: number }> },
  gameMode: GameMode
): GameState {
  const board = createInitialBoard(arenaConfig.width, arenaConfig.height);
  const agents: Record<string, AgentGameState> = {};

  agentIds.forEach((agentId, index) => {
    const spawnPoint = arenaConfig.spawnPoints[index] || { x: index * 3, y: 0 };
    agents[agentId] = {
      agentId,
      position: spawnPoint,
      hp: 100,
      maxHp: 100,
      credits: 500,
      shields: 0,
      statusEffects: [],
      actionsUsed: 0,
      maxActions: 3,
      isEliminated: false,
      isGhost: false,
      emotionalState: { primary: 'neutral', intensity: 0.5, triggers: [] },
      visibleTiles: [],
    };
    board.tiles[spawnPoint.y][spawnPoint.x].occupantId = agentId;
  });

  return {
    matchId,
    status: 'LOBBY',
    gameMode,
    currentPhase: 'COURTSHIP',
    currentTurn: 0,
    maxTurns: 100,
    dramaScore: 0,
    board,
    agents,
    eventLog: [],
  };
}

function createInitialBoard(width: number, height: number): BoardState {
  const tiles: TileState[][] = [];
  for (let y = 0; y < height; y++) {
    tiles[y] = [];
    for (let x = 0; x < width; x++) {
      tiles[y][x] = {
        position: { x, y },
        terrain: 'plains',
        isVisible: false,
        hasResource: Math.random() < 0.1,
        resourceType: Math.random() < 0.5 ? 'credits' : 'heal',
        resourceAmount: Math.floor(Math.random() * 200) + 50,
        hasHazard: false,
      };
    }
  }
  // Add some terrain variety
  for (let i = 0; i < Math.floor(width * height * 0.1); i++) {
    const x = Math.floor(Math.random() * width);
    const y = Math.floor(Math.random() * height);
    tiles[y][x].terrain = Math.random() < 0.5 ? 'mountains' : 'forest';
  }
  return { tiles, width, height, turn: 0, phase: 'COURTSHIP', activeHazards: [], allianceMap: {} };
}

export function advanceTurn(gameState: GameState): GameState {
  const newTurn = gameState.currentTurn + 1;
  const newPhase = determinePhase(newTurn, gameState);
  const resetAgents = Object.fromEntries(
    Object.entries(gameState.agents).map(([id, state]) => [
      id,
      { ...state, actionsUsed: 0 },
    ])
  );
  return {
    ...gameState,
    currentTurn: newTurn,
    currentPhase: newPhase,
    agents: resetAgents,
    board: { ...gameState.board, turn: newTurn, phase: newPhase },
  };
}

function determinePhase(turn: number, gameState: GameState): GamePhase {
  const aliveCount = Object.values(gameState.agents).filter(a => !a.isEliminated).length;
  const totalCount = Object.keys(gameState.agents).length;
  if (turn <= 10) return 'COURTSHIP';
  if (turn <= 25) return 'ALLIANCE';
  if (aliveCount > totalCount * 0.5) return 'COMPETITION';
  if (aliveCount > 2) return 'ELIMINATION';
  return 'FINALE';
}

export function applyAction(
  gameState: GameState,
  agentId: string,
  action: import('../types/game-state').AgentAction
): { newState: GameState; events: import('../types/game-state').GameEvent[] } {
  const events: import('../types/game-state').GameEvent[] = [];
  let newState = { ...gameState };
  const agentState = { ...newState.agents[agentId] };

  switch (action.type) {
    case 'MOVE': {
      if (action.targetPosition) {
        const oldPos = agentState.position;
        newState.board.tiles[oldPos.y][oldPos.x] = { ...newState.board.tiles[oldPos.y][oldPos.x], occupantId: undefined };
        agentState.position = action.targetPosition;
        newState.board.tiles[action.targetPosition.y][action.targetPosition.x] = {
          ...newState.board.tiles[action.targetPosition.y][action.targetPosition.x],
          occupantId: agentId,
        };
        agentState.actionsUsed += 1;
      }
      break;
    }
    case 'ATTACK': {
      if (action.targetId && newState.agents[action.targetId]) {
        const target = { ...newState.agents[action.targetId] };
        const damage = Math.floor(Math.random() * 20) + 10;
        target.hp = Math.max(0, target.hp - damage);
        if (target.hp === 0) {
          target.isEliminated = true;
          events.push({
            type: 'ELIMINATION',
            description: `${agentId} eliminated ${action.targetId}!`,
            agentIds: [agentId, action.targetId],
            dramaContribution: 35,
            timestamp: new Date(),
          });
        } else {
          events.push({
            type: 'COMBAT',
            description: `${agentId} attacked ${action.targetId} for ${damage} damage`,
            agentIds: [agentId, action.targetId],
            dramaContribution: 30,
            timestamp: new Date(),
          });
        }
        newState.agents = { ...newState.agents, [action.targetId]: target };
        agentState.actionsUsed += 1;
      }
      break;
    }
    case 'HEAL': {
      const healAmount = 30;
      agentState.hp = Math.min(agentState.maxHp, agentState.hp + healAmount);
      agentState.credits -= 200;
      agentState.actionsUsed += 1;
      break;
    }
    case 'PASS':
    default:
      break;
  }

  newState.agents = { ...newState.agents, [agentId]: agentState };
  return { newState, events };
}
