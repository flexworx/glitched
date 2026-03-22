import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { action, target, agentId, matchId } = body;

  if (!action || !agentId || !matchId) {
    return NextResponse.json({ valid: false, reason: 'Missing required fields' }, { status: 400 });
  }

  const validActions = ['attack', 'defend', 'negotiate', 'betray', 'ally', 'observe', 'retreat', 'heal', 'sabotage', 'inspire'];
  if (!validActions.includes(action)) {
    return NextResponse.json({ valid: false, reason: `Invalid action: ${action}. Must be one of: ${validActions.join(', ')}` });
  }

  return NextResponse.json({ valid: true, reason: null, modifiedAction: null, penalty: null });
}
