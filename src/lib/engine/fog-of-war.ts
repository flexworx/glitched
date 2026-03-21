import type { GameState, Position } from '../types/game-state';

const DEFAULT_VISION_RANGE = 5;

export function getFogFilteredState(agentId: string, gameState: GameState): GameState {
  const agentState = gameState.agents[agentId];
  if (!agentState) return gameState;
  const visibleTiles = getVisibleTiles(agentState.position, gameState);
  const visibleSet = new Set(visibleTiles.map(p => `${p.x},${p.y}`));
  const filteredBoard = {
    ...gameState.board,
    tiles: gameState.board.tiles.map((row, y) =>
      row.map((tile, x) => ({
        ...tile,
        isVisible: visibleSet.has(`${x},${y}`),
        occupantId: visibleSet.has(`${x},${y}`) ? tile.occupantId : undefined,
      }))
    ),
  };
  const filteredAgents = Object.fromEntries(
    Object.entries(gameState.agents).map(([id, state]) => {
      if (id === agentId) return [id, state];
      const posKey = `${state.position.x},${state.position.y}`;
      if (!visibleSet.has(posKey)) return [id, { ...state, position: { x: -1, y: -1 } }];
      return [id, state];
    })
  );
  return { ...gameState, board: filteredBoard, agents: filteredAgents };
}

export function getVisibleTiles(position: Position, gameState: GameState): Position[] {
  const visible: Position[] = [];
  const range = DEFAULT_VISION_RANGE;
  for (let dy = -range; dy <= range; dy++) {
    for (let dx = -range; dx <= range; dx++) {
      const x = position.x + dx;
      const y = position.y + dy;
      if (x < 0 || y < 0 || x >= gameState.board.width || y >= gameState.board.height) continue;
      if (Math.sqrt(dx * dx + dy * dy) <= range) {
        visible.push({ x, y });
      }
    }
  }
  return visible;
}
