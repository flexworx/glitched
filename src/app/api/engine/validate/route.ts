import { NextRequest, NextResponse } from 'next/server';
import { validateActions } from '@/lib/engine/action-validator';
import type { AgentAction, GameState } from '@/lib/types/game-state';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, actions, target, agentId, gameState } = body;

  if (!agentId) {
    return NextResponse.json({ valid: false, reason: 'Missing required field: agentId' }, { status: 400 });
  }

  if (!gameState) {
    return NextResponse.json({ valid: false, reason: 'Missing required field: gameState' }, { status: 400 });
  }

  // Support both single action and actions array
  let actionsToValidate: AgentAction[];
  if (actions && Array.isArray(actions)) {
    actionsToValidate = actions;
  } else if (action) {
    // Normalize: if action is a string (legacy format), wrap it as an AgentAction
    if (typeof action === 'string') {
      actionsToValidate = [{ type: action.toUpperCase() as AgentAction['type'], targetId: target }];
    } else {
      actionsToValidate = [action];
    }
  } else {
    return NextResponse.json({ valid: false, reason: 'Missing required field: action or actions' }, { status: 400 });
  }

  const result = validateActions(agentId, actionsToValidate, gameState as GameState);

  return NextResponse.json({
    valid: result.isValid,
    validActions: result.validActions,
    rejectedActions: result.rejectedActions,
    reason: result.isValid
      ? null
      : result.rejectedActions.map(r => r.reason).join('; '),
  });
}
