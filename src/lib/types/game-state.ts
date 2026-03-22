// Game state types for Glitched.gg
export type GamePhase = 'COURTSHIP' | 'ALLIANCE' | 'COMPETITION' | 'ELIMINATION' | 'FINALE';
export type MatchStatus = 'SCHEDULED' | 'LOBBY' | 'RUNNING' | 'PAUSED' | 'COMPLETED' | 'CANCELLED' | 'EMERGENCY_STOPPED';
export type GameMode = 'STANDARD_ELIMINATION' | 'ALLIANCE_WARS' | 'PURGE' | 'GAUNTLET' | 'BETRAYAL' | 'HIGH_STAKES' | 'THE_MAZE' | 'THE_DUEL' | 'CHAMPIONSHIP' | 'CUSTOM';

export type TerrainType = 'plains' | 'mountains' | 'water' | 'forest' | 'lava' | 'crystal' | 'ruins' | 'void';
export type HazardType = 'fire' | 'poison' | 'ice' | 'storm' | 'earthquake' | 'flood';

export interface Position {
  x: number;
  y: number;
}

export interface TileState {
  position: Position;
  terrain: TerrainType;
  isVisible: boolean;
  hasResource: boolean;
  resourceType?: string;
  resourceAmount?: number;
  hasHazard: boolean;
  hazardType?: HazardType;
  hazardDamage?: number;
  occupantId?: string;
}

export interface AgentGameState {
  agentId: string;
  position: Position;
  hp: number;
  maxHp: number;
  credits: number;
  shields: number;
  statusEffects: StatusEffect[];
  actionsUsed: number;
  maxActions: number;
  isEliminated: boolean;
  isGhost: boolean;
  emotionalState: EmotionalState;
  visibleTiles: Position[];
  // RADF v3 extended fields
  alliances?: string[];
  trustMap?: Record<string, number>;
  inventory?: string[];
}

export interface StatusEffect {
  type: string;
  duration: number;
  magnitude: number;
  source: string;
}

export interface EmotionalState {
  primary: string;
  intensity: number;
  triggers: string[];
}

export interface BoardState {
  tiles: TileState[][];
  width: number;
  height: number;
  turn: number;
  phase: GamePhase;
  activeHazards: ActiveHazard[];
  allianceMap: Record<string, string[]>;
}

export interface ActiveHazard {
  type: HazardType;
  affectedTiles: Position[];
  duration: number;
  damage: number;
}

export interface Alliance {
  id: string;
  members: string[];
  formedAt: number;
  strength: number;
}

export interface DramaticEvent {
  type: string;
  position: Position;
  agentIds: string[];
  timestamp: Date;
}

export interface GameState {
  matchId: string;
  status: MatchStatus;
  gameMode: GameMode;
  currentPhase: GamePhase;
  currentTurn: number;
  maxTurns: number;
  dramaScore: number;
  board: BoardState;
  agents: Record<string, AgentGameState>;
  eventLog: GameEvent[];
  startedAt?: Date;
  // Optional extended fields used by Arena3D and RedZone
  alliances?: Alliance[];
  activeCombatPositions?: Position[];
  lastDramaticEvent?: DramaticEvent;
  seed?: number;
}

export interface GameEvent {
  type: string;
  description: string;
  agentIds: string[];
  position?: Position;
  dramaContribution: number;
  timestamp: Date;
  metadata?: Record<string, unknown>;
}

export interface AgentAction {
  type: ActionType;
  targetId?: string;
  targetPosition?: Position;
  data?: Record<string, unknown>;
  payload?: Record<string, unknown>;
}

export type ActionType =
  | 'MOVE'
  | 'ATTACK'
  | 'DEFEND'
  | 'HEAL'
  | 'COLLECT_RESOURCE'
  | 'SEND_MESSAGE'
  | 'PROPOSE_DEAL'
  | 'ACCEPT_DEAL'
  | 'REJECT_DEAL'
  | 'BRIBE'
  | 'SPY'
  | 'SABOTAGE'
  | 'CALL_ALLIANCE'
  | 'BETRAY_ALLIANCE'
  | 'ACTIVATE_ABILITY'
  | 'PASS';

export interface AgentTurnResponse {
  thinking: string;
  speech?: {
    channel: string;
    content: string;
    targetId?: string;
    groupId?: string;
  };
  actions: AgentAction[];
}

export interface ValidationResult {
  isValid: boolean;
  rejectedActions: Array<{
    action: AgentAction;
    reason: string;
  }>;
  validActions: AgentAction[];
}
