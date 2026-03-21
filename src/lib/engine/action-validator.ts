import type { AgentAction, GameState, AgentGameState, ValidationResult } from '../types/game-state';

const MAX_ACTIONS_PER_TURN = 3;
const MAX_MOVEMENT_RANGE = 3;
const MAX_ATTACK_RANGE = 2;

export function validateActions(
  agentId: string,
  actions: AgentAction[],
  gameState: GameState
): ValidationResult {
  const agentState = gameState.agents[agentId];
  if (!agentState) {
    return { isValid: false, rejectedActions: actions.map(a => ({ action: a, reason: 'Agent not found' })), validActions: [] };
  }
  if (agentState.isEliminated) {
    return { isValid: false, rejectedActions: actions.map(a => ({ action: a, reason: 'Eliminated agents cannot act' })), validActions: [] };
  }

  let actionsToProcess = actions.slice(0, MAX_ACTIONS_PER_TURN);
  const validActions: AgentAction[] = [];
  const rejectedActions: Array<{ action: AgentAction; reason: string }> = [];

  if (actions.length > MAX_ACTIONS_PER_TURN) {
    actions.slice(MAX_ACTIONS_PER_TURN).forEach(a =>
      rejectedActions.push({ action: a, reason: `Exceeds max ${MAX_ACTIONS_PER_TURN} actions per turn` })
    );
  }

  for (const action of actionsToProcess) {
    const result = validateSingleAction(agentId, action, agentState, gameState);
    if (result.valid) {
      validActions.push(action);
    } else {
      rejectedActions.push({ action, reason: result.reason });
    }
  }

  return { isValid: rejectedActions.length === 0, rejectedActions, validActions };
}

function validateSingleAction(
  agentId: string,
  action: AgentAction,
  agentState: AgentGameState,
  gameState: GameState
): { valid: boolean; reason: string } {
  switch (action.type) {
    case 'MOVE': {
      if (!action.targetPosition) return { valid: false, reason: 'MOVE requires targetPosition' };
      const dist = Math.abs(action.targetPosition.x - agentState.position.x) +
                   Math.abs(action.targetPosition.y - agentState.position.y);
      if (dist > MAX_MOVEMENT_RANGE) return { valid: false, reason: `Move distance ${dist} exceeds max ${MAX_MOVEMENT_RANGE}` };
      if (action.targetPosition.x < 0 || action.targetPosition.y < 0 ||
          action.targetPosition.x >= gameState.board.width || action.targetPosition.y >= gameState.board.height) {
        return { valid: false, reason: 'Position out of bounds' };
      }
      const tile = gameState.board.tiles[action.targetPosition.y]?.[action.targetPosition.x];
      if (tile?.terrain === 'mountains' || tile?.terrain === 'water') {
        return { valid: false, reason: `Cannot move to ${tile.terrain} terrain` };
      }
      return { valid: true, reason: '' };
    }
    case 'ATTACK': {
      if (!action.targetId) return { valid: false, reason: 'ATTACK requires targetId' };
      const target = gameState.agents[action.targetId];
      if (!target) return { valid: false, reason: 'Target agent not found' };
      if (target.isEliminated) return { valid: false, reason: 'Cannot attack eliminated agent' };
      const dist = Math.abs(target.position.x - agentState.position.x) +
                   Math.abs(target.position.y - agentState.position.y);
      if (dist > MAX_ATTACK_RANGE) return { valid: false, reason: `Attack range ${dist} exceeds max ${MAX_ATTACK_RANGE}` };
      return { valid: true, reason: '' };
    }
    case 'BRIBE': {
      if (!action.targetId) return { valid: false, reason: 'BRIBE requires targetId' };
      const amount = (action.data?.amount as number) || 0;
      if (amount <= 0) return { valid: false, reason: 'Bribe amount must be positive' };
      if (agentState.credits < amount) return { valid: false, reason: `Insufficient credits: have ${agentState.credits}, need ${amount}` };
      return { valid: true, reason: '' };
    }
    case 'HEAL': {
      if (agentState.hp >= agentState.maxHp) return { valid: false, reason: 'Already at full HP' };
      if (agentState.credits < 200) return { valid: false, reason: 'Insufficient credits for heal (costs 200)' };
      return { valid: true, reason: '' };
    }
    case 'PROPOSE_DEAL':
    case 'ACCEPT_DEAL':
    case 'REJECT_DEAL':
    case 'DEFEND':
    case 'COLLECT_RESOURCE':
    case 'SPY':
    case 'SABOTAGE':
    case 'CALL_ALLIANCE':
    case 'BETRAY_ALLIANCE':
    case 'ACTIVATE_ABILITY':
    case 'PASS':
      return { valid: true, reason: '' };
    default:
      return { valid: false, reason: `Unknown action type: ${action.type}` };
  }
}
